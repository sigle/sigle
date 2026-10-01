CREATE TABLE "post" (
	"id" text PRIMARY KEY,
	"draft_id" text CONSTRAINT "post_draft_id_key" UNIQUE,
	"version" text NOT NULL,
	"tx_id" text NOT NULL CONSTRAINT "post_tx_id_key" UNIQUE,
	"arweave_l1_tx_id" text,
	"block_height" integer NOT NULL,
	"metadata_uri" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"cover_image" text,
	"tags" text[],
	"canonical_uri" text,
	"signature" text CONSTRAINT "post_signature_key" UNIQUE,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "post_user_id_idx" ON "post" ("user_id");--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");