import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import type { UploadProfileMetadataPayload } from "@/api/groups/profile";
import { SigleApi } from "@/api";
import { CurrentUser } from "@/api/middleware/auth-user";
import { InternalServerError } from "@/api/schemas";
import { ArweaveService } from "@/services/arweave";
import { PostHogService } from "@/services/posthog";

export const uploadProfileMetadata = (
  payload: typeof UploadProfileMetadataPayload.Type,
) =>
  Effect.gen(function* () {
    const user = yield* CurrentUser;
    const arweave = yield* ArweaveService;
    const posthog = yield* PostHogService;

    const file = Buffer.from(JSON.stringify(payload.metadata));

    const result = yield* arweave
      .uploadFile({
        file,
        contentType: "application/json",
      })
      .pipe(
        Effect.mapError(
          (error) =>
            new InternalServerError({
              message: `Failed to upload to Arweave, error: ${error.message}`,
            }),
        ),
      );

    yield* posthog.capture({
      distinctId: user.id,
      event: "profile metadata uploaded",
      properties: {
        arweaveId: result.id,
      },
    });

    return result;
  });

export const ProfileHandlersLayer = HttpApiBuilder.group(
  SigleApi,
  "profile",
  (handlers) =>
    handlers.handle("uploadMetadata", ({ payload }) =>
      uploadProfileMetadata(payload),
    ),
);
