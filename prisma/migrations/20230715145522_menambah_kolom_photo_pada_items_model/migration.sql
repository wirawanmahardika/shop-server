/*
  Warnings:

  - A unique constraint covering the columns `[name_brand]` on the table `brands` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `categories` ADD COLUMN `category_photo` MEDIUMBLOB NULL;

-- AlterTable
ALTER TABLE `items` ADD COLUMN `photo_item` MEDIUMBLOB NULL;

-- CreateIndex
CREATE UNIQUE INDEX `brands_name_brand_key` ON `brands`(`name_brand`);
