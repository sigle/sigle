/*
  Warnings:

  - You are about to drop the column `price` on the `post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "post" DROP COLUMN "price";

-- CreateTable
CREATE TABLE "minter_fixed_price" (
    "id" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "start_block" BIGINT NOT NULL,
    "end_block" BIGINT NOT NULL,

    CONSTRAINT "minter_fixed_price_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "minter_fixed_price" ADD CONSTRAINT "minter_fixed_price_id_fkey" FOREIGN KEY ("id") REFERENCES "post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
