import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const userFlagEnum = pgEnum("UserFlag", ["NONE", "VERIFIED"]);

// --
// better-auth models
// --

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  lastLoginAt: timestamp("last_login_at", { precision: 3 }),
  flag: userFlagEnum("flag").default("NONE").notNull(),
  name: text("name"),
  email: text("email").unique("user_email_key"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { precision: 3 }).defaultNow().notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { precision: 3 }).notNull(),
    token: text("token").notNull().unique("session_token_key"),
    createdAt: timestamp("created_at", { precision: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 }).defaultNow().notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
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
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      precision: 3,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      precision: 3,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { precision: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 }).defaultNow().notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { precision: 3 }).notNull(),
    createdAt: timestamp("created_at", { precision: 3 }).defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 3 }).defaultNow(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// Wallet identity model added by the sign-in-with-stacks better-auth plugin.
export const walletAddress = pgTable(
  "wallet_address",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    address: text("address").notNull(),
    chainId: bigint("chain_id", { mode: "number" }).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: timestamp("created_at", { precision: 3 }).notNull(),
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

// Backing store for the persistent rate limiter (`RateLimiterFlexible` in the
// legacy Prisma schema).
export const rateLimiterFlexible = pgTable("rate_limiter_flexible", {
  key: text("key").primaryKey(),
  points: doublePrecision("points").notNull(),
  expire: timestamp("expire", { precision: 3 }),
});

// --
// Drafts
// --

export const draft = pgTable(
  "draft",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    coverImage: text("cover_image"),
    canonicalUri: text("canonical_uri"),
    txId: text("tx_id"),
    txStatus: text("tx_status"),
    tags: text("tags").array(),
    createdAt: timestamp("created_at", { precision: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 }).defaultNow().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => [index("draft_user_id_idx").on(table.userId)],
);

// --
// Posts
// --

export const post = pgTable(
  "post",
  {
    id: text("id").primaryKey(),
    draftId: text("draft_id").unique("post_draft_id_key"),
    version: text("version").notNull(),
    arweaveId: text("arweave_id").notNull().unique("post_arweave_id_key"),
    arweaveL1TxId: text("arweave_l1_tx_id"),
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
    tags: text("tags").array(),
    canonicalUri: text("canonical_uri"),
    signature: text("signature").unique("post_signature_key"),
    createdAt: timestamp("created_at", { precision: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 }).defaultNow().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => [
    index("post_user_id_idx").on(table.userId),
    index("post_arweave_pending_idx")
      .on(table.createdAt)
      .where(sql`arweave_block_height is null`),
  ],
);
