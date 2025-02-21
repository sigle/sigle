/*
  Warnings:

  - You are about to drop the column `max_supply` on the `Draft` table. All the data in the column will be lost.
  - You are about to drop the column `max_supply_type` on the `Draft` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Draft" DROP COLUMN "max_supply",
DROP COLUMN "max_supply_type",
ADD COLUMN     "collect_limit" INTEGER,
ADD COLUMN     "collect_limit_type" TEXT;
