-- AlterTable
ALTER TABLE "Draft" ADD COLUMN     "collect_price" BIGINT,
ADD COLUMN     "collect_price_type" TEXT,
ADD COLUMN     "max_supply" INTEGER,
ADD COLUMN     "max_supply_type" TEXT;
