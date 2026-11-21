import { sql } from "drizzle-orm";
import {
  blob,
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
  type SQLiteColumn,
} from "drizzle-orm/sqlite-core";

/** Millisecond timestamp, read back as a `Date`. */
const timestamp = (name: string) => integer(name, { mode: "timestamp_ms" });

/** Boolean stored as 0 or 1. */
const boolean = (name: string) => integer(name, { mode: "boolean" });

/** A string array stored as JSON text. */
const textArray = (name: string) =>
  text(name, { mode: "json" }).$type<string[]>();

const now = () => new Date();

/**
 * Limits a text column to `values`. Drizzle's `enum` option only narrows the
 * TypeScript type, SQLite stores any text without this constraint.
 */
const oneOf = (
  name: string,
  column: SQLiteColumn,
  values: ReadonlyArray<string>,
) =>
  check(
    name,
    sql`${column} IN (${sql.raw(values.map((value) => `'${value}'`).join(", "))})`,
  );

const userFlags = ["NONE", "VERIFIED"] as const;

// --
// better-auth models
// --

export const user = sqliteTable(
  "user",
  {
    id: text("id").primaryKey(),
    lastLoginAt: timestamp("last_login_at"),
    flag: text("flag", { enum: userFlags }).default("NONE").notNull(),
    name: text("name"),
    email: text("email").unique("user_email_key"),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").$defaultFn(now).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(now).notNull(),
  },
  (table) => [oneOf("user_flag_check", table.flag, userFlags)],
);

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique("session_token_key"),
    createdAt: timestamp("created_at").$defaultFn(now).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(now).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").$defaultFn(now).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(now).notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").$defaultFn(now),
    updatedAt: timestamp("updated_at").$defaultFn(now),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// Wallet identity model added by the sign-in-with-stacks better-auth plugin.
export const walletAddress = sqliteTable(
  "wallet_address",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    address: text("address").notNull(),
    chainId: integer("chain_id").notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    index("wallet_address_user_id_idx").on(table.userId),
    uniqueIndex("wallet_address_address_chain_id_unique").on(
      table.address,
      table.chainId,
    ),
  ],
);

// --
// End of better-auth models
// --

// --
// Drafts
// --

export const draft = sqliteTable(
  "draft",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    coverImage: text("cover_image"),
    canonicalUri: text("canonical_uri"),
    arweaveTxId: text("arweave_tx_id"),
    // Publish state, null until the draft is first published.
    txStatus: text("tx_status").$type<"PENDING" | "PROCESSING" | "FAILED">(),
    // Signature of the signed post metadata the draft is publishing (or last
    // attempted). `arweaveTxId` is a valid checkpoint only while it matches.
    publishSignature: text("publish_signature"),
    // Lease held by the worker uploading to Arweave, so concurrent workers for
    // the same signature do not upload the same metadata twice.
    uploadClaimedAt: timestamp("upload_claimed_at"),
    tags: textArray("tags"),
    createdAt: timestamp("created_at").$defaultFn(now).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(now).notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => [index("draft_user_id_idx").on(table.userId)],
);

// --
// Profiles
// --

export const profile = sqliteTable("profile", {
  // Stacks address that signed the latest profile metadata. A profile belongs
  // to the signing address rather than to an account, so a profile published
  // on Arweave exists even if its signer never signed in.
  address: text("address").primaryKey(),
  arweaveTxId: text("arweave_tx_id")
    .notNull()
    .unique("profile_arweave_tx_id_key"),
  // Null until the profile transaction is included in an Arweave block; set
  // by the profile indexer.
  arweaveBlockHeight: integer("arweave_block_height"),
  signature: text("signature").notNull().unique("profile_signature_key"),
  displayName: text("display_name"),
  description: text("description"),
  website: text("website"),
  twitter: text("twitter"),
  picture: text("picture"),
  coverPicture: text("cover_picture"),
  createdAt: timestamp("created_at").$defaultFn(now).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(now).notNull(),
});

