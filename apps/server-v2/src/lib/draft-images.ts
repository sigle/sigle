import type { AppConfigValues } from "@/config";

/** Maximum size accepted for an image uploaded to a draft. */
export const DRAFT_IMAGE_MAX_MIB = 5;

export interface DraftImageSettings {
  readonly quality: number;
  readonly width: number;
}

/**
 * About twice the width of the post content column, so images stay sharp on
 * high density screens. Testnet keeps smaller files, like profile images.
 */
const settingsByStacksEnv: Record<
  AppConfigValues["STACKS_ENV"],
  DraftImageSettings
> = {
  mainnet: { quality: 85, width: 1600 },
  testnet: { quality: 75, width: 1000 },
};

export const draftImageSettings = (
  stacksEnv: AppConfigValues["STACKS_ENV"],
): DraftImageSettings => settingsByStacksEnv[stacksEnv];

/**
 * Draft images are keyed by their content hash, so each object is immutable
 * and re-uploading the same image is a no-op.
 */
export const draftImageKey = (
  userId: string,
  draftId: string,
  version: string,
): string => `u/${userId}/drafts/${draftId}/${version}.webp`;
