-- atlas:pos blog[type=table] entities/mssql/Blog.ts:5:13-14:2
-- atlas:pos user[type=table] entities/mssql/User.ts:15:13-31:2

CREATE TABLE "blog" ("id" int NOT NULL IDENTITY(1,1), "title" nvarchar(255) NOT NULL, "userId" int, CONSTRAINT "PK_85c6532ad065a448e9de7638571" PRIMARY KEY ("id"));
CREATE TABLE "user" ("id" int NOT NULL IDENTITY(1,1), "firstName" nvarchar(255) NOT NULL, "lastName" nvarchar(255) NOT NULL, "age" int NOT NULL, CONSTRAINT "UQ_c322cd2084cd4b1b2813a900320" UNIQUE ("firstName", "lastName"), CONSTRAINT "CHK_70c8a9c9c39b98f399c28b8700" CHECK ("age" > 6), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"));
CREATE INDEX "IDX_USER_AGE" ON "user" ("age") ;
ALTER TABLE "blog" ADD CONSTRAINT "FK_fc46ede0f7ab797b7ffacb5c08d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION