-- Create enum type "user_role_enum"
CREATE TYPE "public"."user_role_enum" AS ENUM ('admin', 'editor', 'ghost');
-- Create "user" table
CREATE TABLE "public"."user" (
  "id" serial NOT NULL,
  "firstName" character varying NOT NULL,
  "lastName" character varying NOT NULL,
  "role" "public"."user_role_enum" NOT NULL DEFAULT 'ghost',
  "age" integer NOT NULL,
  CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_c322cd2084cd4b1b2813a900320" UNIQUE ("firstName", "lastName"),
  CONSTRAINT "CHK_70c8a9c9c39b98f399c28b8700" CHECK (age > 6)
);
-- Create index "IDX_USER_AGE" to table: "user"
CREATE INDEX "IDX_USER_AGE" ON "public"."user" ("age");
-- Create "blog" table
CREATE TABLE "public"."blog" (
  "id" serial NOT NULL,
  "title" character varying NOT NULL,
  "userId" integer NULL,
  CONSTRAINT "PK_85c6532ad065a448e9de7638571" PRIMARY KEY ("id"),
  CONSTRAINT "FK_fc46ede0f7ab797b7ffacb5c08d" FOREIGN KEY ("userId") REFERENCES "public"."user" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
