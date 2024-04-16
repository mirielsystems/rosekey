import { PrimaryColumn, Entity, Index, JoinColumn, Column, ManyToOne } from 'typeorm';
import { id } from './util/id.js';
import { MiUser } from './User.js';
import { MiDriveFile } from './DriveFile.js';
import { UserGroup } from './UserGroup.js';

@Entity()
export class MessagingMessage {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column('timestamp with time zone', {
		comment: 'The created date of the MessagingMessage.',
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		comment: 'The sender user ID.',
	})
	public userId: MiUser['id'];

	@ManyToOne(type => MiUser, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public user: MiUser | null;

	@Index()
	@Column({
		...id(), nullable: true,
		comment: 'The recipient user ID.',
	})
	public recipientId: MiUser['id'] | null;

	@ManyToOne(type => MiUser, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public recipient: MiUser | null;

	@Index()
	@Column({
		...id(), nullable: true,
		comment: 'The recipient group ID.',
	})
	public groupId: UserGroup['id'] | null;

	@ManyToOne(type => UserGroup, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public group: UserGroup | null;

	@Column('varchar', {
		length: 4096, nullable: true,
	})
	public text: string | null;

	@Column('boolean', {
		default: false,
	})
	public isRead: boolean;

	@Column('varchar', {
		length: 512, nullable: true,
	})
	public uri: string | null;

	@Column({
		...id(),
		array: true, default: '{}',
	})
	public reads: MiUser['id'][];

	@Column({
		...id(),
		nullable: true,
	})
	public fileId: MiDriveFile['id'] | null;

	@ManyToOne(type => MiDriveFile, {
		onDelete: 'CASCADE',
	})
	@JoinColumn()
	public file: MiDriveFile | null;
}
