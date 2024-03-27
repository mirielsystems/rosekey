/*
 * SPDX-FileCopyrightText: 16439s and syuilo and misskey-project...etc
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class AddStripeSubscriptionId1707235738636 {
    name = 'AddStripeSubscriptionId1707235738636'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "stripeSubscriptionId" character varying(128)`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "stripeSubscriptionId"`);
    }
}
