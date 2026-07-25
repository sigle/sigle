-- AlterTable
ALTER TABLE "post" ADD COLUMN "signature" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "post_signature_key" ON "post"("signature");
