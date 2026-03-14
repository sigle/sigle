/*
  Warnings:

  - Added the required column `block_height` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "post" ADD COLUMN     "block_height" INTEGER NOT NULL;
