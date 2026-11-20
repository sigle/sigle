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

# --- Prune stage: keep only server-v2 and the workspace packages it uses ---

FROM base AS pruner
COPY . .
RUN turbo prune @sigle/server-v2 --docker

# --- Build stage ---

FROM base AS builder

# Install the dependencies first, they change less often than the source
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# The lockfile records the pnpmfile checksum, a frozen install needs it
COPY .pnpmfile.mjs .pnpmfile.mjs
# `prepare` sets up local git hooks and tooling
RUN npm pkg delete scripts.prepare
RUN pnpm install --frozen-lockfile --prod=false --filter @sigle/server-v2...

COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=@sigle/server-v2...

# --- Runner stage ---

FROM base AS runner

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 server

# Production dependencies only. The SDK is bundled into dist/main.mjs.
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY .pnpmfile.mjs .pnpmfile.mjs
RUN npm pkg delete scripts.prepare
RUN pnpm install --frozen-lockfile --prod --filter @sigle/server-v2

# The server applies the Drizzle migrations from ./drizzle on startup
COPY --from=builder --chown=server:nodejs /app/apps/server-v2/dist ./apps/server-v2/dist
COPY --from=pruner --chown=server:nodejs /app/out/full/apps/server-v2/drizzle ./apps/server-v2/drizzle

USER server
WORKDIR /app/apps/server-v2

# Configuration is read from the environment, see src/config.ts
EXPOSE 3001
CMD ["node", "dist/main.mjs"]
