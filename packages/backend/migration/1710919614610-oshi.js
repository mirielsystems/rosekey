export class Oshi1710919614610 {
    name = "Oshi1710919614610";

    async up(queryRunner) {
        // Add oshi column
        await queryRunner.query(`
            ALTER TABLE "user_profile"
            ADD "oshi" character varying(128) NULL
        `);
        // Comment on the oshi column
        await queryRunner.query(`
            COMMENT ON COLUMN "user_profile"."oshi"
            IS 'You can register your support.'
        `);

        // Add oshistartdate column
        await queryRunner.query(`
            ALTER TABLE "user_profile"
            ADD "oshistartdate" date NULL
        `);
    }
}
