/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { isUserRelated } from '@/misc/is-user-related.js';
import type { Packed } from '@/misc/json-schema.js';
import type { NotesRepository, UsersRepository } from '@/models/_.js';
import type { MiUser } from '@/models/User.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import { NoteEntityService } from '@/core/entities/NoteEntityService.js';
import { bindThis } from '@/decorators.js';
import Channel, { type MiChannelService } from '../channel.js';
import type { StreamMessages } from '../types.js';

class ChannelChannel extends Channel {
	public readonly chName = 'channel';
	public static shouldShare = false;
	public static requireCredential = false as const;
	private channelId: string;
	private typers: Record<User['id'], Date> = {};
	private emitTypersIntervalId: ReturnType<typeof setInterval>;

	constructor(
		private noteEntityService: NoteEntityService,
		private userEntityService: UserEntityService,

		id: string,
		connection: Channel['connection'],
	) {
		super(id, connection);
		//this.onNote = this.onNote.bind(this);
		//this.emitTypers = this.emitTypers.bind(this);
	}

	@bindThis
	public async init(params: any) {
		this.channelId = params.channelId as string;

		// Subscribe stream
		this.subscriber.on('notesStream', this.onNote);
		this.subscriber.on(`channelStream:${this.channelId}`, this.onEvent);
		this.emitTypersIntervalId = setInterval(this.emitTypers, 5000);
	}

	@bindThis
	private async onNote(note: Packed<'Note'>) {
		if (note.channelId !== this.channelId) return;

		// 流れてきたNoteがミュートしているユーザーが関わるものだったら無視する
		if (isUserRelated(note, this.userIdsWhoMeMuting)) return;
		// 流れてきたNoteがブロックされているユーザーが関わるものだったら無視する
		if (isUserRelated(note, this.userIdsWhoBlockingMe)) return;

		if (note.renote && !note.text && isUserRelated(note, this.userIdsWhoMeMutingRenotes)) return;

		if (this.user && note.renoteId && !note.text) {
			if (note.renote && Object.keys(note.renote.reactions).length > 0) {
				const myRenoteReaction = await this.noteEntityService.populateMyReaction(note.renote, this.user.id);
				note.renote.myReaction = myRenoteReaction;
			}
		}

		this.connection.cacheNote(note);

		this.send('note', note);
	}

	@bindThis
	private onEvent(data: StreamMessages['channel']['payload']) {
		if (data.type === 'typing') {
			const id = data.body;
			const begin = this.typers[id] == null;
			this.typers[id] = new Date();
			if (begin) {
				this.emitTypers();
			}
		}
	}

	@bindThis
	private async emitTypers() {
		const now = new Date();

		// Remove not typing users
		for (const [userId, date] of Object.entries(this.typers)) {
			if (now.getTime() - date.getTime() > 5000) delete this.typers[userId];
		}

		const users = await this.userEntityService.packMany(Object.keys(this.typers), null, { detail: false });

		this.send({
			type: 'typers',
			body: users,
		});
	}

	@bindThis
	public dispose() {
		// Unsubscribe events
		this.subscriber.off('notesStream', this.onNote);
		this.subscriber.off(`channelStream:${this.channelId}`, this.onEvent);

		clearInterval(this.emitTypersIntervalId);
	}
}

@Injectable()
export class ChannelChannelService implements MiChannelService<false> {
	public readonly shouldShare = ChannelChannel.shouldShare;
	public readonly requireCredential = ChannelChannel.requireCredential;
	public readonly kind = ChannelChannel.kind;

	constructor(
		private noteEntityService: NoteEntityService,
		private userEntityService: UserEntityService,
	) {
	}

	@bindThis
	public create(id: string, connection: Channel['connection']): ChannelChannel {
		return new ChannelChannel(
			this.noteEntityService,
			this.userEntityService,
			id,
			connection,
		);
	}
}
