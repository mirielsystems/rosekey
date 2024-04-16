import { PrimaryColumn, Entity, Index, JoinColumn, Column, ManyToOne } from 'typeorm';
import { id } from './util/id.js';
import { MiUser } from './User.js';
import { UserGroup } from './UserGroup.js';

@Entity()
@Index(['userId', 'userGroupId'], { unique: true })
export class UserGroupInvitation {
	@PrimaryColumn(id())
	public id: string;

	@Column('timestamp with time zone', {
		comment: 'The created date of the UserGroupInvitation.',
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		comment: 'The user ID.',
	})
	public userId: MiUser['id'];

	@ManyToOne(type => MiUser, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public user: MiUser | null;

	@Index()
	@Column({
		...id(),
		comment: 'The group ID.',
	})
	public userGroupId: UserGroup['id'];

	@ManyToOne(type => UserGroup, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public userGroup: UserGroup | null;
}
