import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentsTable1731848961077 implements MigrationInterface {
  name = 'CreateDocumentsTable1731848961077';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."documents_status_enum" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED')
        `);
    await queryRunner.query(`
            CREATE TABLE "documents" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying(255) NOT NULL,
                "description" text,
                "fileUrl" character varying(500) NOT NULL,
                "mimeType" character varying(100),
                "fileSize" bigint,
                "status" "public"."documents_status_enum" NOT NULL DEFAULT 'DRAFT',
                "version" character varying(50) NOT NULL DEFAULT '1.0.0',
                "isDeleted" boolean NOT NULL DEFAULT false,
                "publishedAt" TIMESTAMP,
                "revision" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "author_id" uuid,
                "last_updated_by_id" uuid,
                CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_553906d54e4e79077bc641a648" ON "documents" ("title")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_709389d904fa03bdf5ec84998d" ON "documents" ("status")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_f8cc10f6d16ee343bbf23b829e" ON "documents" ("createdAt")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_3ae92d698be07180310a1c9151" ON "documents" ("updatedAt")
        `);
    await queryRunner.query(`
            ALTER TABLE "documents"
            ADD CONSTRAINT "FK_85d4e65f38815d121b87e9ed7aa" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "documents"
            ADD CONSTRAINT "FK_5e353a28904a2d628105894c5f3" FOREIGN KEY ("last_updated_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "documents" DROP CONSTRAINT "FK_5e353a28904a2d628105894c5f3"
        `);
    await queryRunner.query(`
            ALTER TABLE "documents" DROP CONSTRAINT "FK_85d4e65f38815d121b87e9ed7aa"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_3ae92d698be07180310a1c9151"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_f8cc10f6d16ee343bbf23b829e"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_709389d904fa03bdf5ec84998d"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_553906d54e4e79077bc641a648"
        `);
    await queryRunner.query(`
            DROP TABLE "documents"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."documents_status_enum"
        `);
  }
}
