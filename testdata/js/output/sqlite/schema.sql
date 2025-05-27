-- atlas:pos author[type=table] entities/blog/Author.js:1:16-10:2
-- atlas:pos blog[type=table] entities/Blog.js:2:21-11:2
-- atlas:pos category[type=table] entities/Category.js:2:35-14:2
-- atlas:pos post[type=table] entities/Post.js:2:21-25:2

CREATE TABLE "post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "title" varchar NOT NULL, "text" text NOT NULL);
CREATE TABLE "category" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL);
CREATE TABLE "blog" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL);
CREATE TABLE "author" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL);
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
CREATE TABLE "temporary_blog" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL);
INSERT INTO "temporary_blog"("id") SELECT "id" FROM "blog";
DROP TABLE "blog";
ALTER TABLE "temporary_blog" RENAME TO "blog";
CREATE TABLE "temporary_author" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL);
INSERT INTO "temporary_author"("id") SELECT "id" FROM "author";
DROP TABLE "author";
ALTER TABLE "temporary_author" RENAME TO "author";
DROP INDEX "IDX_93b566d522b73cb8bc46f7405b";
DROP INDEX "IDX_a5e63f80ca58e7296d5864bd2d";
CREATE TABLE "temporary_post_categories_category" ("postId" integer NOT NULL, "categoryId" integer NOT NULL, CONSTRAINT "FK_93b566d522b73cb8bc46f7405bd" FOREIGN KEY ("postId") REFERENCES "post" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_a5e63f80ca58e7296d5864bd2d3" FOREIGN KEY ("categoryId") REFERENCES "category" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("postId", "categoryId"));
INSERT INTO "temporary_post_categories_category"("postId", "categoryId") SELECT "postId", "categoryId" FROM "post_categories_category";
DROP TABLE "post_categories_category";
ALTER TABLE "temporary_post_categories_category" RENAME TO "post_categories_category";
CREATE INDEX "IDX_93b566d522b73cb8bc46f7405b" ON "post_categories_category" ("postId") ;
CREATE INDEX "IDX_a5e63f80ca58e7296d5864bd2d" ON "post_categories_category" ("categoryId")