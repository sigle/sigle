// The Cloudflare resources of each environment (R2 buckets, their API tokens,
// DNS records) and the server's R2 variables on Railway. The Railway services
// themselves are in `.railway/railway.ts`. See docs/deployment.md.
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Railway from "@alchemy.run/railway";
import * as Alchemy from "alchemy";
import * as Output from "alchemy/Output";
import { Stage } from "alchemy/Stage";
import { sha256 } from "alchemy/Util";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";

// Railway project "sigle-v2"
const RAILWAY_PROJECT_ID = "8d9c9801-6167-42e8-85a0-2b5d9a322649";

const STAGES = {
  testnet: {
    // Created by hand before this stack, kept to not move the uploaded files
    mediaBucket: "sigle-staging",
    backupsBucket: "sigle-testnet-litestream",
    webDomain: "testnet.sigle.io",
    apiDomain: "testnet-api.sigle.io",
    filesDomain: "testnet-files.sigle.io",
    railway: {
      environmentId: "713ad464-a9f7-49f8-b0b2-30d3769079ca",
      serverServiceId: "c342f754-b669-4b61-8561-d12d4d517179",
      // `railway domain status <domain> --service <service> --json` shows the
      // CNAME target Railway assigned to each custom domain
      webCname: "kf0q625h.up.railway.app",
      apiCname: "hm1bu1b8.up.railway.app",
    },
  },
} satisfies Record<string, StageConfig>;

interface StageConfig {
  mediaBucket: string;
  backupsBucket: string;
  webDomain: string;
  apiDomain: string;
  filesDomain: string;
  railway: {
    environmentId: string;
    serverServiceId: string;
    webCname: string;
    apiCname: string;
  };
}

export default Alchemy.Stack(
  "sigle",
  {
    providers: Layer.mergeAll(Cloudflare.providers(), Railway.providers()),
    // A Worker Alchemy deploys to the Cloudflare account on the first run, so
    // every machine shares the state
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const stage = yield* Stage;

    if (!Object.hasOwn(STAGES, stage)) {
      return yield* Effect.die(new Error(`Unknown stage "${stage}"`));
    }

    // SAFETY: `stage` is an own key of STAGES, checked above
    const config = STAGES[stage as keyof typeof STAGES];

    const { accountId } = yield* yield* Cloudflare.CloudflareEnvironment;

    // Images and other media uploaded by the server, public on the files
    // domain (`R2_PUBLIC_URL` on the server, `CDN_URL` on the website).
    // No `locationHint`: a bucket's location can't change, so setting one on
    // an existing bucket would replace it.
    const media = yield* Cloudflare.R2.Bucket("Media", {
      name: config.mediaBucket,
      domains: [{ name: config.filesDomain, zone: "sigle.io" }],
    }).pipe(Alchemy.RemovalPolicy.protect());

    // Litestream backups of the server's SQLite database, never public.
    // Litestream deletes its own old snapshots; the rule only clears the
    // multipart uploads of a server killed mid-upload.
    const backups = yield* Cloudflare.R2.Bucket("Backups", {
      name: config.backupsBucket,
      locationHint: "weur",
      lifecycleRules: [
        {
          id: "abort-multipart",
          abortMultipartUploadsTransition: {
            condition: { type: "Age", maxAge: 7 * 24 * 60 * 60 },
          },
        },
      ],
    }).pipe(Alchemy.RemovalPolicy.protect());

    const mediaCredentials = yield* bucketCredentials(
      "MediaToken",
      accountId,
      media,
    );

    const backupCredentials = yield* bucketCredentials(
      "BackupsToken",
      accountId,
      backups,
    );

    // The custom domains of the Railway services, proxied by Cloudflare
    yield* Cloudflare.DNS.Records("WebDomain", {
      zone: "sigle.io",
      type: "CNAME",
      content: config.railway.webCname,
      names: [config.webDomain],
      proxied: true,
    });

    yield* Cloudflare.DNS.Records("ApiDomain", {
      zone: "sigle.io",
      type: "CNAME",
      content: config.railway.apiCname,
      names: [config.apiDomain],
      proxied: true,
    });

    // The server's R2 variables. Only the variables belong to this stack: the
    // project and service are owned by `.railway/railway.ts`, which lists the
    // variables with `preserve()` so an apply keeps them.
    const server = {
      project: Railway.Project.lookup({ projectId: RAILWAY_PROJECT_ID }),
      environment: { environmentId: config.railway.environmentId },
      service: { serviceId: config.railway.serverServiceId },
    };

    const variables = {
      R2_ENDPOINT: `https://${accountId}.r2.cloudflarestorage.com`,
      R2_BUCKET: media.bucketName,
      R2_PUBLIC_URL: `https://${config.filesDomain}`,
      R2_ACCESS_KEY_ID: mediaCredentials.accessKeyId,
      R2_SECRET_ACCESS_KEY: mediaCredentials.secretAccessKey,
      LITESTREAM_BUCKET: backups.bucketName,
      LITESTREAM_ACCESS_KEY_ID: backupCredentials.accessKeyId,
      LITESTREAM_SECRET_ACCESS_KEY: backupCredentials.secretAccessKey,
    };

    for (const [name, value] of Object.entries(variables)) {
      yield* Railway.Variable(name, { ...server, name, value });
    }

    return { media: media.bucketName, backups: backups.bucketName };
  }),
);

// An account API token allowed to read and write the objects of one bucket
// only, as S3 credentials: R2 uses the token ID as the access key ID and the
// SHA-256 of the token value as the secret access key.
const bucketCredentials = (
  id: string,
  accountId: string,
  bucket: Cloudflare.R2.Bucket,
) =>
  Effect.gen(function* () {
    const token = yield* Cloudflare.ApiToken.AccountApiToken(id, {
      policies: [
        {
          effect: "allow",
          permissionGroups: [
            "Workers R2 Storage Bucket Item Read",
            "Workers R2 Storage Bucket Item Write",
          ],
          resources: bucket.bucketName.pipe(
            Output.map((name) => ({
              [`com.cloudflare.edge.r2.bucket.${accountId}_default_${name}`]:
                "*",
            })),
          ),
        },
      ],
    });

    return {
      accessKeyId: token.tokenId,
      secretAccessKey: token.value.pipe(
        Output.mapEffect((value) =>
          sha256(Redacted.value(value)).pipe(Effect.map(Redacted.make)),
        ),
      ),
    };
  });
