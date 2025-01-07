ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine as base

WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ENV APP_NAME="server-next"

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY --link ./package.json ./
RUN corepack enable && corepack install
RUN pnpm install turbo@^2 --global
RUN pnpm install @dotenvx/dotenvx@^1 --global

# --- Turbo stage ---

FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune @sigle/$APP_NAME --docker

# --- Build stage ---

FROM base as installer
WORKDIR /app

RUN apk update && \
    apk add --no-cache libc6-compat python3 g++ make

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile --prod=false

COPY --from=builder /app/out/full/ .
# Copy contracts source to avoid cyclic dependency
COPY --from=builder /app/apps/contracts ./apps/contracts
COPY turbo.json turbo.json

WORKDIR /app/apps/$APP_NAME

# Build application
RUN pnpm turbo run db:generate --filter=@sigle/$APP_NAME
RUN pnpm turbo run build --filter=@sigle/$APP_NAME...

# --- Runner stage ---

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nitro

# Copy built application
COPY --from=installer --chown=nitro:nodejs /app/apps/$APP_NAME/.output ./.output
COPY --from=installer --chown=nitro:nodejs /app/apps/$APP_NAME/package.json ./package.json
COPY --from=installer --chown=nitro:nodejs /app/apps/$APP_NAME/scripts ./scripts
COPY --from=builder --chown=nitro:nodejs /app/apps/$APP_NAME/.env.testnet.local ./.env.testnet.local
RUN node scripts/prod-deps.js
RUN pnpm install --frozen-lockfile

USER nitro

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD dotenvx run -- npm run db:migrate:prod && dotenvx run -- node .output/server/index.mjs
