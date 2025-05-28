-- Create "post" table
CREATE TABLE `post` (
  `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  `title` varchar NOT NULL,
  `text` text NOT NULL
);
-- Create "category" table
CREATE TABLE `category` (
  `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  `name` varchar NOT NULL
);
-- Create "blog" table
CREATE TABLE `blog` (
  `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT
);
-- Create "author" table
CREATE TABLE `author` (
  `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT
);
-- Create "post_categories_category" table
CREATE TABLE `post_categories_category` (
  `postId` integer NOT NULL,
  `categoryId` integer NOT NULL,
  PRIMARY KEY (`postId`, `categoryId`),
  CONSTRAINT `FK_a5e63f80ca58e7296d5864bd2d3` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `FK_93b566d522b73cb8bc46f7405bd` FOREIGN KEY (`postId`) REFERENCES `post` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);
-- Create index "IDX_93b566d522b73cb8bc46f7405b" to table: "post_categories_category"
CREATE INDEX `IDX_93b566d522b73cb8bc46f7405b` ON `post_categories_category` (`postId`);
-- Create index "IDX_a5e63f80ca58e7296d5864bd2d" to table: "post_categories_category"
CREATE INDEX `IDX_a5e63f80ca58e7296d5864bd2d` ON `post_categories_category` (`categoryId`);
