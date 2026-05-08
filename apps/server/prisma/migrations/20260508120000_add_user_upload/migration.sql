-- CreateTable
CREATE TABLE "user_upload" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "content_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_upload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_upload_user_id_idx" ON "user_upload"("user_id");

-- CreateIndex
CREATE INDEX "user_upload_user_id_created_at_idx" ON "user_upload"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "user_upload" ADD CONSTRAINT "user_upload_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
