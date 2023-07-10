-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `fullname` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `role` ENUM('user', 'admin') NOT NULL,
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
    `id_brand` MEDIUMINT UNSIGNED NOT NULL,
    `id_category` MEDIUMINT UNSIGNED NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` INTEGER UNSIGNED NOT NULL,
    `stock` SMALLINT UNSIGNED NOT NULL,
    `rating` DECIMAL(2, 1) NULL,

    PRIMARY KEY (`id_item`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brands` (
    `id_brand` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name_brand` VARCHAR(191) NOT NULL,
    `brand_photo` MEDIUMBLOB NOT NULL,

    PRIMARY KEY (`id_brand`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id_category` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_category`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `fk_item_category` FOREIGN KEY (`id_category`) REFERENCES `categories`(`id_category`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `fk_item_brand` FOREIGN KEY (`id_brand`) REFERENCES `brands`(`id_brand`) ON DELETE RESTRICT ON UPDATE CASCADE;
