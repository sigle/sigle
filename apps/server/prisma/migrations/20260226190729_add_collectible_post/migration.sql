/*
  Warnings:

  - You are about to drop the column `address` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `collected` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `enabled` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `max_supply` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `open_edition` on the `post` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "post_address_key";

-- AlterTable
ALTER TABLE "post" DROP COLUMN "address",
DROP COLUMN "collected",
DROP COLUMN "enabled",
DROP COLUMN "max_supply",
DROP COLUMN "open_edition";

-- CreateTable
CREATE TABLE "collectible" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "max_supply" INTEGER NOT NULL,
    "open_edition" BOOLEAN NOT NULL,
    "collected" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL,

    CONSTRAINT "collectible_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collectible_address_key" ON "collectible"("address");

-- AddForeignKey
ALTER TABLE "collectible" ADD CONSTRAINT "collectible_id_fkey" FOREIGN KEY ("id") REFERENCES "post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
