CREATE TABLE "profile" (
	"user_id" text PRIMARY KEY,
	"address" text NOT NULL,
	"arweave_tx_id" text NOT NULL CONSTRAINT "profile_arweave_tx_id_key" UNIQUE,
	"arweave_block_height" integer,
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
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;