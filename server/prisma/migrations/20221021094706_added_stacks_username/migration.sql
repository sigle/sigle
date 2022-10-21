/*
  Warnings:

  - A unique constraint covering the columns `[stacksUsername]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gaiaUrl" TEXT,
ADD COLUMN     "stacksBlock" INTEGER,
ADD COLUMN     "stacksUsername" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_stacksUsername_key" ON "User"("stacksUsername");
