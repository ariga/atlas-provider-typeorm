-- Create "author" table
CREATE TABLE `author` (
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- Create "blog" table
CREATE TABLE `blog` (
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- Create "post" table
CREATE TABLE `post` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `text` text NOT NULL,
  PRIMARY KEY (`id`)
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- Create "category" table
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- Create "post_categories_category" table
CREATE TABLE `post_categories_category` (
  `postId` int NOT NULL,
  `categoryId` int NOT NULL,
  PRIMARY KEY (`postId`, `categoryId`),
  INDEX `IDX_93b566d522b73cb8bc46f7405b` (`postId`),
  INDEX `IDX_a5e63f80ca58e7296d5864bd2d` (`categoryId`),
  CONSTRAINT `FK_93b566d522b73cb8bc46f7405bd` FOREIGN KEY (`postId`) REFERENCES `post` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `FK_a5e63f80ca58e7296d5864bd2d3` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
