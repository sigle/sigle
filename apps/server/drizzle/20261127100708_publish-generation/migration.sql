ALTER TABLE `draft` ADD `publish_generation` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `draft` DROP COLUMN `upload_claimed_at`;