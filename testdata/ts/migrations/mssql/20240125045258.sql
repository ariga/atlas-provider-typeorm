-- Create "user" table
CREATE TABLE [user] (
  [id] int IDENTITY (1, 1) NOT NULL,
  [firstName] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [lastName] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [age] int NOT NULL,
  CONSTRAINT [PK_user] PRIMARY KEY CLUSTERED ([id] ASC),
  CONSTRAINT [CHK_70c8a9c9c39b98f399c28b8700] CHECK ([age]>(6))
);
-- Create index "UQ_c322cd2084cd4b1b2813a900320" to table: "user"
CREATE UNIQUE NONCLUSTERED INDEX [UQ_c322cd2084cd4b1b2813a900320] ON [user] ([firstName] ASC, [lastName] ASC);
-- Create index "IDX_USER_AGE" to table: "user"
CREATE NONCLUSTERED INDEX [IDX_USER_AGE] ON [user] ([age] ASC);
-- Create "blog" table
CREATE TABLE [blog] (
  [id] int IDENTITY (1, 1) NOT NULL,
  [title] nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  [userId] int NULL,
  CONSTRAINT [PK_blog] PRIMARY KEY CLUSTERED ([id] ASC),
 
  CONSTRAINT [FK_fc46ede0f7ab797b7ffacb5c08d] FOREIGN KEY ([userId]) REFERENCES [user] ([id]) ON UPDATE NO ACTION ON DELETE NO ACTION
);
