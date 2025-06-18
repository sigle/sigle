import * as Sentry from "@sentry/nextjs";
import { env } from "@/env";

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
});
