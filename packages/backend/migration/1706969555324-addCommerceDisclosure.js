/*
 * SPDX-FileCopyrightText: 16439s and syuilo and misskey-project...etc
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class AddCommerceDisclosure1706969555324 {
    name = 'AddCommerceDisclosure1706969555324'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "commerceDisclosureUrl" character varying(1024)`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "commerceDisclosureUrl"`);
    }
}
