import {
  defineRailway,
  github,
  preserve,
  project,
  service,
  volume,
} from "railway/iac";

// Every service runs in the region of the server's database volume
const REGION = "europe-west4-drams3a";

export default defineRailway(() => {
  // Deploys wait for the GitHub checks of the commit to pass
  const sigle = github("sigle/sigle", { branch: "main", checkSuites: true });

  // The server's SQLite database, mounted at /data (`DATABASE_PATH` in the
  // server Dockerfile). Litestream backs it up to R2. A service with a volume
  // cannot have replicas, and Railway stops the old deployment before
  // starting the new one, so each deploy has a short downtime.
  const serverVolume = volume("server-volume", {
    alerts: { usage: { "100": {}, "80": {}, "95": {} } },
    allowOnlineResize: true,
    region: REGION,
    sizeMB: 5000,
  });

  const docs = service("docs", {
    source: sigle,
    build: {
      buildCommand: "pnpm build --filter='@sigle/docs'",
      buildEnvironment: "V3",
      builder: "RAILPACK",
      watchPatterns: ["/apps/docs/**", "/packages/sdk/**", "/pnpm-lock.yaml"],
    },
    replicas: { [REGION]: 1 },
    deploy: {
      limitOverride: { containers: { cpu: 0.5, memoryBytes: 500000000 } },
      sleepApplication: true,
    },
    networking: { privateNetworkEndpoint: "sigle-75430ad9" },
    env: { RAILPACK_SPA_OUTPUT_DIR: "apps/docs/dist" },
  });

  const web = service("web", {
    source: sigle,
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: "/apps/sigle/Dockerfile",
      watchPatterns: ["/apps/sigle/**", "/packages/sdk/**", "/pnpm-lock.yaml"],
    },
    healthcheck: "/health",
    healthcheckTimeout: 300,
    replicas: { [REGION]: 1 },
    deploy: {
      limitOverride: { containers: { cpu: 1, memoryBytes: 1000000000 } },
      sleepApplication: true,
      restartPolicyMaxRetries: 5,
    },
    domains: ["testnet.sigle.io"],
    networking: { privateNetworkEndpoint: "sigle-030004d6" },
    // Railway adds the OTEL_* variables on the next deploy, and
    // src/instrumentation.ts exports the app's spans with them.
    tracing: { enabled: true },
    env: {
      // Server-side calls to the API go over the private network, where the
      // API doesn't rate limit reads.
      API_INTERNAL_URL:
        // oxlint-disable-next-line no-template-curly-in-string Railway references
        "http://${{server.RAILWAY_PRIVATE_DOMAIN}}:${{server.PORT}}",
      // Secret, set from 1Password by scripts/sync-railway-env.sh. Read at
      // build time to upload the source maps to PostHog.
      POSTHOG_PERSONAL_API_KEY: preserve(),
    },
  });

  const server = service("server", {
    source: sigle,
    build: {
      buildEnvironment: "V3",
      builder: "DOCKERFILE",
      dockerfilePath: "/apps/server/Dockerfile",
      watchPatterns: ["/apps/server/**", "/packages/sdk/**", "/pnpm-lock.yaml"],
    },
    // No pre-deploy command: the server applies its migrations on startup.
    // Volumes are not mounted during pre-deploy anyway.
    healthcheck: "/health",
    healthcheckTimeout: 300,
    replicas: { [REGION]: 1 },
    deploy: {
      limitOverride: { containers: { cpu: 1, memoryBytes: 1000000000 } },
      sleepApplication: true,
      restartPolicyMaxRetries: 5,
      // Time between SIGTERM and SIGKILL, 0 by default. Litestream uploads
      // the commits of the last minute once the server has exited.
      drainingSeconds: 30,
    },
    domains: ["testnet-api.sigle.io"],
    networking: { privateNetworkEndpoint: "sigle" },
    volumeMounts: { "/data": serverVolume },
    // Railway adds the OTEL_* variables on the next deploy. Effect's exporter
    // also needs OTEL_TRACES_EXPORTER, which Railway doesn't set.
    tracing: { enabled: true },
    env: {
      // Railway mounts volumes as root, the image runs as the `server` user
      RAILWAY_RUN_UID: "0",
      // The port Railway assigns by default, set so the website can
      // reference it in API_INTERNAL_URL.
      PORT: "8080",
      OTEL_TRACES_EXPORTER: "otlp",
      // Secrets, set from 1Password by scripts/sync-railway-env.sh. A secret
      // added to 1Password must also be listed here or the next apply
      // deletes it.
      ARWEAVE_PRIVATE_KEY: preserve(),
      AUTH_SECRET: preserve(),
      // Optional, raises the Hiro API rate limits
      HIRO_API_KEY: preserve(),
      // Litestream backups: an R2 bucket of their own, with an API token
      // allowed to read and write that bucket only. Backups are off while
      // LITESTREAM_BUCKET is unset, see apps/server/start.sh.
      LITESTREAM_ACCESS_KEY_ID: preserve(),
      LITESTREAM_BUCKET: preserve(),
      LITESTREAM_SECRET_ACCESS_KEY: preserve(),
      // Key of the server's own PostHog project, for its events and errors.
      // Kept secret so only the server can send to that project.
      POSTHOG_API_KEY: preserve(),
      R2_ACCESS_KEY_ID: preserve(),
      R2_BUCKET: preserve(),
      R2_ENDPOINT: preserve(),
      R2_PUBLIC_URL: preserve(),
      R2_SECRET_ACCESS_KEY: preserve(),
    },
  });

  // Variables are managed, the CLI's default: this file owns every variable of
  // the services it declares. `variables: { managed }` is not in the SDK types.
  return project("sigle-v2", {
    resources: [docs, web, server, serverVolume],
  });
});
