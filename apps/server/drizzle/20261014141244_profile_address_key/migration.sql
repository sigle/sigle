ALTER TABLE "profile" DROP CONSTRAINT "profile_user_id_user_id_fkey";--> statement-breakpoint
ALTER TABLE "profile" DROP CONSTRAINT "profile_wallet_address_id_wallet_address_id_fkey";--> statement-breakpoint
DROP INDEX "profile_wallet_address_id_idx";--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "address" text;--> statement-breakpoint
UPDATE "profile" SET "address" = "wallet_address"."address" FROM "wallet_address" WHERE "wallet_address"."id" = "profile"."wallet_address_id";--> statement-breakpoint
ALTER TABLE "profile" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "profile" DROP COLUMN "wallet_address_id";--> statement-breakpoint
ALTER TABLE "profile" ADD PRIMARY KEY ("address");