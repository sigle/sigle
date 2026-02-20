-- AlterTable: Add name and email columns to user table
ALTER TABLE "user" ADD COLUMN "name" TEXT;
ALTER TABLE "user" ADD COLUMN "email" TEXT;

-- CreateTable: wallet_address
CREATE TABLE "wallet_address" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_address_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "wallet_address" ADD CONSTRAINT "wallet_address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill existing users: set name = id (Stacks address), email = id@sigle.io
UPDATE "user" SET "name" = "id", "email" = "id" || '@sigle.io' WHERE "name" IS NULL;

-- Backfill: create wallet_address records for existing users
-- Using gen_random_uuid() for the cuid-like id (PostgreSQL 13+)
INSERT INTO "wallet_address" ("id", "user_id", "address", "chain_id", "is_primary", "created_at")
SELECT gen_random_uuid()::text, "id", "id", 1, true, "created_at"
FROM "user"
WHERE "id" NOT IN (SELECT "user_id" FROM "wallet_address");

-- Backfill: create account records for existing users who don't have one
-- The SIWS plugin uses providerId='siws' and accountId='walletAddress:chainId'
INSERT INTO "account" ("id", "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", "scope", "password", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "id" || ':1', 'siws', "id", NULL, NULL, NULL, NULL, NULL, NULL, NULL, "created_at", "updated_at"
FROM "user"
WHERE "id" NOT IN (SELECT "userId" FROM "account" WHERE "providerId" = 'siws');

-- CreateIndex: unique email
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