// Successful profile updates through the API, one row per uploaded profile
// metadata, counted against the daily profile update limit. Profiles indexed
// from Arweave have no row.
export const profileUpdate = sqliteTable(
  "profile_update",
  {
    arweaveTxId: text("arweave_tx_id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Signing address of the uploaded profile.
    address: text("address").notNull(),
    createdAt: timestamp("created_at").$defaultFn(now).notNull(),
  },
  (table) => [
    index("profile_update_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
  ],
);

// --
// Media images
// --

/**
 * Placeholder metadata for an image, keyed by its canonical URL. Post covers
 * (`post.cover_image`) and profile pictures (`profile.picture`/`cover_picture`)
 * get a PENDING row from their producers that the thumbhash job fills in.
 * Images uploaded through the API (profile and draft images) get a READY row
 * inline. External image URLs embedded in post content have no row.
 */
const mediaImageStatuses = ["PENDING", "READY", "FAILED"] as const;

export const mediaImage = sqliteTable(
  "media_image",
  {
    id: text("id").primaryKey(),
    status: text("status", { enum: mediaImageStatuses })
      .default("PENDING")
      .notNull(),
    mimeType: text("mime_type"),
    width: integer("width"),
    height: integer("height"),
    size: integer("size"),
    // Base64 of the 25-byte ThumbHash placeholder.
    thumbhash: text("thumbhash"),
    createdAt: timestamp("created_at").$defaultFn(now).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(now).notNull(),
  },
  (table) => [
    oneOf("media_image_status_check", table.status, mediaImageStatuses),
    index("media_image_pending_idx")
      .on(table.createdAt)
      .where(sql`status = 'PENDING'`),
  ],
);

// --
// Posts
// --

export const post = sqliteTable(
  "post",
  {
    id: text("id").primaryKey(),
    draftId: text("draft_id").unique("post_draft_id_key"),
    version: text("version").notNull(),
    arweaveTxId: text("arweave_tx_id")
      .notNull()
      .unique("post_arweave_tx_id_key"),
    // Null until the bundle is included in an Arweave block; populated by a
    // later queue.
    arweaveBlockHeight: integer("arweave_block_height"),
    metadataUri: text("metadata_uri").notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    excerpt: text("excerpt").notNull(),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    coverImage: text("cover_image"),
    tags: textArray("tags"),
    canonicalUri: text("canonical_uri"),
    signature: text("signature").unique("post_signature_key"),
    createdAt: timestamp("created_at").$defaultFn(now).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(now).notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => [
    index("post_user_id_idx").on(table.userId),
    // Serves the `GET /api/posts` order (`created_at DESC, id DESC`) with a
    // backward scan, so a feed page reads the first rows of the index instead
    // of sorting every post.
    index("post_created_at_id_idx").on(table.createdAt, table.id),
    index("post_arweave_pending_idx")
      .on(table.createdAt)
      .where(sql`arweave_block_height is null`),
  ],
);

// --
// OpenTimestamps
// --

export const postOtsStatuses = ["PENDING", "UPGRADED", "FAILED"] as const;

// One OpenTimestamps proof per published post. The post metadata JSON uploaded
// to Arweave is the file being anchored, identified by `contentHash`.
export const postOts = sqliteTable(
  "post_ots",
  {
    postId: text("post_id")
      .primaryKey()
      .references(() => post.id, { onDelete: "cascade" }),
    status: text("status", { enum: postOtsStatuses })
      .default("PENDING")
      .notNull(),
    // Hex SHA-256 of the exact metadata bytes stored on Arweave.
    contentHash: text("content_hash").notNull(),
    // Pending `.ots` proof returned by the calendars, kept until it can be
    // upgraded to a Bitcoin-anchored proof.
    pendingProof: blob("pending_proof", { mode: "buffer" }),
    // Arweave transaction id of the upgraded `.ots` proof.
    otsTxId: text("ots_tx_id"),
    bitcoinBlockHeight: integer("bitcoin_block_height"),
    bitcoinBlockHash: text("bitcoin_block_hash"),
    bitcoinTimestamp: timestamp("bitcoin_timestamp"),
    createdAt: timestamp("created_at").$defaultFn(now).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(now).notNull(),
  },
  (table) => [
    oneOf("post_ots_status_check", table.status, postOtsStatuses),
    index("post_ots_status_idx").on(table.status),
  ],
);
