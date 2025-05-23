-- atlas:pos blog[type=table] entities/Blog.ts:5:13-14:2
-- atlas:pos user[type=table] entities/User.ts:21:13-44:2

CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `firstName` varchar(255) NOT NULL, `lastName` varchar(255) NOT NULL, `role` enum ('admin', 'editor', 'ghost') NOT NULL DEFAULT 'ghost', `age` int NOT NULL, INDEX `IDX_USER_AGE` (`age`), UNIQUE INDEX `IDX_c322cd2084cd4b1b2813a90032` (`firstName`, `lastName`), PRIMARY KEY (`id`)) ENGINE=InnoDB;
CREATE TABLE `blog` (`id` int NOT NULL AUTO_INCREMENT, `title` varchar(255) NOT NULL, `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;
ALTER TABLE `blog` ADD CONSTRAINT `FK_fc46ede0f7ab797b7ffacb5c08d` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION