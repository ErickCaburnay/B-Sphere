/*
  Warnings:

  - You are about to drop the column `civilStatus` on the `resident` table. All the data in the column will be lost.
  - Added the required column `address` to the `Resident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthplace` to the `Resident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `citizenship` to the `Resident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maritalStatus` to the `Resident` table without a default value. This is not possible if the table is not empty.

*/
-- First, rename civilStatus to maritalStatus
ALTER TABLE `Resident` CHANGE `civilStatus` `maritalStatus` VARCHAR(191) NOT NULL;

-- Add new columns with default values
ALTER TABLE `Resident` ADD COLUMN `suffix` VARCHAR(191) NULL;
ALTER TABLE `Resident` ADD COLUMN `address` VARCHAR(191) NOT NULL DEFAULT 'Not Specified';
ALTER TABLE `Resident` ADD COLUMN `birthplace` VARCHAR(191) NOT NULL DEFAULT 'Not Specified';
ALTER TABLE `Resident` ADD COLUMN `citizenship` VARCHAR(191) NOT NULL DEFAULT 'Filipino';
ALTER TABLE `Resident` ADD COLUMN `employmentStatus` VARCHAR(191) NULL;
ALTER TABLE `Resident` ADD COLUMN `educationalAttainment` VARCHAR(191) NULL;
ALTER TABLE `Resident` ADD COLUMN `occupation` VARCHAR(191) NULL;
ALTER TABLE `Resident` ADD COLUMN `contactNumber` VARCHAR(191) NULL;
ALTER TABLE `Resident` ADD COLUMN `email` VARCHAR(191) NULL;
ALTER TABLE `Resident` ADD COLUMN `isTUPAD` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `Resident` ADD COLUMN `isPWD` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `Resident` ADD COLUMN `is4Ps` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `Resident` ADD COLUMN `isSoloParent` BOOLEAN NOT NULL DEFAULT false;

-- Remove default values after adding them
ALTER TABLE `Resident` ALTER `address` DROP DEFAULT;
ALTER TABLE `Resident` ALTER `birthplace` DROP DEFAULT;
ALTER TABLE `Resident` ALTER `citizenship` DROP DEFAULT;
