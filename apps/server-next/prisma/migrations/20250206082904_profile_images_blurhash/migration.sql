/*
  Warnings:

  - You are about to drop the column `cover_picture_uri` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `picture_uri` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "cover_picture_uri",
DROP COLUMN "picture_uri",
ADD COLUMN     "cover_picture_uri_id" TEXT,
ADD COLUMN     "picture_uri_id" TEXT;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_picture_uri_id_fkey" FOREIGN KEY ("picture_uri_id") REFERENCES "MediaImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_cover_picture_uri_id_fkey" FOREIGN KEY ("cover_picture_uri_id") REFERENCES "MediaImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
