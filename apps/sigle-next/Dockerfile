ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine as base

WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ENV APP_NAME="sigle-next"

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
RUN apk update && \
    apk add --no-cache libc6-compat
COPY . .
RUN turbo prune @sigle/$APP_NAME --docker

# --- Build stage ---

FROM base as installer
WORKDIR /app

RUN apk update && \
    apk add --no-cache libc6-compat build-base gyp pkgconfig python3

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile --prod=false

COPY --from=builder /app/out/full/ .
# Copy contracts source to avoid cyclic dependency
COPY --from=builder /app/apps/contracts ./apps/contracts
COPY turbo.json turbo.json

WORKDIR /app/apps/$APP_NAME

# Add fake environment file for build to succeed
COPY ./apps/$APP_NAME/.env.development .env.production.local

# Build application
RUN pnpm turbo run build --filter=@sigle/$APP_NAME...

# --- Runner stage ---

FROM base AS runner
WORKDIR /app

# Copy built application
COPY --from=installer /app/apps/$APP_NAME/.next/standalone ./
COPY --from=installer /app/apps/$APP_NAME/.next/static ./apps/$APP_NAME/.next/static
COPY --from=installer /app/apps/$APP_NAME/public ./apps/$APP_NAME/public
COPY ./apps/$APP_NAME/.env.testnet.local ./.env.production.local

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD dotenvx run -- node apps/web/server.js
