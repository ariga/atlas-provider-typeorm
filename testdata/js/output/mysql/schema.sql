-- atlas:pos author[type=table] entities/blog/Author.js:1:16-10:2
-- atlas:pos blog[type=table] entities/Blog.js:2:21-11:2
-- atlas:pos category[type=table] entities/Category.js:2:35-14:2
-- atlas:pos post[type=table] entities/post/Post.js:2:21-25:2

CREATE TABLE `post` (`id` int NOT NULL AUTO_INCREMENT, `title` varchar(255) NOT NULL, `text` text NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;
CREATE TABLE `category` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;
CREATE TABLE `blog` (`id` int NOT NULL AUTO_INCREMENT, PRIMARY KEY (`id`)) ENGINE=InnoDB;
CREATE TABLE `author` (`id` int NOT NULL AUTO_INCREMENT, PRIMARY KEY (`id`)) ENGINE=InnoDB;
CREATE TABLE `post_categories_category` (`postId` int NOT NULL, `categoryId` int NOT NULL, INDEX `IDX_93b566d522b73cb8bc46f7405b` (`postId`), INDEX `IDX_a5e63f80ca58e7296d5864bd2d` (`categoryId`), PRIMARY KEY (`postId`, `categoryId`)) ENGINE=InnoDB;
ALTER TABLE `post_categories_category` ADD CONSTRAINT `FK_93b566d522b73cb8bc46f7405bd` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `post_categories_category` ADD CONSTRAINT `FK_a5e63f80ca58e7296d5864bd2d3` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE