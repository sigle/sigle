-- CreateEnum
CREATE TYPE "PostOtsStatus" AS ENUM ('PENDING', 'UPGRADED', 'FAILED');

-- CreateTable
CREATE TABLE "post_ots" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "post_tx_id" TEXT NOT NULL,
    "ots_tx_id" TEXT,
    "status" "PostOtsStatus" NOT NULL DEFAULT 'PENDING',
    "pending_proof" BYTEA,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_attempt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_ots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_ots_post_tx_id_key" ON "post_ots"("post_tx_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_ots_post_id_post_tx_id_key" ON "post_ots"("post_id", "post_tx_id");

-- CreateIndex
CREATE INDEX "post_ots_status_idx" ON "post_ots"("status");

-- AddForeignKey
ALTER TABLE "post_ots" ADD CONSTRAINT "post_ots_post_id_post_tx_id_fkey" FOREIGN KEY ("post_id", "post_tx_id") REFERENCES "post_revision"("post_id", "tx_id") ON DELETE CASCADE ON UPDATE CASCADE;
