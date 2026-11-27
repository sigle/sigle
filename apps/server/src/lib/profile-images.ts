import type { AppConfigValues } from "@/config";

export const profileImageKinds = ["avatar", "cover"] as const;

export type ProfileImageKind = (typeof profileImageKinds)[number];

/**
 * Maximum size accepted for a profile image upload. An avatar is displayed
 * small and never needs as many bytes as a cover.
 */
const maxMibByKind: Record<ProfileImageKind, number> = {
  avatar: 2,
  cover: 5,
};

export const profileImageMaxMib = (kind: ProfileImageKind): number =>
  maxMibByKind[kind];

export interface ProfileImageSettings {
  readonly height: number;
  readonly quality: number;
  readonly width: number;
}

/**
 * Avatars fit a square. Covers are shown cropped to about 4:1, so a 2:1 box
 * keeps every visible pixel of a landscape photo.
 */
const settingsByStacksEnv: Record<
  AppConfigValues["STACKS_ENV"],
  Record<ProfileImageKind, ProfileImageSettings>
> = {
  mainnet: {
    avatar: { height: 1000, quality: 85, width: 1000 },
    cover: { height: 1500, quality: 85, width: 3000 },
  },
  testnet: {
    avatar: { height: 600, quality: 75, width: 600 },
    cover: { height: 1000, quality: 75, width: 2000 },
  },
};

export const profileImageSettings = (
  stacksEnv: AppConfigValues["STACKS_ENV"],
  kind: ProfileImageKind,
): ProfileImageSettings => settingsByStacksEnv[stacksEnv][kind];

/**
 * Profile images are keyed by their content hash, like draft images: a new
 * avatar or cover never replaces the object behind a URL that a saved profile,
 * or a cache, may still use, so objects can be cached as immutable.
 */
export const profileImageKey = (
  userId: string,
  kind: ProfileImageKind,
  version: string,
): string => `${profileImagePrefix(userId, kind)}${version}.webp`;

/** Prefix of the keys of a user's avatars or covers. */
export const profileImagePrefix = (
  userId: string,
  kind: ProfileImageKind,
): string => `u/${userId}/${kind}/`;

export const profileImagePostHogEvent = (kind: ProfileImageKind): string =>
  kind === "avatar" ? "profile media uploaded" : "profile cover media uploaded";
