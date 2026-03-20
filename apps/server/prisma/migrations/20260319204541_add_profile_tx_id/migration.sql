/*
  Warnings:

  - A unique constraint covering the columns `[tx_id]` on the table `profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tx_id` to the `profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "tx_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "profile_tx_id_key" ON "profile"("tx_id");
