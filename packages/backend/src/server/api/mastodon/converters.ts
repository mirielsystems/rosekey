import { Inject, Injectable } from '@nestjs/common';
import { Entity } from 'megalodon';
import mfm from 'mfm-js';
import { DI } from '@/di-symbols.js';
import { MfmService } from '@/core/MfmService.js';
import type { Config } from '@/config.js';
import type { IMentionedRemoteUsers } from '@/models/Note.js';
import type { MiUser } from '@/models/User.js';
import type { NotesRepository, UserProfilesRepository, UsersRepository } from '@/models/_.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import { awaitAll } from '@/misc/prelude/await-all.js';
import { CustomEmojiService } from '@/core/CustomEmojiService.js';
import { GetterService } from '../GetterService.js';
import { ReactionService } from '@/core/ReactionService.js';

export enum IdConvertType {
    MastodonId,
    SharkeyId,
}

export const escapeMFM = (text: string): string => text
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;')
	.replace(/'/g, '&#39;')
	.replace(/`/g, '&#x60;')
	.replace(/\r?\n/g, '<br>');

@Injectable()
export class MastoConverters {
	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.userProfilesRepository)
		private userProfilesRepository: UserProfilesRepository,

		private mfmService: MfmService,
		private getterService: GetterService,
		private customEmojiService: CustomEmojiService,
		private reactionService: ReactionService,
	) {
	}

	private encode(u: MiUser, m: IMentionedRemoteUsers): Entity.Mention {
		let acct = u.username;
		let acctUrl = `https://${u.host || this.config.host}/@${u.username}`;
		let url: string | null = null;
		if (u.host) {
			const info = m.find(r => r.username === u.username && r.host === u.host);
			acct = `${u.username}@${u.host}`;
			acctUrl = `https://${u.host}/@${u.username}`;
			if (info) url = info.url ?? info.uri;
		}
		return {
			id: u.id,
			username: u.username,
			acct: acct,
			url: url ?? acctUrl,
		};
	}

	public async getUser(id: string): Promise<MiUser> {
		return this.getterService.getUser(id).then(p => {
			return p;
		});
	}

	private async encodeField(f: Entity.Field): Promise<Entity.Field> {
		return {
			name: f.name,
			value: await this.mfmService.toMastoHtml(mfm.parse(f.value), [], true) ?? escapeMFM(f.value),
			verified_at: null,
		};
	}

	public async convertAccount(account: Entity.Account) {
		const user = await this.getUser(account.id);
		const profile = await this.userProfilesRepository.findOneBy({ userId: user.id });
		const emojis = await this.customEmojiService.populateEmojis(user.emojis, user.host ? user.host : this.config.host);
		const emoji: Entity.Emoji[] = [];
		Object.entries(emojis).forEach(entry => {
			const [key, value] = entry;
			emoji.push({
				shortcode: key,
				static_url: value,
				url: value,
				visible_in_picker: true,
				category: undefined,
			});
		});
		return awaitAll({
			id: account.id,
			username: account.username,
			acct: account.acct,
			fqn: account.fqn,
			display_name: account.display_name || account.username,
			locked: user.isLocked,
			created_at: account.created_at,
			followers_count: user.followersCount,
			following_count: user.followingCount,
			statuses_count: user.notesCount,
			note: profile?.description ?? account.note,
			url: account.url,
			avatar: user.avatarUrl ? user.avatarUrl : 'https://dev.joinsharkey.org/static-assets/avatar.png',
			avatar_static: user.avatarUrl ? user.avatarUrl : 'https://dev.joinsharkey.org/static-assets/avatar.png',
			header: user.bannerUrl ? user.bannerUrl : 'https://dev.joinsharkey.org/static-assets/transparent.png',
			header_static: user.bannerUrl ? user.bannerUrl : 'https://dev.joinsharkey.org/static-assets/transparent.png',
			emojis: emoji,
			moved: null, //FIXME
			fields: Promise.all(profile?.fields.map(async p => this.encodeField(p)) ?? []),
			bot: user.isBot,
			discoverable: user.isExplorable,
		});
	}

	public async convertStatus(status: Entity.Status) {
		const convertedAccount = this.convertAccount(status.account);
		const note = await this.getterService.getNote(status.id);
		const noteUser = await this.getUser(status.account.id);

		const reactionEmojiNames = Object.keys(note.reactions)
			.filter(x => x.startsWith(':') && x.includes('@') && !x.includes('@.'))
			.map(x => this.reactionService.decodeReaction(x).reaction.replaceAll(':', ''));

		const emojis = await this.customEmojiService.populateEmojis(reactionEmojiNames, noteUser.host ? noteUser.host : this.config.host);
		const emoji: Entity.Emoji[] = [];
		Object.entries(emojis).forEach(entry => {
			const [key, value] = entry;
			emoji.push({
				shortcode: key,
				static_url: value,
				url: value,
				visible_in_picker: true,
				category: undefined,
			});
		});

		const mentions = Promise.all(note.mentions.map(p =>
			this.getUser(p)
				.then(u => this.encode(u, JSON.parse(note.mentionedRemoteUsers)))
				.catch(() => null)))
			.then(p => p.filter(m => m)) as Promise<Entity.Mention[]>;

		const content = note.text !== null
			? this.mfmService.toMastoHtml(mfm.parse(note.text!), JSON.parse(note.mentionedRemoteUsers), false, null)
				.then(p => p ?? escapeMFM(note.text!))
			: '';

		const tags = note.tags.map(tag => {
			return {
				name: tag,
				url: `${this.config.url}/tags/${tag}`,
			} as Entity.Tag;
		});

		// noinspection ES6MissingAwait
		return await awaitAll({
			id: note.id,
			uri: note.uri ?? `https://${this.config.host}/notes/${note.id}`,
			url: note.url ?? note.uri ?? `https://${this.config.host}/notes/${note.id}`,
			account: convertedAccount,
			in_reply_to_id: note.replyId,
			in_reply_to_account_id: note.replyUserId,
			reblog: status.reblog,
			content: content,
			content_type: 'text/x.misskeymarkdown',
			text: note.text,
			created_at: status.created_at,
			emojis: emoji,
			replies_count: note.repliesCount,
			reblogs_count: note.renoteCount,
			favourites_count: status.favourites_count,
			reblogged: false,
			favourited: status.favourited,
			muted: status.muted,
			sensitive: status.sensitive,
			spoiler_text: note.cw ? note.cw : '',
			visibility: status.visibility,
			media_attachments: status.media_attachments,
			mentions: mentions,
			tags: tags,
			card: null, //FIXME
			poll: status.poll ?? null,
			application: null, //FIXME
			language: null, //FIXME
			pinned: null,
			reactions: status.emoji_reactions,
			emoji_reactions: status.emoji_reactions,
			bookmarked: false,
			quote: false,
			edited_at: note.updatedAt?.toISOString(),
		});
	}
}

