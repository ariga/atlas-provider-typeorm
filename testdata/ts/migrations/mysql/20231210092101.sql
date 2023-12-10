-- Create "user" table
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `role` enum('admin','editor','ghost') NOT NULL DEFAULT "ghost",
  `age` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `IDX_c322cd2084cd4b1b2813a90032` (`firstName`, `lastName`),
  INDEX `IDX_USER_AGE` (`age`)
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- Create "blog" table
CREATE TABLE `blog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `userId` int NULL,
  PRIMARY KEY (`id`),
  INDEX `FK_fc46ede0f7ab797b7ffacb5c08d` (`userId`),
  CONSTRAINT `FK_fc46ede0f7ab797b7ffacb5c08d` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
) CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
