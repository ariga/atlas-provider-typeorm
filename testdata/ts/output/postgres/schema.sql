-- atlas:pos blog[type=table] entities/Blog.ts:5:13-14:2
-- atlas:pos user[type=table] entities/User.ts:21:13-44:2

CREATE TYPE "user_role_enum" AS ENUM('admin', 'editor', 'ghost');
CREATE TABLE "user" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "role" "user_role_enum" NOT NULL DEFAULT 'ghost', "age" integer NOT NULL, CONSTRAINT "UQ_c322cd2084cd4b1b2813a900320" UNIQUE ("firstName", "lastName"), CONSTRAINT "CHK_70c8a9c9c39b98f399c28b8700" CHECK ("age" > 6), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"));
CREATE INDEX "IDX_USER_AGE" ON "user" ("age") ;
CREATE TABLE "blog" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_85c6532ad065a448e9de7638571" PRIMARY KEY ("id"));
ALTER TABLE "blog" ADD CONSTRAINT "FK_fc46ede0f7ab797b7ffacb5c08d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION