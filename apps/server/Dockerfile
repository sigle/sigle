ARG NODE_VERSION=26
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /app

ENV NODE_ENV="production"

# Install pnpm and turbo at the versions pinned in the root package.json
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
COPY --link ./package.json ./
RUN PNPM_VERSION=$(grep -o '"packageManager": "[^"]*' package.json | cut -d'"' -f4 | cut -d'@' -f2) && \
    npm install -g pnpm@${PNPM_VERSION}
RUN TURBO_VERSION=$(grep -o '"turbo": "[^"]*' package.json | cut -d'"' -f4) && \
    pnpm install turbo@${TURBO_VERSION} --global

# --- Prune stage: keep only the server and the workspace packages it uses ---

FROM base AS pruner
COPY . .
RUN turbo prune @sigle/server --docker

# --- Build stage ---

FROM base AS builder

# Install the dependencies first, they change less often than the source
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# The lockfile records the pnpmfile checksum, a frozen install needs it
COPY .pnpmfile.mjs .pnpmfile.mjs
# `prepare` sets up local git hooks and tooling
RUN npm pkg delete scripts.prepare
RUN pnpm install --frozen-lockfile --prod=false --filter @sigle/server...

COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=@sigle/server...

# --- Runner stage ---

FROM base AS runner

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 server

# Production dependencies only. The SDK is bundled into dist/main.mjs.
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY .pnpmfile.mjs .pnpmfile.mjs
RUN npm pkg delete scripts.prepare
RUN pnpm install --frozen-lockfile --prod --filter @sigle/server

# Ships the database to R2 when `LITESTREAM_BUCKET` is set; see `start.sh`.
# The binary is static, so it runs on Alpine.
COPY --from=litestream/litestream:0.5.14 /usr/local/bin/litestream /usr/local/bin/litestream
COPY apps/server/litestream.yml /etc/litestream.yml

# The server applies the Drizzle migrations from ./drizzle on startup
COPY --from=builder --chown=server:nodejs /app/apps/server/dist ./apps/server/dist
COPY --from=pruner --chown=server:nodejs /app/out/full/apps/server/drizzle ./apps/server/drizzle
# Copied by name: a glob would also pick up local files such as .env.development.local
COPY --chown=server:nodejs apps/server/.env.testnet ./apps/server/.env.testnet
COPY --chown=server:nodejs --chmod=0755 apps/server/start.sh ./apps/server/start.sh

# The SQLite database lives on the volume mounted at /data. Railway mounts
# volumes as root, so the service sets RAILWAY_RUN_UID=0.
RUN mkdir /data && chown server:nodejs /data
ENV DATABASE_PATH=/data/sigle.db

USER server
WORKDIR /app/apps/server

# Configuration is read from the environment, see src/config.ts. The committed
# .env.<railway environment> file adds the non-secret values; variables already
# set on Railway take precedence over it.
EXPOSE 3001
CMD ["./start.sh"]
