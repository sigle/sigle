import { H3Event } from "h3";
import { RateLimiterPrisma, RateLimiterRes } from "rate-limiter-flexible";
import { prisma } from "~/lib/prisma";

interface RateLimitConfig {
  points: number;
  duration: number;
  blockDuration?: number;
}

interface RouteConfig {
  [route: string]: RateLimitConfig;
}

const defaultRouteConfigs: RouteConfig = {
  "/api/protected/user/profile": {
    points: 2,
    duration: 60,
    blockDuration: 10 * 60,
  },
};

// Create rate limiters map
const rateLimiters = new Map<string, RateLimiterPrisma>();

// Initialize rate limiters for each route
Object.entries(defaultRouteConfigs).forEach(([route, config]) => {
  rateLimiters.set(
    route,
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

  // Find matching route configuration
  const routeConfig = Object.entries(defaultRouteConfigs).find(([route]) =>
    path.startsWith(route),
  );

  // No rate limit for this route
  if (!routeConfig) return;

  const [route] = routeConfig;
  const rateLimiter = rateLimiters.get(route);

  if (!rateLimiter) return;

  const clientId = getClientIdentifier(event);

  try {
    const rateLimiterRes = await rateLimiter.consume(clientId);

    setHeaders(event, {
      "X-RateLimit-Limit": String(defaultRouteConfigs[route].points),
      "X-RateLimit-Remaining": String(rateLimiterRes.remainingPoints),
      "X-RateLimit-Reset": String(rateLimiterRes.msBeforeNext),
    });
  } catch (rateLimiterRes) {
    // Handle rate limit exceeded
    if (rateLimiterRes instanceof Error) throw rateLimiterRes;

    const res = rateLimiterRes as RateLimiterRes;

    setHeaders(event, {
      "X-RateLimit-Limit": String(defaultRouteConfigs[route].points),
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
