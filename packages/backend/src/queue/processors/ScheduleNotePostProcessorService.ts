/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type Logger from '@/logger.js';
import { bindThis } from '@/decorators.js';
import { NoteCreateService } from '@/core/NoteCreateService.js';
import type { ScheduledNotesRepository, UsersRepository } from '@/models/_.js';
import { DI } from '@/di-symbols.js';
import { NotificationService } from '@/core/NotificationService.js';
import { QueueLoggerService } from '../QueueLoggerService.js';
import type * as Bull from 'bullmq';
import type { ScheduleNotePostJobData } from '../types.js';

@Injectable()
export class ScheduleNotePostProcessorService {
	private logger: Logger;

	constructor(
		@Inject(DI.scheduledNotesRepository)
		private scheduledNotesRepository: ScheduledNotesRepository,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,
		private notificationService: NotificationService,
		private noteCreateService: NoteCreateService,
		private queueLoggerService: QueueLoggerService,
	) {
		this.logger = this.queueLoggerService.logger.createSubLogger('schedule-note-post');
	}

	@bindThis
	public async process(job: Bull.Job<ScheduleNotePostJobData>): Promise<void> {
		this.scheduledNotesRepository.findOneBy({ id: job.data.scheduledNoteId }).then(async (data) => {
			if (!data) {
				this.logger.warn(`Schedule note ${job.data.scheduledNoteId} not found`);
			} else {
				data.note.createdAt = new Date();
				if (data.scheduledAt.getTime() > data.note.createdAt.getTime()) {
					await this.scheduledNotesRepository.update(data.id, { isFailed: true });

					await this.notificationService.createNotification(data.userId, 'noteSchedulingFailed', {
						scheduledNoteId: data.id,
					});
					return;
				}

				const me = await this.usersRepository.findOneByOrFail({ id: data.userId });
				data.note.isScheduled = true;
				await this.noteCreateService.create(me, data.note);
				await this.scheduledNotesRepository.remove(data);
			}
		});
	}
}
