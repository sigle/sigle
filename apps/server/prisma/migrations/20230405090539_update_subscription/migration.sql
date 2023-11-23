/*
  Warnings:

  - You are about to drop the column `nftId` on the `Subscription` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('BASIC', 'PUBLISHER');

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "nftId",
ADD COLUMN     "upgradedAt" TIMESTAMP(3);
