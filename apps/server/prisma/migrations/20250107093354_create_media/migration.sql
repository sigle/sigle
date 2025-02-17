/*
  Warnings:

  - You are about to drop the column `cover_image` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "cover_image",
ADD COLUMN     "cover_image_id" TEXT;

-- CreateTable
CREATE TABLE "MediaImage" (
    "id" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "alt" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER,
    "blurhash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_cover_image_id_fkey" FOREIGN KEY ("cover_image_id") REFERENCES "MediaImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
