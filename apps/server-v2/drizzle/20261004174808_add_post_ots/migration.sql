CREATE TYPE "PostOtsStatus" AS ENUM('PENDING', 'UPGRADED', 'FAILED');--> statement-breakpoint
CREATE TABLE "post_ots" (
	"post_id" text PRIMARY KEY,
	"status" "PostOtsStatus" DEFAULT 'PENDING'::"PostOtsStatus" NOT NULL,
	"content_hash" text NOT NULL,
	"pending_proof" bytea,
	"ots_tx_id" text,
	"bitcoin_block_height" integer,
	"bitcoin_block_hash" text,
	"bitcoin_timestamp" timestamp(3),
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "post_ots_status_idx" ON "post_ots" ("status");--> statement-breakpoint
ALTER TABLE "post_ots" ADD CONSTRAINT "post_ots_post_id_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE;