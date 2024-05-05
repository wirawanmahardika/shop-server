/*
  Warnings:

  - You are about to alter the column `tanggal_beli` on the `penjualan` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `penjualan` MODIFY `tanggal_beli` TIMESTAMP NOT NULL;

-- CreateTable
CREATE TABLE `Preview` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipe_barang` VARCHAR(191) NOT NULL,
    `nama_barang` VARCHAR(191) NOT NULL,
    `image` MEDIUMBLOB NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
