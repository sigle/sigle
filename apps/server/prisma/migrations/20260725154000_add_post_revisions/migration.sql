-- AlterTable
ALTER TABLE "post" ADD COLUMN "revisions_count" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "post_revision" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "post_id" TEXT NOT NULL,
    "tx_id" TEXT NOT NULL,

    CONSTRAINT "post_revision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_revision_post_id_idx" ON "post_revision"("post_id");

-- AddForeignKey
ALTER TABLE "post_revision" ADD CONSTRAINT "post_revision_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
