/*
  Warnings:

  - A unique constraint covering the columns `[apiToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `apiToken` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_apiToken_key` ON `users`(`apiToken`);
