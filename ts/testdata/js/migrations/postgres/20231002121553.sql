-- Create "post" table
CREATE TABLE "public"."post" (
  "id" serial NOT NULL,
  "title" character varying NOT NULL,
  "text" text NOT NULL,
  PRIMARY KEY ("id")
);
-- Create "category" table
CREATE TABLE "public"."category" (
  "id" serial NOT NULL,
  "name" character varying NOT NULL,
  PRIMARY KEY ("id")
);
-- Create "post_categories_category" table
CREATE TABLE "public"."post_categories_category" (
  "postId" integer NOT NULL,
  "categoryId" integer NOT NULL,
  PRIMARY KEY ("postId", "categoryId"),
  CONSTRAINT "FK_93b566d522b73cb8bc46f7405bd" FOREIGN KEY ("postId") REFERENCES "public"."post" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "FK_a5e63f80ca58e7296d5864bd2d3" FOREIGN KEY ("categoryId") REFERENCES "public"."category" ("id") ON UPDATE CASCADE ON DELETE CASCADE
);
-- Create index "IDX_93b566d522b73cb8bc46f7405b" to table: "post_categories_category"
CREATE INDEX "IDX_93b566d522b73cb8bc46f7405b" ON "public"."post_categories_category" ("postId");
-- Create index "IDX_a5e63f80ca58e7296d5864bd2d" to table: "post_categories_category"
CREATE INDEX "IDX_a5e63f80ca58e7296d5864bd2d" ON "public"."post_categories_category" ("categoryId");
