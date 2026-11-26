import type { paths } from "@sigle/sdk";
import { ContentWarning as MetadataContentWarning } from "@sigle/sdk";

export type ContentWarning = NonNullable<
  paths["/api/posts/{postId}"]["get"]["responses"]["200"]["content"]["application/json"]["contentWarning"]
>;

interface ContentWarningDetails {
  label: string;
  /** Shown to the writer when they pick a warning. */
  description: string;
  /** The value of `contentWarning` in the signed post metadata. */
  metadata: MetadataContentWarning;
}

/** Content warnings in the order the editor lists them. */
export const CONTENT_WARNINGS: Record<ContentWarning, ContentWarningDetails> = {
  sensitive: {
    label: "Sensitive",
    description: "Upsetting topics, such as violence or self-harm.",
    metadata: MetadataContentWarning.SENSITIVE,
  },
  nsfw: {
    label: "NSFW",
    description: "Not safe for work, such as nudity or sexual content.",
    metadata: MetadataContentWarning.NSFW,
  },
  spoiler: {
    label: "Spoiler",
    description: "Reveals the plot of a book, film, show or game.",
    metadata: MetadataContentWarning.SPOILER,
  },
};

/**
 * Whether the post page hides the whole post until the reader chooses to see
 * it. A spoiler only hides its cover, readers open it knowing what it is about.
 */
export const hidesPost = (warning: ContentWarning) => warning !== "spoiler";
