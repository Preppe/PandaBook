import { MigrationInterface, QueryRunner } from "typeorm";

export class Books1741505297634 implements MigrationInterface {
    name = 'Books1741505297634'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audio" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bitrate" integer NOT NULL, "codec" character varying NOT NULL, "duration" integer NOT NULL, "format" character varying NOT NULL, "frequency" integer NOT NULL, "channels" integer NOT NULL, "size" integer NOT NULL, CONSTRAINT "PK_9562215b41192ae4ccdf314a789" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "book" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "author" character varying NOT NULL, "description" character varying, "cover" character varying, "audioId" uuid, CONSTRAINT "REL_7eb94f2a913cfd7c7a89ed7387" UNIQUE ("audioId"), CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_7eb94f2a913cfd7c7a89ed73872" FOREIGN KEY ("audioId") REFERENCES "audio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_7eb94f2a913cfd7c7a89ed73872"`);
        await queryRunner.query(`DROP TABLE "book"`);
        await queryRunner.query(`DROP TABLE "audio"`);
    }

}
