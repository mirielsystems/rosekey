import { Inject, Injectable } from '@nestjs/common';
import type { UserGroupsRepository, UserGroupJoiningsRepository } from '@/models/index.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DI } from '@/di-symbols.js';
import { ApiError } from '../../../error.js';

export const meta = {
	tags: ['groups', 'users'],

	requireCredential: true,

	kind: 'write:user-groups',

	description: 'Leave a group. The owner of a group can not leave. They must transfer ownership or delete the group instead.',

	errors: {
		noSuchGroup: {
			message: 'No such group.',
			code: 'NO_SUCH_GROUP',
			id: '62780270-1f67-5dc0-daca-3eb510612e31',
		},

		youAreOwner: {
			message: 'Your are the owner.',
			code: 'YOU_ARE_OWNER',
			id: 'b6d6e0c2-ef8a-9bb8-653d-79f4a3107c69',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		groupId: { type: 'string', format: 'misskey:id' },
	},
	required: ['groupId'],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.userGroupsRepository)
		private userGroupsRepository: UserGroupsRepository,

		@Inject(DI.userGroupJoiningsRepository)
		private userGroupJoiningsRepository: UserGroupJoiningsRepository,
	) {
		super(meta, paramDef, async (ps, me) => {
			// Fetch the group
			const userGroup = await this.userGroupsRepository.findOneBy({
				id: ps.groupId,
			});

			if (userGroup == null) {
				throw new ApiError(meta.errors.noSuchGroup);
			}

			if (me.id === userGroup.userId) {
				throw new ApiError(meta.errors.youAreOwner);
			}

			await this.userGroupJoiningsRepository.delete({ userGroupId: userGroup.id, userId: me.id });
		});
	}
}
