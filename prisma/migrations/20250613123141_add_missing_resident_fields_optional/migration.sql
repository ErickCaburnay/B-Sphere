-- AlterTable
ALTER TABLE `resident` ADD COLUMN `educationalAttainment` VARCHAR(191) NULL,
    ADD COLUMN `employmentStatus` VARCHAR(191) NULL,
    ADD COLUMN `isSoloParent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `voterStatus` VARCHAR(191) NULL;