function simpleConvert(data: any) {
	// copy the object to bypass weird pass by reference bugs
	const result = Object.assign({}, data);
	return result;
}

export function convertAccount(account: Entity.Account) {
	return simpleConvert(account);
}
export function convertAnnouncement(announcement: Entity.Announcement) {
	return simpleConvert(announcement);
}
export function convertAttachment(attachment: Entity.Attachment) {
	return simpleConvert(attachment);
}
export function convertFilter(filter: Entity.Filter) {
	return simpleConvert(filter);
}
export function convertList(list: Entity.List) {
	return simpleConvert(list);
}
export function convertFeaturedTag(tag: Entity.FeaturedTag) {
	return simpleConvert(tag);
}

export function convertNotification(notification: Entity.Notification) {
	notification.account = convertAccount(notification.account);
	if (notification.status) notification.status = convertStatus(notification.status);
	return notification;
}

export function convertPoll(poll: Entity.Poll) {
	return simpleConvert(poll);
}
export function convertReaction(reaction: Entity.Reaction) {
	if (reaction.accounts) {
		reaction.accounts = reaction.accounts.map(convertAccount);
	}
	return reaction;
}
export function convertRelationship(relationship: Entity.Relationship) {
	return simpleConvert(relationship);
}

export function convertStatus(status: Entity.Status) {
	status.account = convertAccount(status.account);
	status.media_attachments = status.media_attachments.map((attachment) =>
		convertAttachment(attachment),
	);
	if (status.poll) status.poll = convertPoll(status.poll);
	if (status.reblog) status.reblog = convertStatus(status.reblog);

	return status;
}

export function convertStatusSource(status: Entity.StatusSource) {
	return simpleConvert(status);
}

export function convertConversation(conversation: Entity.Conversation) {
	conversation.accounts = conversation.accounts.map(convertAccount);
	if (conversation.last_status) {
		conversation.last_status = convertStatus(conversation.last_status);
	}

	return conversation;
}
