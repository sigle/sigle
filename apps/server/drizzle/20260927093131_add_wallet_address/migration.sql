CREATE TABLE "wallet_address" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"address" text NOT NULL,
	"chain_id" bigint NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE INDEX "wallet_address_user_id_idx" ON "wallet_address" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wallet_address_address_chain_id_unique" ON "wallet_address" ("address","chain_id");--> statement-breakpoint
ALTER TABLE "wallet_address" ADD CONSTRAINT "wallet_address_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;