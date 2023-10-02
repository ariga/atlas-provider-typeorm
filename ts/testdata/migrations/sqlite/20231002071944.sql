-- Create "blog" table
CREATE TABLE `blog` (
  `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  `title` varchar NOT NULL,
  `userId` integer NULL,
  CONSTRAINT `FK_fc46ede0f7ab797b7ffacb5c08d` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create "user" table
CREATE TABLE `user` (
  `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  `firstName` varchar NOT NULL,
  `lastName` varchar NOT NULL,
  `age` integer NOT NULL,
  CONSTRAINT `CHK_70c8a9c9c39b98f399c28b8700` CHECK ("age" > 6)
);
-- Create index "user_firstName_lastName" to table: "user"
CREATE UNIQUE INDEX `user_firstName_lastName` ON `user` (`firstName`, `lastName`);
-- Create index "IDX_USER_AGE" to table: "user"
CREATE INDEX `IDX_USER_AGE` ON `user` (`age`);
