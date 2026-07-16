import { createId } from "@paralleldrive/cuid2";
import { Result, TaggedError } from "better-result";
import { env } from "@/env";
import { prisma } from "./prisma";

export class QuotaExceededError extends TaggedError("QuotaExceededError")<{
  message: string;
  type: "daily" | "total";
}>() {}

/**
 * Verifies that a user has not exceeded their daily
 * or total upload quota before allowing an upload.
 * Returns a Result with QuotaExceededError if either limit is exceeded.
 */
export async function checkUploadQuota(
  userId: string,
  sizeBytes: number,
): Promise<Result<void, QuotaExceededError>> {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const [totalAgg, dailyAgg] = await Promise.all([
    prisma.userUpload.aggregate({
      where: { userId },
      _sum: { sizeBytes: true },
    }),
    prisma.userUpload.aggregate({
      where: {
        userId,
        createdAt: { gte: startOfToday },
      },
      _sum: { sizeBytes: true },
    }),
  ]);

  const currentTotal = totalAgg._sum.sizeBytes ?? 0;
  const currentDaily = dailyAgg._sum.sizeBytes ?? 0;

  if (currentDaily + sizeBytes > env.UPLOAD_QUOTA_DAILY_BYTES) {
    return Result.err(
      new QuotaExceededError({
        type: "daily",
        message: `Daily upload quota of ${formatBytes(env.UPLOAD_QUOTA_DAILY_BYTES)} exceeded.`,
      }),
    );
  }

  if (currentTotal + sizeBytes > env.UPLOAD_QUOTA_TOTAL_BYTES) {
    return Result.err(
      new QuotaExceededError({
        type: "total",
        message: `Total upload quota of ${formatBytes(env.UPLOAD_QUOTA_TOTAL_BYTES)} exceeded.`,
      }),
    );
  }

  return Result.ok(undefined);
}

/**
 * Persists an upload record after a successful
 * S3 upload so future quota checks can account for it.
 */
export async function recordUpload({
  userId,
  cid,
  sizeBytes,
  contentType,
}: {
  userId: string;
  cid: string;
  sizeBytes: number;
  contentType: string;
}) {
  await prisma.userUpload.create({
    data: {
      id: createId(),
      userId,
      cid,
      sizeBytes,
      contentType,
    },
  });
}

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)}GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)}MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${bytes}B`;
}
