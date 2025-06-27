/*
  Warnings:

  - You are about to drop the column `name` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `document` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `household` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `resident` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `filePath` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `official` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `document` DROP FOREIGN KEY `Document_residentId_fkey`;

-- DropForeignKey
ALTER TABLE `household` DROP FOREIGN KEY `Household_headId_fkey`;

-- DropForeignKey
ALTER TABLE `log` DROP FOREIGN KEY `Log_residentId_fkey`;

-- DropForeignKey
ALTER TABLE `official` DROP FOREIGN KEY `Official_residentId_fkey`;

-- DropIndex
DROP INDEX `Document_residentId_fkey` ON `document`;

-- DropIndex
DROP INDEX `Resident_uniqueId_key` ON `resident`;

-- AlterTable
ALTER TABLE `document` DROP COLUMN `name`,
    DROP COLUMN `uploadedAt`,
    DROP COLUMN `url`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `filePath` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `log` ADD COLUMN `role` VARCHAR(191) NOT NULL,
    ADD COLUMN `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `official` ADD COLUMN `chairmanship` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL,
    ADD COLUMN `termEnd` DATETIME(3) NULL,
    ADD COLUMN `termStart` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `middleName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admins` (
    `id` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'admin',
    `firstName` VARCHAR(191) NOT NULL,
    `middleName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `household_id_key` ON `household`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `resident_id_key` ON `resident`(`id`);

-- AddForeignKey
ALTER TABLE `official` ADD CONSTRAINT `official_residentId_fkey` FOREIGN KEY (`residentId`) REFERENCES `resident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `household` ADD CONSTRAINT `household_headId_fkey` FOREIGN KEY (`headId`) REFERENCES `resident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log` ADD CONSTRAINT `log_residentId_fkey` FOREIGN KEY (`residentId`) REFERENCES `resident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RedefineIndex
CREATE UNIQUE INDEX `_householdmembers_AB_unique` ON `_householdmembers`(`A`, `B`);
DROP INDEX `_HouseholdMembers_AB_unique` ON `_householdmembers`;

-- RedefineIndex
CREATE INDEX `_householdmembers_B_index` ON `_householdmembers`(`B`);
DROP INDEX `_HouseholdMembers_B_index` ON `_householdmembers`;

-- RedefineIndex
CREATE INDEX `log_residentId_fkey` ON `log`(`residentId`);
DROP INDEX `Log_residentId_fkey` ON `log`;
