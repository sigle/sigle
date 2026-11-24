PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_profile` (
	`address` text PRIMARY KEY,
	`display_name` text,
	`description` text,
	`website` text,
	`twitter` text,
	`picture` text,
	`cover_picture` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_profile`(`address`, `display_name`, `description`, `website`, `twitter`, `picture`, `cover_picture`, `created_at`, `updated_at`) SELECT `address`, `display_name`, `description`, `website`, `twitter`, `picture`, `cover_picture`, `created_at`, `updated_at` FROM `profile`;--> statement-breakpoint
DROP TABLE `profile`;--> statement-breakpoint
ALTER TABLE `__new_profile` RENAME TO `profile`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS `profile_update_user_id_created_at_idx`;--> statement-breakpoint
DROP TABLE `profile_update`;