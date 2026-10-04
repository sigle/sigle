-- AlterTable
ALTER TABLE "profile" ADD COLUMN "signature" TEXT,
ADD COLUMN "block_height" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "profile_signature_key" ON "profile"("signature");
