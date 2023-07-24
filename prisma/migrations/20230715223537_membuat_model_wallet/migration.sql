-- CreateTable
CREATE TABLE `wallet` (
    `id_wallet` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` CHAR(36) NOT NULL,
    `balance` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `wallet_id_user_key`(`id_user`),
    PRIMARY KEY (`id_wallet`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `wallet` ADD CONSTRAINT `fk_wallet_user` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
