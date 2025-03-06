-- Create "post" table
CREATE TABLE [post] (
  [id] int IDENTITY (1, 1) NOT NULL,
  [title] varchar(255) NOT NULL,
  [text] text NOT NULL,
  CONSTRAINT [PK_post] PRIMARY KEY CLUSTERED ([id] ASC)
);
-- Create "category" table
CREATE TABLE [category] (
  [id] int IDENTITY (1, 1) NOT NULL,
  [name] varchar(255) NOT NULL,
  CONSTRAINT [PK_category] PRIMARY KEY CLUSTERED ([id] ASC)
);
-- Create "post_categories_category" table
CREATE TABLE [post_categories_category] (
  [postId] int NOT NULL,
  [categoryId] int NOT NULL,
  CONSTRAINT [PK_post_categories_category] PRIMARY KEY CLUSTERED ([postId] ASC, [categoryId] ASC),
  CONSTRAINT [FK_93b566d522b73cb8bc46f7405bd] FOREIGN KEY ([postId]) REFERENCES [post] ([id]) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT [FK_a5e63f80ca58e7296d5864bd2d3] FOREIGN KEY ([categoryId]) REFERENCES [category] ([id]) ON UPDATE CASCADE ON DELETE CASCADE
);
-- Create index "IDX_93b566d522b73cb8bc46f7405b" to table: "post_categories_category"
CREATE NONCLUSTERED INDEX [IDX_93b566d522b73cb8bc46f7405b] ON [post_categories_category] ([postId] ASC);
-- Create index "IDX_a5e63f80ca58e7296d5864bd2d" to table: "post_categories_category"
CREATE NONCLUSTERED INDEX [IDX_a5e63f80ca58e7296d5864bd2d] ON [post_categories_category] ([categoryId] ASC);
