/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import ms from 'ms';
import { In } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import type { MiUser } from '@/models/User.js';
import type { UsersRepository, NotesRepository, ScheduledNotesRepository, BlockingsRepository, DriveFilesRepository, ChannelsRepository } from '@/models/_.js';
import type { MiNoteCreateOption } from '@/types.js';
import type { MiDriveFile } from '@/models/DriveFile.js';
import type { MiNote } from '@/models/Note.js';
import type { MiChannel } from '@/models/Channel.js';
import { MAX_NOTE_TEXT_LENGTH } from '@/const.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { NoteEntityService } from '@/core/entities/NoteEntityService.js';
import { NoteCreateService } from '@/core/NoteCreateService.js';
import { QueueService } from '@/core/QueueService.js';
import { IdService } from '@/core/IdService.js';
import { RoleService } from '@/core/RoleService.js';
import { DI } from '@/di-symbols.js';
import { isQuote, isRenote } from '@/misc/is-renote.js';
import { MetaService } from '@/core/MetaService.js';
import { UtilityService } from '@/core/UtilityService.js';
import { IdentifiableError } from '@/misc/identifiable-error.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['notes'],

	requireCredential: true,

	prohibitMoved: true,

	limit: {
		duration: ms('1hour'),
		max: 300,
	},

	kind: 'write:notes',

	res: {
		type: 'object',
		optional: false, nullable: false,
		properties: {
			createdNote: {
				type: 'object',
				optional: false, nullable: true,
				ref: 'Note',
			},
			scheduledNoteId: {
				type: 'string',
				optional: true, nullable: true,
			},
			scheduledNote: {
				type: 'object',
				optional: true, nullable: true,
			},
		},
	},

	errors: {
		noSuchRenoteTarget: {
			message: 'No such renote target.',
			code: 'NO_SUCH_RENOTE_TARGET',
			id: 'b5c90186-4ab0-49c8-9bba-a1f76c282ba4',
		},

		cannotReRenote: {
			message: 'You can not Renote a pure Renote.',
			code: 'CANNOT_RENOTE_TO_A_PURE_RENOTE',
			id: 'fd4cc33e-2a37-48dd-99cc-9b806eb2031a',
		},

		cannotRenoteDueToVisibility: {
			message: 'You can not Renote due to target visibility.',
			code: 'CANNOT_RENOTE_DUE_TO_VISIBILITY',
			id: 'be9529e9-fe72-4de0-ae43-0b363c4938af',
		},

		noSuchReplyTarget: {
			message: 'No such reply target.',
			code: 'NO_SUCH_REPLY_TARGET',
			id: '749ee0f6-d3da-459a-bf02-282e2da4292c',
		},

		cannotReplyToInvisibleNote: {
			message: 'You cannot reply to an invisible Note.',
			code: 'CANNOT_REPLY_TO_AN_INVISIBLE_NOTE',
			id: 'b98980fa-3780-406c-a935-b6d0eeee10d1',
		},

		cannotReplyToPureRenote: {
			message: 'You can not reply to a pure Renote.',
			code: 'CANNOT_REPLY_TO_A_PURE_RENOTE',
			id: '3ac74a84-8fd5-4bb0-870f-01804f82ce15',
		},

		cannotReplyToSpecifiedVisibilityNoteWithExtendedVisibility: {
			message: 'You cannot reply to a specified visibility note with extended visibility.',
			code: 'CANNOT_REPLY_TO_SPECIFIED_VISIBILITY_NOTE_WITH_EXTENDED_VISIBILITY',
			id: 'ed940410-535c-4d5e-bfa3-af798671e93c',
		},

		cannotCreateAlreadyExpiredPoll: {
			message: 'Poll is already expired.',
			code: 'CANNOT_CREATE_ALREADY_EXPIRED_POLL',
			id: '04da457d-b083-4055-9082-955525eda5a5',
		},

		noSuchChannel: {
			message: 'No such channel.',
			code: 'NO_SUCH_CHANNEL',
			id: 'b1653923-5453-4edc-b786-7c4f39bb0bbb',
		},

		youHaveBeenBlocked: {
			message: 'You have been blocked by this user.',
			code: 'YOU_HAVE_BEEN_BLOCKED',
			id: 'b390d7e1-8a5e-46ed-b625-06271cafd3d3',
		},

		noSuchFile: {
			message: 'Some files are not found.',
			code: 'NO_SUCH_FILE',
			id: 'b6992544-63e7-67f0-fa7f-32444b1b5306',
		},

		cannotRenoteOutsideOfChannel: {
			message: 'Cannot renote outside of channel.',
			code: 'CANNOT_RENOTE_OUTSIDE_OF_CHANNEL',
			id: '33510210-8452-094c-6227-4a6c05d99f00',
		},

		containsProhibitedWords: {
			message: 'Cannot post because it contains prohibited words.',
			code: 'CONTAINS_PROHIBITED_WORDS',
			id: 'aa6e01d3-a85c-669d-758a-76aab43af334',
		},

		containsTooManyMentions: {
			message: 'Cannot post because it exceeds the allowed number of mentions.',
			code: 'CONTAINS_TOO_MANY_MENTIONS',
			id: '4de0363a-3046-481b-9b0f-feff3e211025',
		},
		cannotCreateAlreadyExpiredSchedule: {
			message: 'Schedule is already expired.',
			code: 'CANNOT_CREATE_ALREADY_EXPIRED_SCHEDULE',
			id: '8a9bfb90-fc7e-4878-a3e8-d97faaf5fb07',
		},
		specifyScheduleDate: {
			message: 'Please specify schedule date.',
			code: 'PLEASE_SPECIFY_SCHEDULE_DATE',
			id: 'c93a6ad6-f7e2-4156-a0c2-3d03529e5e0f',
		},
		noSuchSchedule: {
			message: 'No such schedule.',
			code: 'NO_SUCH_SCHEDULE',
			id: '44dee229-8da1-4a61-856d-e3a4bbc12032',
		},
		rolePermissionDenied: {
			message: 'You are not assigned to a required role.',
			code: 'ROLE_PERMISSION_DENIED',
			kind: 'permission',
			id: '7f86f06f-7e15-4057-8561-f4b6d4ac755a',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		visibility: { type: 'string', enum: ['public', 'home', 'followers', 'specified'], default: 'public' },
		visibleUserIds: { type: 'array', uniqueItems: true, items: {
			type: 'string', format: 'misskey:id',
		} },
		cw: { type: 'string', nullable: true, minLength: 1, maxLength: 100 },
		localOnly: { type: 'boolean', default: false },
		reactionAcceptance: { type: 'string', nullable: true, enum: [null, 'likeOnly', 'likeOnlyForRemote', 'nonSensitiveOnly', 'nonSensitiveOnlyForLocalLikeOnlyForRemote'], default: null },
		disableRightClick: { type: 'boolean', default: false },
		noExtractMentions: { type: 'boolean', default: false },
		noExtractHashtags: { type: 'boolean', default: false },
		noExtractEmojis: { type: 'boolean', default: false },
		replyId: { type: 'string', format: 'misskey:id', nullable: true },
		renoteId: { type: 'string', format: 'misskey:id', nullable: true },
		channelId: { type: 'string', format: 'misskey:id', nullable: true },

		// anyOf内にバリデーションを書いても最初の一つしかチェックされない
		// See https://github.com/misskey-dev/misskey/pull/10082
		text: {
			type: 'string',
			minLength: 1,
			maxLength: MAX_NOTE_TEXT_LENGTH,
			nullable: true,
		},
		fileIds: {
			type: 'array',
			uniqueItems: true,
			minItems: 1,
			maxItems: 16,
			items: { type: 'string', format: 'misskey:id' },
		},
		mediaIds: {
			type: 'array',
			uniqueItems: true,
			minItems: 1,
			maxItems: 16,
			items: { type: 'string', format: 'misskey:id' },
		},
		poll: {
			type: 'object',
			nullable: true,
			properties: {
				choices: {
					type: 'array',
					uniqueItems: true,
					minItems: 2,
					maxItems: 10,
					items: { type: 'string', minLength: 1, maxLength: 50 },
				},
				multiple: { type: 'boolean' },
				expiresAt: { type: 'integer', nullable: true },
				expiredAfter: { type: 'integer', nullable: true, minimum: 1 },
			},
			required: ['choices'],
		},
		event: {
			type: 'object',
			nullable: true,
			properties: {
				title: { type: 'string', minLength: 1, maxLength: 128, nullable: false },
				start: { type: 'integer', nullable: false },
				end: { type: 'integer', nullable: true },
				metadata: { type: 'object' },
			},
		},
		schedule: {
			type: 'object',
			nullable: true,
			properties: {
				scheduledAt: { type: 'string', nullable: false },
			},
		},
	},
	// (re)note with text, files and poll are optional
	if: {
		properties: {
			renoteId: {
				type: 'null',
			},
			fileIds: {
				type: 'null',
			},
			mediaIds: {
				type: 'null',
			},
			poll: {
				type: 'null',
			},
			schedule: {
				type: 'null',
			},
		},
	},
	then: {
		properties: {
			text: {
				type: 'string',
				minLength: 1,
				maxLength: MAX_NOTE_TEXT_LENGTH,
				pattern: '[^\\s]+',
			},
		},
		required: ['text'],
	},
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		@Inject(DI.scheduledNotesRepository)
		private scheduledNotesRepository: ScheduledNotesRepository,

		@Inject(DI.blockingsRepository)
		private blockingsRepository: BlockingsRepository,

		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		@Inject(DI.channelsRepository)
		private channelsRepository: ChannelsRepository,

		private noteEntityService: NoteEntityService,
		private noteCreateService: NoteCreateService,

		private roleService: RoleService,
		private queueService: QueueService,
    private idService: IdService,
	) {
		super(meta, paramDef, async (ps, me) => {
			let visibleUsers: MiUser[] = [];
			if (ps.visibleUserIds) {
				visibleUsers = await this.usersRepository.findBy({
					id: In(ps.visibleUserIds),
				});
			}

			let files: MiDriveFile[] = [];
			const fileIds = ps.fileIds ?? ps.mediaIds ?? null;
			if (fileIds != null) {
				files = await this.driveFilesRepository.createQueryBuilder('file')
					.where('file.userId = :userId AND file.id IN (:...fileIds)', {
						userId: me.id,
						fileIds,
					})
					.orderBy('array_position(ARRAY[:...fileIds], "id"::text)')
					.setParameters({ fileIds })
					.getMany();

				if (files.length !== fileIds.length) {
					throw new ApiError(meta.errors.noSuchFile);
				}
			}

			let renote: MiNote | null = null;
			if (ps.renoteId != null) {
				// Fetch renote to note
				renote = await this.notesRepository.findOneBy({ id: ps.renoteId });

				if (renote == null) {
					throw new ApiError(meta.errors.noSuchRenoteTarget);
				} else if (isRenote(renote) && !isQuote(renote)) {
					throw new ApiError(meta.errors.cannotReRenote);
				}

				// Check blocking
				if (renote.userId !== me.id) {
					const blockExist = await this.blockingsRepository.exists({
						where: {
							blockerId: renote.userId,
							blockeeId: me.id,
						},
					});
					if (blockExist) {
						throw new ApiError(meta.errors.youHaveBeenBlocked);
					}
				}

				if (renote.visibility === 'followers' && renote.userId !== me.id) {
					// 他人のfollowers noteはreject
					throw new ApiError(meta.errors.cannotRenoteDueToVisibility);
				} else if (renote.visibility === 'specified') {
					// specified / direct noteはreject
					throw new ApiError(meta.errors.cannotRenoteDueToVisibility);
				}

				if (renote.channelId && renote.channelId !== ps.channelId) {
					// チャンネルのノートに対しリノート要求がきたとき、チャンネル外へのリノート可否をチェック
					// リノートのユースケースのうち、チャンネル内→チャンネル外は少数だと考えられるため、JOINはせず必要な時に都度取得する
					const renoteChannel = await this.channelsRepository.findOneBy({ id: renote.channelId });
					if (renoteChannel == null) {
						// リノートしたいノートが書き込まれているチャンネルが無い
						throw new ApiError(meta.errors.noSuchChannel);
					} else if (!renoteChannel.allowRenoteToExternal) {
						// リノート作成のリクエストだが、対象チャンネルがリノート禁止だった場合
						throw new ApiError(meta.errors.cannotRenoteOutsideOfChannel);
					}
				}
			}

			let reply: MiNote | null = null;
			if (ps.replyId != null) {
				// Fetch reply
				reply = await this.notesRepository.findOneBy({ id: ps.replyId });

				if (reply == null) {
					throw new ApiError(meta.errors.noSuchReplyTarget);
				} else if (isRenote(reply) && !isQuote(reply)) {
					throw new ApiError(meta.errors.cannotReplyToPureRenote);
				} else if (!await this.noteEntityService.isVisibleForMe(reply, me.id)) {
					throw new ApiError(meta.errors.cannotReplyToInvisibleNote);
				} else if (reply.visibility === 'specified' && ps.visibility !== 'specified') {
					throw new ApiError(meta.errors.cannotReplyToSpecifiedVisibilityNoteWithExtendedVisibility);
				}

				// Check blocking
				if (reply.userId !== me.id) {
					const blockExist = await this.blockingsRepository.exists({
						where: {
							blockerId: reply.userId,
							blockeeId: me.id,
						},
					});
					if (blockExist) {
						throw new ApiError(meta.errors.youHaveBeenBlocked);
					}
				}
			}

			if (ps.poll) {
				if (typeof ps.poll.expiresAt === 'number') {
					if (ps.poll.expiresAt < Date.now()) {
						throw new ApiError(meta.errors.cannotCreateAlreadyExpiredPoll);
					}
				} else if (typeof ps.poll.expiredAfter === 'number') {
					ps.poll.expiresAt = Date.now() + ps.poll.expiredAfter;
				}
			}

			let channel: MiChannel | null = null;
			if (ps.channelId != null) {
				channel = await this.channelsRepository.findOneBy({ id: ps.channelId, isArchived: false });

				if (channel == null) {
					throw new ApiError(meta.errors.noSuchChannel);
				}
			}

			// 投稿を作成
			try {
				const note : MiNoteCreateOption  = {
					createdAt: new Date(),
					files: files,
					poll: ps.poll ? {
						choices: ps.poll.choices,
						multiple: ps.poll.multiple ?? false,
						expiresAt: ps.poll.expiresAt ? new Date(ps.poll.expiresAt) : null,
					} : undefined,
					text: ps.text ?? undefined,
					reply,
					renote,
					cw: ps.cw,
					localOnly: ps.localOnly,
					reactionAcceptance: ps.reactionAcceptance,
					visibility: ps.visibility,
					visibleUsers,
					channel,
					apMentions: ps.noExtractMentions ? [] : undefined,
					apHashtags: ps.noExtractHashtags ? [] : undefined,
					apEmojis: ps.noExtractEmojis ? [] : undefined,
				};

				if (ps.schedule) {
					// 予約投稿
					const canCreateScheduledNote = (await this.roleService.getUserPolicies(me.id)).canScheduleNote;
					if (!canCreateScheduledNote) {
						throw new ApiError(meta.errors.rolePermissionDenied);
					}

					if (!ps.schedule.scheduledAt) {
						throw new ApiError(meta.errors.specifyScheduleDate);
					}

					me.token = null;
					const scheduledNoteId = this.idService.gen(new Date().getTime());
					await this.scheduledNotesRepository.insert({
						id: scheduledNoteId,
						note: note,
						userId: me.id,
						scheduledAt: new Date(ps.schedule.scheduledAt),
					});

					const delay = new Date(ps.schedule.scheduledAt).getTime() - Date.now();
					await this.queueService.ScheduleNotePostQueue.add(delay.toString(), {
						scheduledNoteId,
					}, {
						jobId: scheduledNoteId,
						delay,
						removeOnComplete: true,
					});

					return {
						scheduledNoteId,
						scheduledNote: note,

						// ↓互換性のため（微妙）
						createdNote: null,
					};
				} else {
					// 投稿を作成
					const createdNoteRaw = await this.noteCreateService.create(me, note);
					return {
						createdNote: await this.noteEntityService.pack(createdNoteRaw, me),
					};
				}
			} catch (e) {
				// TODO: 他のErrorもここでキャッチしてエラーメッセージを当てるようにしたい
				if (e instanceof IdentifiableError) {
					if (e.id === '689ee33f-f97c-479a-ac49-1b9f8140af99') {
						throw new ApiError(meta.errors.containsProhibitedWords);
					} else if (e.id === '9f466dab-c856-48cd-9e65-ff90ff750580') {
						throw new ApiError(meta.errors.containsTooManyMentions);
					}
				}
				throw e;
			}
		});
	}
}