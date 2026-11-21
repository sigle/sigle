CREATE TABLE "draft" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"cover_image" text,
	"canonical_uri" text,
	"tx_id" text,
	"tx_status" text,
	"tags" text[],
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "draft_user_id_idx" ON "draft" ("user_id");--> statement-breakpoint
ALTER TABLE "draft" ADD CONSTRAINT "draft_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");