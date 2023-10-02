-- Create "user" table
CREATE TABLE "public"."user" (
  "id" serial NOT NULL,
  "firstName" character varying NOT NULL,
  "lastName" character varying NOT NULL,
  "age" integer NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "CHK_70c8a9c9c39b98f399c28b8700" CHECK (age > 6)
);
-- Create index "IDX_USER_AGE" to table: "user"
CREATE INDEX "IDX_USER_AGE" ON "public"."user" ("age");
-- Create index "UQ_c322cd2084cd4b1b2813a900320" to table: "user"
CREATE UNIQUE INDEX "UQ_c322cd2084cd4b1b2813a900320" ON "public"."user" ("firstName", "lastName");
-- Create "blog" table
CREATE TABLE "public"."blog" (
  "id" serial NOT NULL,
  "title" character varying NOT NULL,
  "userId" integer NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "FK_fc46ede0f7ab797b7ffacb5c08d" FOREIGN KEY ("userId") REFERENCES "public"."user" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
