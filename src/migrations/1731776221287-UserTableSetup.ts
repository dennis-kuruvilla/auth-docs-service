import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserTableSetup1731776221287 implements MigrationInterface {
  name = 'UserTableSetup1731776221287';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create "roles" table
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"),
        CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
      )
    `);

    // Create "users" table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" bytea,
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    // Create "user_roles" table
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "user_id" uuid NOT NULL,
        "role_id" uuid NOT NULL,
        CONSTRAINT "PK_23ed6f04fe43066df08379fd034" PRIMARY KEY ("user_id", "role_id")
      )
    `);

    // Create indexes for "user_roles"
    await queryRunner.query(`
      CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles" ("role_id")
    `);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "user_roles"
      ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "user_roles"
      ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    // Insert default roles
    await queryRunner.query(`
      INSERT INTO "roles" ("name") VALUES
      ('admin'),
      ('editor'),
      ('viewer')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(`
      ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"
    `);
    await queryRunner.query(`
      ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"
    `);

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX "public"."IDX_b23c65e50a758245a33ee35fda"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"
    `);

    // Drop tables
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
