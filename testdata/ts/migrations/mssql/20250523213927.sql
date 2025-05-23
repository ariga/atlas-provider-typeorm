-- Create "user" table
CREATE TABLE [user] (
  [id] int IDENTITY (1, 1) NOT NULL,
  [firstName] nvarchar(255) NOT NULL,
  [lastName] nvarchar(255) NOT NULL,
  [age] int NOT NULL,
  CONSTRAINT [PK_cace4a159ff9f2512dd42373760] PRIMARY KEY CLUSTERED ([id] ASC),
  CONSTRAINT [CHK_70c8a9c9c39b98f399c28b8700] CHECK ([age]>(6)),
  CONSTRAINT [UQ_c322cd2084cd4b1b2813a900320] UNIQUE ([firstName] ASC, [lastName] ASC)
);
-- Create index "IDX_USER_AGE" to table: "user"
CREATE NONCLUSTERED INDEX [IDX_USER_AGE] ON [user] ([age] ASC);
-- Create "blog" table
CREATE TABLE [blog] (
  [id] int IDENTITY (1, 1) NOT NULL,
  [title] nvarchar(255) NOT NULL,
  [userId] int NULL,
  CONSTRAINT [PK_85c6532ad065a448e9de7638571] PRIMARY KEY CLUSTERED ([id] ASC),
  CONSTRAINT [FK_fc46ede0f7ab797b7ffacb5c08d] FOREIGN KEY ([userId]) REFERENCES [user] ([id]) ON UPDATE NO ACTION ON DELETE NO ACTION
);
