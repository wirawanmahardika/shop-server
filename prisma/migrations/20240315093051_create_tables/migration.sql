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
CREATE TABLE `wallet` (
    `id_wallet` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` CHAR(36) NOT NULL,
    `balance` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `wallet_id_user_key`(`id_user`),
    PRIMARY KEY (`id_wallet`)
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
    `photo_item` MEDIUMBLOB NULL,

    PRIMARY KEY (`id_item`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brands` (
    `id_brand` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name_brand` VARCHAR(191) NOT NULL,
    `brand_photo` MEDIUMBLOB NOT NULL,

    UNIQUE INDEX `brands_name_brand_key`(`name_brand`),
    PRIMARY KEY (`id_brand`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id_category` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(191) NOT NULL,
    `category_photo` MEDIUMBLOB NULL,

    PRIMARY KEY (`id_category`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penjualan` (
    `id_penjualan` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` CHAR(36) NOT NULL,
    `tanggal_beli` TIMESTAMP NOT NULL,
    `status` ENUM('pengemasan', 'dikirim', 'sampai', 'diterima') NOT NULL,

    PRIMARY KEY (`id_penjualan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_terjual` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_penjualan` INTEGER NOT NULL,
    `id_item` MEDIUMINT UNSIGNED NOT NULL,
    `quantity` SMALLINT UNSIGNED NOT NULL,
    `price` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `fk_wallet_user` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `fk_item_category` FOREIGN KEY (`id_category`) REFERENCES `categories`(`id_category`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `fk_item_brand` FOREIGN KEY (`id_brand`) REFERENCES `brands`(`id_brand`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penjualan` ADD CONSTRAINT `fk_penjualan_users` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_terjual` ADD CONSTRAINT `fk_item_terjual_penjualan` FOREIGN KEY (`id_penjualan`) REFERENCES `penjualan`(`id_penjualan`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_terjual` ADD CONSTRAINT `fk_item_terjual_item` FOREIGN KEY (`id_item`) REFERENCES `items`(`id_item`) ON DELETE CASCADE ON UPDATE CASCADE;
