CREATE TABLE `account` (
	`id` text PRIMARY KEY,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT `fk_account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `draft` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`meta_title` text,
	`meta_description` text,
	`cover_image` text,
	`canonical_uri` text,
	`arweave_tx_id` text,
	`tx_status` text,
	`publish_signature` text,
	`upload_claimed_at` integer,
	`tags` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` text NOT NULL,
	CONSTRAINT `fk_draft_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_image` (
	`id` text PRIMARY KEY,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`mime_type` text,
	`width` integer,
	`height` integer,
	`size` integer,
	`thumbhash` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "media_image_status_check" CHECK("status" IN ('PENDING', 'READY', 'FAILED'))
);
--> statement-breakpoint
CREATE TABLE `post` (
	`id` text PRIMARY KEY,
	`draft_id` text CONSTRAINT `post_draft_id_key` UNIQUE,
	`version` text NOT NULL,
	`arweave_tx_id` text NOT NULL CONSTRAINT `post_arweave_tx_id_key` UNIQUE,
	`arweave_block_height` integer,
	`metadata_uri` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`excerpt` text NOT NULL,
	`meta_title` text,
	`meta_description` text,
	`cover_image` text,
	`tags` text,
	`canonical_uri` text,
	`signature` text CONSTRAINT `post_signature_key` UNIQUE,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` text NOT NULL,
	CONSTRAINT `fk_post_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_ots` (
	`post_id` text PRIMARY KEY,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`content_hash` text NOT NULL,
	`pending_proof` blob,
	`ots_tx_id` text,
	`bitcoin_block_height` integer,
	`bitcoin_block_hash` text,
	`bitcoin_timestamp` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT `fk_post_ots_post_id_post_id_fk` FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON DELETE CASCADE,
	CONSTRAINT "post_ots_status_check" CHECK("status" IN ('PENDING', 'UPGRADED', 'FAILED'))
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`address` text PRIMARY KEY,
	`arweave_tx_id` text NOT NULL CONSTRAINT `profile_arweave_tx_id_key` UNIQUE,
	`arweave_block_height` integer,
	`signature` text NOT NULL CONSTRAINT `profile_signature_key` UNIQUE,
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
CREATE TABLE `session` (
	`id` text PRIMARY KEY,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL CONSTRAINT `session_token_key` UNIQUE,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	CONSTRAINT `fk_session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY,
	`last_login_at` integer,
	`flag` text DEFAULT 'NONE' NOT NULL,
	`name` text,
	`email` text CONSTRAINT `user_email_key` UNIQUE,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "user_flag_check" CHECK("flag" IN ('NONE', 'VERIFIED'))
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `wallet_address` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`address` text NOT NULL,
	`chain_id` integer NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_wallet_address_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `draft_user_id_idx` ON `draft` (`user_id`);--> statement-breakpoint
CREATE INDEX `media_image_pending_idx` ON `media_image` (`created_at`) WHERE status = 'PENDING';--> statement-breakpoint
CREATE INDEX `post_user_id_idx` ON `post` (`user_id`);--> statement-breakpoint
CREATE INDEX `post_created_at_id_idx` ON `post` (`created_at`,`id`);--> statement-breakpoint
CREATE INDEX `post_arweave_pending_idx` ON `post` (`created_at`) WHERE arweave_block_height is null;--> statement-breakpoint
CREATE INDEX `post_ots_status_idx` ON `post_ots` (`status`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE INDEX `wallet_address_user_id_idx` ON `wallet_address` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `wallet_address_address_chain_id_unique` ON `wallet_address` (`address`,`chain_id`);