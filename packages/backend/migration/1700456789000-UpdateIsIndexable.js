export class Updatenoindex1700456789000 {
    name = 'Updatenoindex1700456789000'

    async up(queryRunner) {
        // Rename column isindexable to noindex
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "isindexable" TO "noindex"`);
        
        // Set default value of noindex to false
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "noindex" SET DEFAULT false`);
        
        // Optionally update all existing records if needed
        await queryRunner.query(`UPDATE "user" SET "noindex" = NOT "noindex" WHERE "noindex" IS NULL`);
    }

//    async down(queryRunner) {
//        await queryRunner.query(`UPDATE "user" SET "noindex" = NOT "noindex"`);
//        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "noindex" SET DEFAULT true`);
//        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "noindex" TO "noindex"`);
//    }
}
