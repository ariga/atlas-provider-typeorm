-- atlas:pos category[type=table] entities/Category.js
-- atlas:pos post[type=table] entities/Post.js

CREATE TABLE "post" ("id" int NOT NULL IDENTITY(1,1), "title" varchar(255) NOT NULL, "text" text NOT NULL, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"));
CREATE TABLE "category" ("id" int NOT NULL IDENTITY(1,1), "name" varchar(255) NOT NULL, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"));
CREATE TABLE "post_categories_category" ("postId" int NOT NULL, "categoryId" int NOT NULL, CONSTRAINT "PK_91306c0021c4901c1825ef097ce" PRIMARY KEY ("postId", "categoryId"));
CREATE INDEX "IDX_93b566d522b73cb8bc46f7405b" ON "post_categories_category" ("postId") ;
CREATE INDEX "IDX_a5e63f80ca58e7296d5864bd2d" ON "post_categories_category" ("categoryId") ;
ALTER TABLE "post_categories_category" ADD CONSTRAINT "FK_93b566d522b73cb8bc46f7405bd" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_categories_category" ADD CONSTRAINT "FK_a5e63f80ca58e7296d5864bd2d3" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE