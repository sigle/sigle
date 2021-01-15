/*
  Warnings:

  - The migration will change the primary key for the `Story` table. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Story` table. All the data in the column will be lost.
  - The migration will add a unique constraint covering the columns `[storyId,username]` on the table `Story`. If there are existing duplicate values, the migration will fail.

*/
-- AlterTable
ALTER TABLE "Story" DROP CONSTRAINT "Story_pkey",
DROP COLUMN "id";

-- CreateIndex
CREATE UNIQUE INDEX "Story.storyId_username_unique" ON "Story"("storyId", "username");
