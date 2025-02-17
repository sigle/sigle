-- CreateTable
CREATE TABLE "PostNft" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "post_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "minter_id" TEXT NOT NULL,

    CONSTRAINT "PostNft_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostNft" ADD CONSTRAINT "PostNft_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostNft" ADD CONSTRAINT "PostNft_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostNft" ADD CONSTRAINT "PostNft_minter_id_fkey" FOREIGN KEY ("minter_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
