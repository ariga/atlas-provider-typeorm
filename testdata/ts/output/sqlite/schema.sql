-- atlas:pos blog[type=table] entities/sqlite/Blog.ts:5:13-14:2
-- atlas:pos user[type=table] entities/sqlite/User.ts:15:13-31:2

CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "age" integer NOT NULL, CONSTRAINT "UQ_c322cd2084cd4b1b2813a900320" UNIQUE ("firstName", "lastName"), CONSTRAINT "CHK_70c8a9c9c39b98f399c28b8700" CHECK ("age" > 6));
CREATE INDEX "IDX_USER_AGE" ON "user" ("age") ;
CREATE TABLE "blog" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "userId" integer);
DROP INDEX "IDX_USER_AGE";
CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "age" integer NOT NULL, CONSTRAINT "UQ_c322cd2084cd4b1b2813a900320" UNIQUE ("firstName", "lastName"), CONSTRAINT "CHK_70c8a9c9c39b98f399c28b8700" CHECK ("age" > 6));
INSERT INTO "temporary_user"("id", "firstName", "lastName", "age") SELECT "id", "firstName", "lastName", "age" FROM "user";
DROP TABLE "user";
ALTER TABLE "temporary_user" RENAME TO "user";
CREATE INDEX "IDX_USER_AGE" ON "user" ("age") ;
CREATE TABLE "temporary_blog" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "userId" integer, CONSTRAINT "FK_fc46ede0f7ab797b7ffacb5c08d" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION);
INSERT INTO "temporary_blog"("id", "title", "userId") SELECT "id", "title", "userId" FROM "blog";
DROP TABLE "blog";
ALTER TABLE "temporary_blog" RENAME TO "blog"