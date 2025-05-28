-- Create "author" table
CREATE TABLE [author] (
  [id] int IDENTITY (1, 1) NOT NULL,
  CONSTRAINT [PK_5a0e79799d372fe56f2f3fa6871] PRIMARY KEY CLUSTERED ([id] ASC)
);
-- Create "blog" table
CREATE TABLE [blog] (
  [id] int IDENTITY (1, 1) NOT NULL,
  CONSTRAINT [PK_85c6532ad065a448e9de7638571] PRIMARY KEY CLUSTERED ([id] ASC)
);
-- Create "post" table
CREATE TABLE [post] (
  [id] int IDENTITY (1, 1) NOT NULL,
  [title] varchar(255) NOT NULL,
  [text] text NOT NULL,
  CONSTRAINT [PK_be5fda3aac270b134ff9c21cdee] PRIMARY KEY CLUSTERED ([id] ASC)
);
-- Create "category" table
CREATE TABLE [category] (
  [id] int IDENTITY (1, 1) NOT NULL,
  [name] varchar(255) NOT NULL,
  CONSTRAINT [PK_9c4e4a89e3674fc9f382d733f03] PRIMARY KEY CLUSTERED ([id] ASC)
);
-- Create "post_categories_category" table
CREATE TABLE [post_categories_category] (
  [postId] int NOT NULL,
  [categoryId] int NOT NULL,
  CONSTRAINT [PK_91306c0021c4901c1825ef097ce] PRIMARY KEY CLUSTERED ([postId] ASC, [categoryId] ASC),
  CONSTRAINT [FK_93b566d522b73cb8bc46f7405bd] FOREIGN KEY ([postId]) REFERENCES [post] ([id]) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT [FK_a5e63f80ca58e7296d5864bd2d3] FOREIGN KEY ([categoryId]) REFERENCES [category] ([id]) ON UPDATE CASCADE ON DELETE CASCADE
);
-- Create index "IDX_93b566d522b73cb8bc46f7405b" to table: "post_categories_category"
CREATE NONCLUSTERED INDEX [IDX_93b566d522b73cb8bc46f7405b] ON [post_categories_category] ([postId] ASC);
-- Create index "IDX_a5e63f80ca58e7296d5864bd2d" to table: "post_categories_category"
CREATE NONCLUSTERED INDEX [IDX_a5e63f80ca58e7296d5864bd2d] ON [post_categories_category] ([categoryId] ASC);
