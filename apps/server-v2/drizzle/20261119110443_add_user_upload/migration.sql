CREATE TABLE "user_upload" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"content_type" text NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "user_upload_user_id_created_at_idx" ON "user_upload" ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "user_upload" ADD CONSTRAINT "user_upload_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;