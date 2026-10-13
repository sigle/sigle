CREATE TABLE "post_revision" (
	"id" text PRIMARY KEY,
	"post_id" text NOT NULL,
	"tx_id" text NOT NULL,
	"arweave_block_height" integer,
	"created_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "revisions_count" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "post_revision_post_id_tx_id_key" ON "post_revision" ("post_id","tx_id");--> statement-breakpoint
CREATE INDEX "post_revision_post_id_idx" ON "post_revision" ("post_id");--> statement-breakpoint
ALTER TABLE "post_revision" ADD CONSTRAINT "post_revision_post_id_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE;