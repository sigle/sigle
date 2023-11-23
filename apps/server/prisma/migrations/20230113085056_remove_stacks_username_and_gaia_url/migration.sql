/*
  Warnings:

  - You are about to drop the column `gaiaUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stacksUsername` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_stacksUsername_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "gaiaUrl",
DROP COLUMN "stacksUsername";
