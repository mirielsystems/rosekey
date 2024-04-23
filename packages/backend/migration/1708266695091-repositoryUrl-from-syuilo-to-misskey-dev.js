/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class RepositoryUrlFromSyuiloToMisskeyDev1708266695091 {
    name = 'RepositoryUrlFromSyuiloToMisskeyDev1708266695091'

    async up(queryRunner) {
        await queryRunner.query(`UPDATE "meta" SET "repositoryUrl" = 'https://code.16439s.dev/16439s/rosekey' WHERE "repositoryUrl" = 'https://github.com/syuilo/misskey'`);
    }

    async down(queryRunner) {
        // no valid down migration
    }
}
