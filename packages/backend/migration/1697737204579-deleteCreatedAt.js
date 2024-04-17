export class DeleteCreatedAt1697737204579 {
    name = 'DeleteCreatedAt1697737204579'

async up(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_e21cd3646e52ef9c94aaf17c2e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_20e30aa35180e317e133d75316"`);
        await queryRunner.query(`ALTER TABLE "messaging_message" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "user_group" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "user_group_invitation" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "user_group_invite" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "user_group_joining" DROP COLUMN "createdAt"`);
}

async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_group_joining" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_group_invite" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_group_invitation" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_group" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "messaging_message" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_20e30aa35180e317e133d75316" ON "user_group" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_e21cd3646e52ef9c94aaf17c2e" ON "messaging_message" ("createdAt") `);
}

}
