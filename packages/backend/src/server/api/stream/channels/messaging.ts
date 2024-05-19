/*
 * SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type { UserGroupJoiningsRepository, UsersRepository, MessagingMessagesRepository } from '@/models/_.js';
import type { MiUser, MiLocalUser, MiRemoteUser } from '@/models/User.js';
import type { MiUserGroup } from '@/models/UserGroup.js';
import { MessagingService } from '@/core/MessagingService.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import { DI } from '@/di-symbols.js';
import { bindThis } from '@/decorators.js';
import type { GlobalEvents } from '@/core/GlobalEventService.js';
import Channel from '../channel.js';

class MessagingChannel extends Channel {
	public readonly chName = 'messaging';
	public static shouldShare = false;
	public static requireCredential = true;

	private otherpartyId: string | null;
	private otherparty: MiUser | null;
	private groupId: string | null;
	private subCh: `messagingStream:${MiUser['id']}-${MiUser['id']}` | `messagingStream:${MiUserGroup['id']}`;
	private typers: Record<MiUser['id'], Date> = {};
	private emitTypersIntervalId: ReturnType<typeof setInterval>;

	constructor(
		private usersRepository: UsersRepository,
		private userGroupJoiningsRepository: UserGroupJoiningsRepository,
		private messagingMessagesRepository: MessagingMessagesRepository,
		private userEntityService: UserEntityService,
		private messagingService: MessagingService,

		id: string,
		connection: Channel['connection'],
	) {
		super(id, connection);
		//this.onEvent = this.onEvent.bind(this);
		//this.onMessage = this.onMessage.bind(this);
		//this.emitTypers = this.emitTypers.bind(this);
	}

	@bindThis
	public async init(params: any) {
		this.otherpartyId = params.otherparty;
		this.otherparty = this.otherpartyId ? await this.usersRepository.findOneByOrFail({ id: this.otherpartyId }) : null;
		this.groupId = params.group;

		// Check joining
		if (this.groupId) {
			const joining = await this.userGroupJoiningsRepository.findOneBy({
				userId: this.user!.id,
				userGroupId: this.groupId,
			});

			if (joining == null) {
				return;
			}
		}

		this.emitTypersIntervalId = setInterval(this.emitTypers, 5000);

		this.subCh = this.otherpartyId
			? `messagingStream:${this.user?.id}-${this.otherpartyId}`
			: `messagingStream:${this.groupId}`;

		// Subscribe messaging stream
		this.subscriber.on(this.subCh, this.onEvent);
	}

	@bindThis
	private onEvent(data: GlobalEvents['messaging']['payload'] | GlobalEvents['groupMessaging']['payload']) {
		if (data.type === 'typing') {
			const id = data.body;
			const begin = this.typers[id] == null;
			this.typers[id] = new Date();
			if (begin) {
				this.emitTypers();
			}
		} else {
			this.send(data);
		}
	}

	@bindThis
	public onMessage(type: string, body: any) {
		switch (type) {
			case 'read':
				if (this.otherpartyId) {
					this.messagingService.readUserMessagingMessage(this.user!.id, this.otherpartyId, [body.id]);

					// リモートユーザーからのメッセージだったら既読配信
					if (this.userEntityService.isLocalUser(this.user!) && this.userEntityService.isRemoteUser(this.otherparty!)) {
						this.messagingMessagesRepository.findOneBy({ id: body.id }).then(message => {
							if (message) this.messagingService.deliverReadActivity(this.user as MiLocalUser, this.otherparty as MiRemoteUser, message);
						});
					}
				} else if (this.groupId) {
					this.messagingService.readGroupMessagingMessage(this.user!.id, this.groupId, [body.id]);
				}
				break;
		}
	}

	@bindThis
	private async emitTypers() {
		const now = new Date();

		// Remove not typing users
		for (const [userId, date] of Object.entries(this.typers)) {
			if (now.getTime() - date.getTime() > 5000) delete this.typers[userId];
		}

		const users = await this.userEntityService.packMany(Object.keys(this.typers), null, { schema: 'UserLite' });

		this.send({
			type: 'typers',
			body: users,
		});
	}

	@bindThis
	public dispose() {
		this.subscriber.off(this.subCh, this.onEvent);

		clearInterval(this.emitTypersIntervalId);
	}
}

@Injectable()
export class MessagingChannelService {
	public readonly shouldShare = MessagingChannel.shouldShare;
	public readonly requireCredential = MessagingChannel.requireCredential;
	public readonly kind: string = 'messaging'; // kind の型を string に変更し、適切な値に設定する

	constructor(
		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.userGroupJoiningsRepository)
		private userGroupJoiningsRepository: UserGroupJoiningsRepository,

		@Inject(DI.messagingMessagesRepository)
		private messagingMessagesRepository: MessagingMessagesRepository,

		private userEntityService: UserEntityService,
		private messagingService: MessagingService,
	) {}

	@bindThis
	public create(id: string, connection: Channel['connection']): MessagingChannel {
		return new MessagingChannel(
			this.usersRepository,
			this.userGroupJoiningsRepository,
			this.messagingMessagesRepository,
			this.userEntityService,
			this.messagingService,
			id,
			connection,
		);
	}
}
