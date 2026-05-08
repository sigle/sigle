import { createId } from "@paralleldrive/cuid2";
import { HTTPError } from "nitro/h3";
import { env } from "@/env";
import { prisma } from "./prisma";

/**
 * Verifies that a user has not exceeded their daily
 * or total upload quota before allowing an upload.
 * Throws an HTTPError 429 if either limit would be exceeded.
 */
export async function checkUploadQuota(userId: string, sizeBytes: number) {
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
    throw new HTTPError({
      status: 429,
      message: `Daily upload quota of ${formatBytes(env.UPLOAD_QUOTA_DAILY_BYTES)} exceeded.`,
    });
  }

  if (currentTotal + sizeBytes > env.UPLOAD_QUOTA_TOTAL_BYTES) {
    throw new HTTPError({
      status: 429,
      message: `Total upload quota of ${formatBytes(env.UPLOAD_QUOTA_TOTAL_BYTES)} exceeded.`,
    });
  }
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
