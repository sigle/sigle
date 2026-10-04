/**
 * Arweave tag names used by Sigle metadata transactions.
 */
export const ArweaveTags = {
  appName: "App-Name",
  author: "Author",
  type: "Type",
} as const;

/**
 * Values for the Arweave `Type` tag, used to distinguish the kind of metadata
 * stored in a transaction sharing the same `App-Name`.
 */
export const ArweaveTransactionTypes = {
  profile: "profile",
} as const;
