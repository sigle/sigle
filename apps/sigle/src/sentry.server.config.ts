import * as Sentry from "@sentry/nextjs";
import { env } from "@/env";
import { dataCollection } from "@/sentry.shared";

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.NEXT_PUBLIC_STACKS_ENV,
  dataCollection,
  // Sentry only reports errors here. Registering its own OpenTelemetry tracer
  // provider would take the spans meant for Railway (see instrumentation.ts).
  enableOpenTelemetrySetup: false,
});
