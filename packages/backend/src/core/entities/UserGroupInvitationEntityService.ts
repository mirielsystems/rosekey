import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { UserGroupInvitationsRepository } from '@/models/_.js';
import { awaitAll } from '@/misc/prelude/await-all.js';
import type { Packed } from '@/misc/schema.js';
import type { } from '@/models/Blocking.js';
import type { User } from '@/models/User.js';
import type { UserGroupInvitation } from '@/models/UserGroupInvitation.js';
import { bindThis } from '@/decorators.js';
import { UserEntityService } from './UserEntityService.js';
import { UserGroupEntityService } from './UserGroupEntityService.js';

@Injectable()
export class UserGroupInvitationEntityService {
	constructor(
		@Inject(DI.userGroupInvitationsRepository)
		private userGroupInvitationsRepository: UserGroupInvitationsRepository,

		private userGroupEntityService: UserGroupEntityService,
	) {
	}

	@bindThis
	public async pack(
		src: UserGroupInvitation['id'] | UserGroupInvitation,
	) {
		const invitation = typeof src === 'object' ? src : await this.userGroupInvitationsRepository.findOneByOrFail({ id: src });

		return {
			id: invitation.id,
			group: await this.userGroupEntityService.pack(invitation.userGroup ?? invitation.userGroupId),
		};
	}

	@bindThis
	public packMany(
		invitations: any[],
	) {
		return Promise.all(invitations.map(x => this.pack(x)));
	}
}

