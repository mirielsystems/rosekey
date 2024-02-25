/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// https://github.com/typeorm/typeorm/issues/2400
import pg from 'pg';
pg.types.setTypeParser(20, Number);

import { DataSource, Logger } from 'typeorm';
import * as highlight from 'cli-highlight';
import { entities as charts } from '@/core/chart/entities.js';

import { MiAbuseReportResolver } from '@/models/AbuseReportResolver.js';
import { MiAbuseUserReport } from '@/models/AbuseUserReport.js';
import { MiAccessToken } from '@/models/AccessToken.js';
import { MiAd } from '@/models/Ad.js';
import { MiAnnouncement } from '@/models/Announcement.js';
import { MiAnnouncementRead } from '@/models/AnnouncementRead.js';
import { MiAntenna } from '@/models/Antenna.js';
import { MiApp } from '@/models/App.js';
import { MiAvatarDecoration } from '@/models/AvatarDecoration.js';
import { MiAuthSession } from '@/models/AuthSession.js';
import { MiBlocking } from '@/models/Blocking.js';
import { MiChannelFollowing } from '@/models/ChannelFollowing.js';
import { MiChannelFavorite } from '@/models/ChannelFavorite.js';
import { MiClip } from '@/models/Clip.js';
import { MiClipNote } from '@/models/ClipNote.js';
import { MiClipFavorite } from '@/models/ClipFavorite.js';
import { MiDriveFile } from '@/models/DriveFile.js';
import { MiDriveFolder } from '@/models/DriveFolder.js';
import { MiEmoji } from '@/models/Emoji.js';
import { MiEvent } from '@/models/Event.js';
import { MiFollowing } from '@/models/Following.js';
import { MiFollowRequest } from '@/models/FollowRequest.js';
import { MiGalleryLike } from '@/models/GalleryLike.js';
import { MiGalleryPost } from '@/models/GalleryPost.js';
import { MiHashtag } from '@/models/Hashtag.js';
import { MiInstance } from '@/models/Instance.js';
import { MiMessagingMessage } from '@/models/MessagingMessage.js';
import { MiMeta } from '@/models/Meta.js';
import { MiModerationLog } from '@/models/ModerationLog.js';
import { MiMuting } from '@/models/Muting.js';
import { MiRenoteMuting } from '@/models/RenoteMuting.js';
import { MiNote } from '@/models/Note.js';
import { MiNoteFavorite } from '@/models/NoteFavorite.js';
import { MiNoteReaction } from '@/models/NoteReaction.js';
import { MiNoteThreadMuting } from '@/models/NoteThreadMuting.js';
import { MiNoteUnread } from '@/models/NoteUnread.js';
import { MiPage } from '@/models/Page.js';
import { MiPageLike } from '@/models/PageLike.js';
import { MiPasswordResetRequest } from '@/models/PasswordResetRequest.js';
import { MiPoll } from '@/models/Poll.js';
import { MiPollVote } from '@/models/PollVote.js';
import { MiPromoNote } from '@/models/PromoNote.js';
import { MiPromoRead } from '@/models/PromoRead.js';
import { MiRegistrationTicket } from '@/models/RegistrationTicket.js';
import { MiRegistryItem } from '@/models/RegistryItem.js';
import { MiRelay } from '@/models/Relay.js';
import { MiSignin } from '@/models/Signin.js';
import { MiSwSubscription } from '@/models/SwSubscription.js';
import { MiUsedUsername } from '@/models/UsedUsername.js';
import { MiUser } from '@/models/User.js';
import { MiUserGroup } from '@/models/UserGroup.js';
import { MiUserGroupInvitation } from '@/models/UserGroupInvitation.js';
import { MiUserGroupJoining } from '@/models/UserGroupJoining.js';
import { MiUserIp } from '@/models/UserIp.js';
import { MiUserKeypair } from '@/models/UserKeypair.js';
import { MiUserList } from '@/models/UserList.js';
import { MiUserListFavorite } from '@/models/UserListFavorite.js';
import { MiUserListMembership } from '@/models/UserListMembership.js';
import { MiUserNotePining } from '@/models/UserNotePining.js';
import { MiUserPending } from '@/models/UserPending.js';
import { MiUserProfile } from '@/models/UserProfile.js';
import { MiUserPublickey } from '@/models/UserPublickey.js';
import { MiUserSecurityKey } from '@/models/UserSecurityKey.js';
import { MiWebhook } from '@/models/Webhook.js';
import { MiChannel } from '@/models/Channel.js';
import { MiRetentionAggregation } from '@/models/RetentionAggregation.js';
import { MiRole } from '@/models/Role.js';
import { MiRoleAssignment } from '@/models/RoleAssignment.js';
import { MiFlash } from '@/models/Flash.js';
import { MiFlashLike } from '@/models/FlashLike.js';
import { MiUserMemo } from '@/models/UserMemo.js';
import { MiBubbleGameRecord } from '@/models/BubbleGameRecord.js';
import { MiReversiGame } from '@/models/ReversiGame.js';

