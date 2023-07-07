-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `fullname` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `photo` MEDIUMBLOB NULL,
    `password` VARCHAR(191) NOT NULL,
    `emailValidated` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `id_item` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `price` INTEGER UNSIGNED NOT NULL,
    `stock` SMALLINT UNSIGNED NOT NULL,

    PRIMARY KEY (`id_item`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
