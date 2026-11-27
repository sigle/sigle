import type { AppConfigValues } from "@/config";

/** Maximum size accepted for an image uploaded to a draft. */
export const DRAFT_IMAGE_MAX_MIB = 5;

export interface DraftImageSettings {
  readonly height: number;
  readonly quality: number;
  readonly width: number;
}

/**
 * About twice the width of the post content column, so images stay sharp on
 * high density screens, and twice as tall, which keeps phone screenshots at
 * full size. Testnet keeps smaller files, like profile images.
 */
const settingsByStacksEnv: Record<
  AppConfigValues["STACKS_ENV"],
  DraftImageSettings
> = {
  mainnet: { height: 3200, quality: 85, width: 1600 },
  testnet: { height: 2000, quality: 75, width: 1000 },
};

export const draftImageSettings = (
  stacksEnv: AppConfigValues["STACKS_ENV"],
): DraftImageSettings => settingsByStacksEnv[stacksEnv];

/**
 * Draft images are keyed by their content hash, so each object is immutable,
 * and uploading the same optimized image again writes the same bytes to the
 * same key and returns the same URL.
 */
export const draftImageKey = (
  userId: string,
  draftId: string,
  version: string,
): string => `u/${userId}/drafts/${draftId}/${version}.webp`;
