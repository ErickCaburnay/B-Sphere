/*
  Warnings:

  - You are about to drop the column `role` on the `log` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `log` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `log` table. All the data in the column will be lost.
  - The primary key for the `official` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `chairmanship` on the `official` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `official` table. All the data in the column will be lost.
  - You are about to drop the column `termEnd` on the `official` table. All the data in the column will be lost.
  - You are about to drop the column `termStart` on the `official` table. All the data in the column will be lost.
  - You are about to drop the column `birthplace` on the `resident` table. All the data in the column will be lost.
  - You are about to drop the column `educationalAttainment` on the `resident` table. All the data in the column will be lost.
  - You are about to drop the column `employmentStatus` on the `resident` table. All the data in the column will be lost.
  - You are about to drop the column `isSoloParent` on the `resident` table. All the data in the column will be lost.
  - You are about to drop the column `suffix` on the `resident` table. All the data in the column will be lost.
  - You are about to drop the column `voterStatus` on the `resident` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uniqueId]` on the table `Resident` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Household_id_key` ON `household`;

-- DropIndex
DROP INDEX `Resident_id_key` ON `resident`;

-- AlterTable
ALTER TABLE `log` DROP COLUMN `role`,
    DROP COLUMN `timestamp`,
    DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `official` DROP PRIMARY KEY,
    DROP COLUMN `chairmanship`,
    DROP COLUMN `status`,
    DROP COLUMN `termEnd`,
    DROP COLUMN `termStart`,
    ADD COLUMN `id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `resident` DROP COLUMN `birthplace`,
    DROP COLUMN `educationalAttainment`,
    DROP COLUMN `employmentStatus`,
    DROP COLUMN `isSoloParent`,
    DROP COLUMN `suffix`,
    DROP COLUMN `voterStatus`,
    ADD COLUMN `isSenior` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isVoter` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `photo` VARCHAR(191) NULL,
    ADD COLUMN `uniqueId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `residentId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Resident_uniqueId_key` ON `Resident`(`uniqueId`);

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_residentId_fkey` FOREIGN KEY (`residentId`) REFERENCES `Resident`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
