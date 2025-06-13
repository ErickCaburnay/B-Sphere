-- CreateTable
CREATE TABLE `Official` (
    `residentId` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `termStart` DATETIME(3) NOT NULL,
    `termEnd` DATETIME(3) NOT NULL,
    `chairmanship` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Official_residentId_key`(`residentId`),
    PRIMARY KEY (`residentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resident` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `middleName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `birthdate` DATETIME(3) NOT NULL,
    `civilStatus` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `voterStatus` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Resident_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Household` (
    `id` VARCHAR(191) NOT NULL,
    `headId` VARCHAR(191) NOT NULL,
    `totalMembers` INTEGER NOT NULL DEFAULT 1,
    `address` VARCHAR(191) NOT NULL,
    `contactNumber` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Household_id_key`(`id`),
    UNIQUE INDEX `Household_headId_key`(`headId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_HouseholdMembers` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_HouseholdMembers_AB_unique`(`A`, `B`),
    INDEX `_HouseholdMembers_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Official` ADD CONSTRAINT `Official_residentId_fkey` FOREIGN KEY (`residentId`) REFERENCES `Resident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Household` ADD CONSTRAINT `Household_headId_fkey` FOREIGN KEY (`headId`) REFERENCES `Resident`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_HouseholdMembers` ADD CONSTRAINT `_HouseholdMembers_A_fkey` FOREIGN KEY (`A`) REFERENCES `Household`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_HouseholdMembers` ADD CONSTRAINT `_HouseholdMembers_B_fkey` FOREIGN KEY (`B`) REFERENCES `Resident`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
