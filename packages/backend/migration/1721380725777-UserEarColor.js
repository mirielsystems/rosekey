/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class UserEarColor1721380725777 {
    constructor() {
        this.name = 'UserEarColor1721380725777';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "outerEarColor" varchar(16)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "innerEarColor" varchar(16) NOT NULL DEFAULT 'df548f'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "outerEarColor"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "innerEarColor"`);
    }
}
