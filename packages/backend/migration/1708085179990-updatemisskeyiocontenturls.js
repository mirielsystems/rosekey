/*
 * SPDX-FileCopyrightText: 16439s
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class UpdateMisskeyIoContentUrls1708085179990 {
    name = 'UpdateMisskeyIoContentUrls1708085179990';

    async up(queryRunner) {
        // Update avatarUrl in public.user table
        await queryRunner.query(`
            UPDATE "public"."user"
            SET "avatarUrl" = REPLACE("avatarUrl", 'misskeyusercontent.com', 'misskeyusercontent.jp')
            WHERE "avatarUrl" LIKE '%misskeyusercontent.com%';
        `);

        // Update originalUrl in public.emoji table
        await queryRunner.query(`
            UPDATE "public"."emoji"
            SET "originalUrl" = REPLACE("originalUrl", 'misskeyusercontent.com', 'misskeyusercontent.jp')
            WHERE "originalUrl" LIKE '%misskeyusercontent.com%';
        `);

        // Update publicUrl in public.emoji table
        await queryRunner.query(`
            UPDATE "public"."emoji"
            SET "publicUrl" = REPLACE("publicUrl", 'misskeyusercontent.com', 'misskeyusercontent.jp')
            WHERE "publicUrl" LIKE '%misskeyusercontent.com%';
        `);

        // Update url, uri, src in public.drive_file table
        await queryRunner.query(`
            UPDATE "public"."drive_file"
            SET "url" = REPLACE("url", 'misskeyusercontent.com', 'misskeyusercontent.jp'),
                "uri" = REPLACE("uri", 'misskeyusercontent.com', 'misskeyusercontent.jp'),
                "src" = REPLACE("src", 'misskeyusercontent.com', 'misskeyusercontent.jp')
            WHERE "url" LIKE '%misskeyusercontent.com%'
               OR "uri" LIKE '%misskeyusercontent.com%'
               OR "src" LIKE '%misskeyusercontent.com%';
        `);
    }

    async down(queryRunner) {
        // Revert the updates if needed
        // This section will contain the code to revert the changes made in the 'up' function
        // It's important to ensure your down function can revert the changes safely
    }
}
