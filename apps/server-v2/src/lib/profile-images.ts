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

export const profileImageMaxBytes = (kind: ProfileImageKind): number =>
  maxMibByKind[kind] * 1024 * 1024;

export interface ProfileImageSettings {
  readonly quality: number;
  readonly width: number;
}

const settingsByStacksEnv: Record<
  AppConfigValues["STACKS_ENV"],
  Record<ProfileImageKind, ProfileImageSettings>
> = {
  mainnet: {
    avatar: { quality: 85, width: 1000 },
    cover: { quality: 85, width: 3000 },
  },
  testnet: {
    avatar: { quality: 75, width: 600 },
    cover: { quality: 75, width: 2000 },
  },
};

export const profileImageSettings = (
  stacksEnv: AppConfigValues["STACKS_ENV"],
  kind: ProfileImageKind,
): ProfileImageSettings => settingsByStacksEnv[stacksEnv][kind];

/**
 * Each profile image is stored under a fixed key so that re-uploading an avatar
 * or a cover replaces the previous file instead of accumulating objects.
 */
export const profileImageKey = (
  userId: string,
  kind: ProfileImageKind,
): string => `u/${userId}/${kind}.webp`;

/**
 * Appends the content version to the public URL so browsers and the CDN fetch
 * the replacement image even though the object key is stable.
 */
export const versionProfileImageUrl = (url: string, version: string): string =>
  `${url}?v=${version}`;

export const profileImagePostHogEvent = (kind: ProfileImageKind): string =>
  kind === "avatar" ? "profile media uploaded" : "profile cover media uploaded";
