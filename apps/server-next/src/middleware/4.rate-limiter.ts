import { H3Event } from "h3";
import { RateLimiterPrisma, RateLimiterRes } from "rate-limiter-flexible";
import { addRoute, createRouter, findRoute } from "rou3";
import { prisma } from "~/lib/prisma";

interface RateLimitConfig {
  points: number;
  duration: number;
  blockDuration?: number;
}

interface RouteConfig {
  path: string;
  method: string;
  config: RateLimitConfig;
}

// Define route configurations
const routeConfigs: RouteConfig[] = [
  {
    path: "/api/protected/user/profile/upload-avatar",
    method: "POST",
    config: {
      // limit to 4 requests per user per minute
      points: 4,
      duration: 60,
      blockDuration: 10 * 60,
    },
  },
  {
    path: "/api/protected/user/profile/upload-cover",
    method: "POST",
    config: {
      // limit to 4 requests per user per minute
      points: 4,
      duration: 60,
      blockDuration: 10 * 60,
    },
  },
  {
    path: "/api/protected/user/profile/upload-metadata",
    method: "POST",
    config: {
      // limit to 4 requests per user per minute
      points: 4,
      duration: 60,
      blockDuration: 10 * 60,
    },
  },
];

const router = createRouter<RouteConfig>();

const rateLimiters = new Map<string, RateLimiterPrisma>();

routeConfigs.forEach((routeConfig) => {
  const { path, method, config } = routeConfig;
  addRoute(router, method, path, routeConfig);

  rateLimiters.set(
    path,
    new RateLimiterPrisma({
      storeClient: prisma,
      points: config.points,
      duration: config.duration,
      blockDuration: config.blockDuration,
    }),
  );
});

// Helper function to get client identifier
function getClientIdentifier(event: H3Event): string {
  const userId = event.context.user?.id;
  if (userId) return `user_${userId}`;

  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  return `ip_${ip}`;
}

export default defineEventHandler(async (event) => {
  const path = event.path;
  const method = event.method;

  const match = findRoute<RouteConfig>(router, method, path);

  // No rate limit for this route
  if (!match) return;

  console.log("match", match);

  const config = match.data.config;
  const routePath = match.data.path;
  const rateLimiter = rateLimiters.get(routePath);

  if (!rateLimiter) return;

  const clientId = getClientIdentifier(event);

  try {
    const rateLimiterRes = await rateLimiter.consume(clientId);

    setHeaders(event, {
      "X-RateLimit-Limit": String(config.points),
      "X-RateLimit-Remaining": String(rateLimiterRes.remainingPoints),
      "X-RateLimit-Reset": String(rateLimiterRes.msBeforeNext),
    });
  } catch (rateLimiterRes) {
    // Handle rate limit exceeded
    if (rateLimiterRes instanceof Error) throw rateLimiterRes;

    const res = rateLimiterRes as RateLimiterRes;

    setHeaders(event, {
      "X-RateLimit-Limit": String(config.points),
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(res.msBeforeNext),
      "Retry-After": String(Math.ceil(res.msBeforeNext / 1000)),
    });

    throw createError({
      statusCode: 429,
      statusMessage: "Too Many Requests",
      message: `Rate limit exceeded. Please try again in ${Math.ceil(
        res.msBeforeNext / 1000,
      )} seconds.`,
    });
  }
});
