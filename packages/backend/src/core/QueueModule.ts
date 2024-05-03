/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import * as Bull from 'bullmq';
import * as Redis from 'ioredis';
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';
import { QUEUE, baseQueueOptions } from '@/queue/const.js';
import { allSettled } from '@/misc/promise-tracker.js';
import type { Provider } from '@nestjs/common';
import type { DeliverJobData, InboxJobData, EndedPollNotificationJobData, WebhookDeliverJobData, RelationshipJobData, ScheduleNotePostJobData } from '../queue/types.js';

export type SystemQueue = Bull.Queue<Record<string, unknown>>;
export type EndedPollNotificationQueue = Bull.Queue<EndedPollNotificationJobData>;
export type ScheduleNotePostQueue = Bull.Queue<ScheduleNotePostJobData>;
export type DeliverQueue = Bull.Queue<DeliverJobData>;
export type InboxQueue = Bull.Queue<InboxJobData>;
export type DbQueue = Bull.Queue;
export type RelationshipQueue = Bull.Queue<RelationshipJobData>;
export type ObjectStorageQueue = Bull.Queue;
export type WebhookDeliverQueue = Bull.Queue<WebhookDeliverJobData>;

const $system: Provider = {
	provide: 'queue:system',
	useFactory: (config: Config, redisForJobQueue: Redis.Redis) => new Bull.Queue(QUEUE.SYSTEM, baseQueueOptions(config, QUEUE.SYSTEM, redisForJobQueue)),
	inject: [DI.config, DI.redisForJobQueue],
};

const $endedPollNotification: Provider = {
	provide: 'queue:endedPollNotification',
	useFactory: (config: Config, redisForJobQueue: Redis.Redis) => new Bull.Queue(QUEUE.ENDED_POLL_NOTIFICATION, baseQueueOptions(config, QUEUE.ENDED_POLL_NOTIFICATION, redisForJobQueue)),
	inject: [DI.config, DI.redisForJobQueue],
};

const $scheduleNotePost: Provider = {
	provide: 'queue:scheduleNotePost',
	useFactory: (config: Config) => new Bull.Queue(QUEUE.SCHEDULE_NOTE_POST, baseQueueOptions(config, QUEUE.SCHEDULE_NOTE_POST)),
	inject: [DI.config],
};

const $deliver: Provider = {
	provide: 'queue:deliver',
	useFactory: (config: Config, redisForJobQueue: Redis.Redis) => new Bull.Queue(QUEUE.DELIVER, baseQueueOptions(config, QUEUE.DELIVER, redisForJobQueue)),
	inject: [DI.config, DI.redisForJobQueue],
};

const $inbox: Provider = {
	provide: 'queue:inbox',
	useFactory: (config: Config, redisForJobQueue: Redis.Redis) => new Bull.Queue(QUEUE.INBOX, baseQueueOptions(config, QUEUE.INBOX, redisForJobQueue)),
	inject: [DI.config, DI.redisForJobQueue],
};

const $db: Provider = {
	provide: 'queue:db',
	useFactory: (config: Config, redisForJobQueue: Redis.Redis) => new Bull.Queue(QUEUE.DB, baseQueueOptions(config, QUEUE.DB, redisForJobQueue)),
	inject: [DI.config, DI.redisForJobQueue],
};

const $relationship: Provider = {
	provide: 'queue:relationship',
	useFactory: (config: Config, redisForJobQueue: Redis.Redis) => new Bull.Queue(QUEUE.RELATIONSHIP, baseQueueOptions(config, QUEUE.RELATIONSHIP, redisForJobQueue)),
	inject: [DI.config, DI.redisForJobQueue],
};

const $objectStorage: Provider = {
	provide: 'queue:objectStorage',
	useFactory: (config: Config, redisForJobQueue: Redis.Redis) => new Bull.Queue(QUEUE.OBJECT_STORAGE, baseQueueOptions(config, QUEUE.OBJECT_STORAGE, redisForJobQueue)),
	inject: [DI.config, DI.redisForJobQueue],
};

const $webhookDeliver: Provider = {
	provide: 'queue:webhookDeliver',
	useFactory: (config: Config, redisForJobQueue: Redis.Redis) => new Bull.Queue(QUEUE.WEBHOOK_DELIVER, baseQueueOptions(config, QUEUE.WEBHOOK_DELIVER, redisForJobQueue)),
	inject: [DI.config, DI.redisForJobQueue],
};

@Module({
	imports: [
	],
	providers: [
		$system,
		$endedPollNotification,
		$scheduleNotePost,
		$deliver,
		$inbox,
		$db,
		$relationship,
		$objectStorage,
		$webhookDeliver,
	],
	exports: [
		$system,
		$endedPollNotification,
		$scheduleNotePost,
		$deliver,
		$inbox,
		$db,
		$relationship,
		$objectStorage,
		$webhookDeliver,
	],
})
export class QueueModule implements OnApplicationShutdown {
	constructor(
		@Inject('queue:system') public systemQueue: SystemQueue,
		@Inject('queue:endedPollNotification') public endedPollNotificationQueue: EndedPollNotificationQueue,
		@Inject('queue:scheduleNotePost') public scheduleNotePostQueue: ScheduleNotePostQueue,
		@Inject('queue:deliver') public deliverQueue: DeliverQueue,
		@Inject('queue:inbox') public inboxQueue: InboxQueue,
		@Inject('queue:db') public dbQueue: DbQueue,
		@Inject('queue:relationship') public relationshipQueue: RelationshipQueue,
		@Inject('queue:objectStorage') public objectStorageQueue: ObjectStorageQueue,
		@Inject('queue:webhookDeliver') public webhookDeliverQueue: WebhookDeliverQueue,
	) {}

	public async dispose(): Promise<void> {
		// Wait for all potential queue jobs
		await allSettled();
		// And then close all queues
		await Promise.all([
			this.systemQueue.close(),
			this.endedPollNotificationQueue.close(),
			this.scheduleNotePostQueue.close(),
			this.deliverQueue.close(),
			this.inboxQueue.close(),
			this.dbQueue.close(),
			this.relationshipQueue.close(),
			this.objectStorageQueue.close(),
			this.webhookDeliverQueue.close(),
		]);
	}

	async onApplicationShutdown(signal: string): Promise<void> {
		await this.dispose();
	}
}
