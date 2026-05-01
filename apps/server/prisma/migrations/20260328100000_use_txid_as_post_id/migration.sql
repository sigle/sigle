-- Use txId as post ID
-- Drop the old user-generated id column and rename txId to id

-- Drop foreign key constraints that reference post.id
ALTER TABLE "post_nft" DROP CONSTRAINT IF EXISTS "post_nft_post_id_fkey";
ALTER TABLE "minter_fixed_price" DROP CONSTRAINT IF EXISTS "minter_fixed_price_id_fkey";
ALTER TABLE "collectible" DROP CONSTRAINT IF EXISTS "collectible_id_fkey";

-- Drop the old id column
ALTER TABLE "post" DROP COLUMN IF EXISTS "id";

-- Rename txId to id
ALTER TABLE "post" ADD COLUMN "id" TEXT;
UPDATE "post" SET "id" = "tx_id";
ALTER TABLE "post" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "post" DROP COLUMN "tx_id";

-- Set id as primary key
ALTER TABLE "post" ADD PRIMARY KEY ("id");

-- Re-create foreign key constraints
ALTER TABLE "post_nft" ADD CONSTRAINT "post_nft_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE;
ALTER TABLE "minter_fixed_price" ADD CONSTRAINT "minter_fixed_price_id_fkey" FOREIGN KEY ("id") REFERENCES "post"("id") ON DELETE CASCADE;
ALTER TABLE "collectible" ADD CONSTRAINT "collectible_id_fkey" FOREIGN KEY ("id") REFERENCES "post"("id") ON DELETE CASCADE;
