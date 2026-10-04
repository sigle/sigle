CREATE TABLE "profile" (
	"user_id" text PRIMARY KEY,
	"wallet_address_id" text NOT NULL,
	"arweave_tx_id" text NOT NULL CONSTRAINT "profile_arweave_tx_id_key" UNIQUE,
	"arweave_cid" text NOT NULL,
	"content_hash" text NOT NULL,
	"signature" text NOT NULL CONSTRAINT "profile_signature_key" UNIQUE,
	"display_name" text,
	"description" text,
	"website" text,
	"twitter" text,
	"picture" text,
	"cover_picture" text,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "profile_wallet_address_id_idx" ON "profile" ("wallet_address_id");--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_wallet_address_id_wallet_address_id_fkey" FOREIGN KEY ("wallet_address_id") REFERENCES "wallet_address"("id") ON DELETE CASCADE;