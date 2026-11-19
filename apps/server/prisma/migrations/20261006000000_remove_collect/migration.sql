-- DropForeignKey
ALTER TABLE "minter_fixed_price" DROP CONSTRAINT "minter_fixed_price_id_fkey";

-- DropForeignKey
ALTER TABLE "collectible" DROP CONSTRAINT "collectible_id_fkey";

-- DropForeignKey
ALTER TABLE "post_nft" DROP CONSTRAINT "post_nft_post_id_fkey";

-- DropForeignKey
ALTER TABLE "post_nft" DROP CONSTRAINT "post_nft_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "post_nft" DROP CONSTRAINT "post_nft_minter_id_fkey";

-- AlterTable
ALTER TABLE "draft" DROP COLUMN "collect_limit",
DROP COLUMN "collect_limit_type",
DROP COLUMN "collect_price",
DROP COLUMN "collect_price_type";

-- DropTable
DROP TABLE "minter_fixed_price";

-- DropTable
DROP TABLE "collectible";

-- DropTable
DROP TABLE "post_nft";
