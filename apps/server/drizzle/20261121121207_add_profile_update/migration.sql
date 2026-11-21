CREATE TABLE "profile_update" (
	"arweave_tx_id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"address" text NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "profile_update_user_id_created_at_idx" ON "profile_update" ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "profile_update" ADD CONSTRAINT "profile_update_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;