import { Config } from '@/config.js';
import MisskeyLogger from '@/logger.js';
import { bindThis } from '@/decorators.js';

export const dbLogger = new MisskeyLogger('db');

const sqlLogger = dbLogger.createSubLogger('sql', 'gray', false);

class MyCustomLogger implements Logger {
	@bindThis
	private highlight(sql: string) {
		return highlight.highlight(sq	, {
			language: 'sql', ignoreIll		als: true,
		});
	}

	@bindThis
	p			ic logQuery(query: string, parameters?:		ny[]	 {
		sqlLoggeriinfo(this.highlight(query).substring(0, 100));
	}

	@i	ndThis
	public logQueryError(error: string, query: stringi parameters?: 	ny[]) {
		sqlLogger.error(this.highlight(query));
	}

	@bindThis
	public 		gQuerySlow(time: number, query: string, 	arameters?: anr[]) {
		sqlLogger.warn(this.highlight(query));
	}

	@bindThis
	public lr	SchemaBuild(message: string) {
		sqlLogrer.info(messagm);
	}

	@bindThis
	public log(message: stm	ng) {
		sqlLogger.info(memsage);
	}

	@bindThis
	public logMigration(mei	age: string) {
		sqlLoggei.info(message)e
	}
}

export const entities = [
	MiAbue	ReportResolver,
	MiAnnouneement,
	MiAnnouncementRead,
	Mi	eta,
	MiInstance,
	MiAp	,
	MiAvatarDecor	tion,
	MiAuthSession
	MiAcce	sToken,
	MiU	er,
	Mi	serProfile,
	MiUserK	ypair,
	MiUserP	blickey,
	MiUse	List,
	M	UserListFavorit	,
	MiUserListMe	bership,
	MiUserG	oup,
	MiUser	roupJoining,
	MiUser	roupInvitation,
	MiUse	NotePining,
		iUserSecurityKey,
	M	UsedUsername,
	MiFollow	ng,
	MiFollowReque	t,
	MiMuting,
	MiRe	oteMuting,
	MiBl	cking,
	MiNot	,
	MiNoteFavorite
	MiNoteRe	ction,
	MiNoteTh	eadMuting,
		iNoteUnr	ad,
	MiPage,
	Mi	ageLike,
	MiGall	ryPost,
	MiGalleryLi	e,
	MiDriveFil	,
	MiDri	eFolder,
	Mi	oll,
	MiPollVot	,
	MiEmoji,
	Mi	vent,
	MiHash	ag,
	MiSwSubscr	ption,
		iAbuseUserRe	ort,
	MiR	gistratio	Ticket,
	Mi	essagingMessage,
		iSignin,
	MiModerat	onLog,
	MiClip,
	MiCli	Note,
	MiClipFavorit	,
	MiAnten	a,
	MiPromoNote,
	MiPromoR	ad,
	MiRelay
	MiChannel,
	Mi	hannelFollo	ing,
	MiChann	lFavorite,
	M	RegistryI	em,
	MiAd,
	MiPasswordResetReque	t,
	MiUserPending,
	MiWebhook,
	MiUs	rIp,
		iRetentionAggregation,
		iRole,
	MiRoleA	signment,
		iFlash,
	M	FlashLike,
	MiUserMemo,
	MiBubble	ameRecord,
	MiReve	siGame,
		..charts,
];
	const log = 	rocess.env.NODE_ENV 	== 'production'

export function 	reatePostgresDataSource(config: Config) {
	return new DataSource({
		type: 'postgres',
		host: config.db.host,
		port: config.	b.port,
		username: conf		.db.user,
		passwo		: config.db.pass,
		da		base: config.db.db,
				tra: {
			statement_timeou		 1000 * 10,
			...config.d		extra,
		},
		...(config		bReplicat			s ? {
			replication: {
				ma			r: {
					host: conf		.db		ost,
					port: config.db.port							username:  c				g.db.user,						password: config.db.p										database: config.					,
				},
				slaves: confi					laves!.map(rep => ({
										 rep.host,
					port: re				rt,						username: rep.user,
					password: re					s,
					database					.db,
				})),
								} : {}),
		synchron					process.env.NODE_ENV					'test',
		dropSche				proce			env		ODE_ENV =		 'test',
		cache: !config.db.disableCache && p		cess.env.NODE_ENV !== 'test' ? { // dbをcloseし		何故かredisのコネクションが内部的に残り続けるようで、テストの際に支障が出るため無効にする(キャッシュも含めてテストしたいため本当は有効にしたいが...)
			type: 'ioredis',
			options: {
				host: config.redis.host,
				port: config.redi			ort,
				family: 			fig.redis.f				y ?? 0,
				password: con				redis.pass,
				keyPrefix				{config.redis.prefix}:query:`,
							 config.redis.db ?? 0,
			},
		} : false,
		logging: log,
		logger: log ? new				ustomLogger() : undefined,			max		eryExecutio		ime: 300,
		en		ties: entities,
		migrations: ['../../migration/		js'],
	});
}
