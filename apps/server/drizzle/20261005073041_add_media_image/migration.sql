CREATE TYPE "MediaImageStatus" AS ENUM('PENDING', 'READY', 'FAILED');--> statement-breakpoint
CREATE TABLE "media_image" (
	"id" text PRIMARY KEY,
	"status" "MediaImageStatus" DEFAULT 'PENDING'::"MediaImageStatus" NOT NULL,
	"mime_type" text,
	"width" integer,
	"height" integer,
	"size" integer,
	"thumbhash" text,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "media_image_pending_idx" ON "media_image" ("created_at") WHERE status = 'PENDING';