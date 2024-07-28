/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class RepositoryUrlFromSyuiloToMisskeyDev1708266695091 {
    name = 'RepositoryUrlFromSyuiloToMisskeyDev1708266695091'

    async up(queryRunner) {
        await queryRunner.query(`UPDATE "meta" SET "repositoryUrl" = 'https://github.com/mirielsystems/rosekey' WHERE "repositoryUrl" = 'https://code.rosekey.dev/miriel/rosekey'`);
        await queryRunner.query(`UPDATE "meta" SET "feedbackUrl" = 'https://github.com/mirielsystems/rosekey/issues/new/choose' WHERE "feedbackUrl" = 'https://code.rosekey.dev/miriel/rosekey/issues/new'`);
    }

    async down(queryRunner) {
        // no valid down migration
    }
}
