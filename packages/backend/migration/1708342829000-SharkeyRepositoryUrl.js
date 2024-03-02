/*
 * SPDX-FileCopyrightText: dakkar and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class SharkeyRepositoryUrl1708342829000 {
  name = 'SharkeyRepositoryUrl1708342829000'

  async up(queryRunner) {
    await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "repositoryUrl" SET DEFAULT 'https://activitypub.software/TransFem-org/Sharkey/'`);
    await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "feedbackUrl" SET DEFAULT 'https://activitypub.software/TransFem-org/Sharkey/-/issues/new'`);
    await queryRunner.query(`UPDATE "meta" SET "repositoryUrl"=DEFAULT WHERE "repositoryUrl" IN ('https://git.joinsharkey.org/Sharkey/Sharkey','https://github.com/transfem-org/sharkey','https://github.com/misskey-dev/misskey')`);
    await queryRunner.query(`UPDATE "meta" SET "feedbackUrl"=DEFAULT WHERE "feedbackUrl" IN ('https://git.joinsharkey.org/Sharkey/Sharkey/issues/new/choose','https://github.com/transfem-org/sharkey/issues/new','https://github.com/misskey-dev/misskey/issues/new')`);
  }

  async down(queryRunner) {
    await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "repositoryUrl" SET DEFAULT 'https://git.joinsharkey.org/Sharkey/Sharkey'`);
    await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "feedbackUrl" SET DEFAULT 'https://git.joinsharkey.org/Sharkey/Sharkey/issues/new/choose'`);
    await queryRunner.query(`UPDATE "meta" SET "repositoryUrl"=DEFAULT WHERE "repositoryUrl" IN ('https://git.joinsharkey.org/Sharkey/Sharkey','https://github.com/transfem-org/sharkey','https://github.com/misskey-dev/misskey')`);
    await queryRunner.query(`UPDATE "meta" SET "feedbackUrl"=DEFAULT WHERE "feedbackUrl" IN ('https://git.joinsharkey.org/Sharkey/Sharkey/issues/new/choose','https://github.com/transfem-org/sharkey/issues/new','https://github.com/misskey-dev/misskey/issues/new')`);
  }
}
