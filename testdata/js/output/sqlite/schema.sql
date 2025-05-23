-- atlas:pos category[type=table] entities/Category.js
-- atlas:pos post[type=table] entities/Post.js

CREATE TABLE "post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "text" text NOT NULL);
CREATE TABLE "category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL);
CREATE TABLE "post_categories_category" ("postId" integer NOT NULL, "categoryId" integer NOT NULL, PRIMARY KEY ("postId", "categoryId"));
CREATE INDEX "IDX_93b566d522b73cb8bc46f7405b" ON "post_categories_category" ("postId") ;
CREATE INDEX "IDX_a5e63f80ca58e7296d5864bd2d" ON "post_categories_category" ("categoryId") ;
CREATE TABLE "temporary_post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "text" text NOT NULL);
INSERT INTO "temporary_post"("id", "title", "text") SELECT "id", "title", "text" FROM "post";
DROP TABLE "post";
ALTER TABLE "temporary_post" RENAME TO "post";
CREATE TABLE "temporary_category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL);
INSERT INTO "temporary_category"("id", "name") SELECT "id", "name" FROM "category";
DROP TABLE "category";
ALTER TABLE "temporary_category" RENAME TO "category";
DROP INDEX "IDX_93b566d522b73cb8bc46f7405b";
DROP INDEX "IDX_a5e63f80ca58e7296d5864bd2d";
CREATE TABLE "temporary_post_categories_category" ("postId" integer NOT NULL, "categoryId" integer NOT NULL, CONSTRAINT "FK_93b566d522b73cb8bc46f7405bd" FOREIGN KEY ("postId") REFERENCES "post" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_a5e63f80ca58e7296d5864bd2d3" FOREIGN KEY ("categoryId") REFERENCES "category" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("postId", "categoryId"));
INSERT INTO "temporary_post_categories_category"("postId", "categoryId") SELECT "postId", "categoryId" FROM "post_categories_category";
DROP TABLE "post_categories_category";
ALTER TABLE "temporary_post_categories_category" RENAME TO "post_categories_category";
CREATE INDEX "IDX_93b566d522b73cb8bc46f7405b" ON "post_categories_category" ("postId") ;
CREATE INDEX "IDX_a5e63f80ca58e7296d5864bd2d" ON "post_categories_category" ("categoryId")