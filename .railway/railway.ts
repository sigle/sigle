import {
  defineRailway,
  github,
  postgres,
  preserve,
  project,
  service,
  volume,
} from "railway/iac";

// Every service runs next to the database
const REGION = "europe-west4-drams3a";

export default defineRailway(() => {
  // Deploys wait for the GitHub checks of the commit to pass
  const sigle = github("sigle/sigle", { branch: "main", checkSuites: true });

  const postgresDb = postgres("postgres-db", { region: REGION });

  // `postgres()` only takes a region, the other settings go on the node
  postgresDb.deploy = {
    limitOverride: { containers: { cpu: 1, memoryBytes: 1000000000 } },
    multiRegionConfig: { [REGION]: { numReplicas: 1 } },
  };
  postgresDb.networking = {
    privateNetworkEndpoint: "postgres-55jl",
    // No public TCP proxy: the services reach the database privately. A null
    // entry removes the proxy, leaving the port out would keep it.
    tcpProxies: { "5432": null },
  };

  // The data volume of postgres-db, mounted at /var/lib/postgresql/data. The
  // database owns the mount; the volume is declared so an apply keeps it.
  const wireVolume = volume("wire-volume", {
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
  });

  const server = service("server", {
    source: sigle,
    build: {
      buildEnvironment: "V3",
      builder: "DOCKERFILE",
      dockerfilePath: "/apps/server/Dockerfile",
      watchPatterns: ["/apps/server/**", "/packages/sdk/**", "/pnpm-lock.yaml"],
    },
    // No pre-deploy command: the server applies its migrations on startup
    healthcheck: "/health",
    healthcheckTimeout: 300,
    replicas: { [REGION]: 1 },
    deploy: {
      limitOverride: { containers: { cpu: 1, memoryBytes: 1000000000 } },
      sleepApplication: true,
      restartPolicyMaxRetries: 5,
    },
    domains: ["testnet-api.sigle.io"],
    networking: { privateNetworkEndpoint: "sigle" },
    env: {
      DATABASE_URL: postgresDb.env.DATABASE_URL,
      // Secrets, set from 1Password by scripts/sync-railway-env.sh. A secret
      // added to 1Password must also be listed here or the next apply
      // deletes it.
      ARWEAVE_PRIVATE_KEY: preserve(),
      AUTH_SECRET: preserve(),
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
    resources: [postgresDb, docs, web, server, wireVolume],
  });
});
