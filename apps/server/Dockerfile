ARG NODE_VERSION=20

# Required for railway
ARG RAILWAY_SERVICE_ID=local

# Injected by builder
ARG NODE_ENV
ARG PORT
ARG APP_URL
ARG EMAIL_FROM
ARG EMAIL_SERVER_HOST
ARG EMAIL_SERVER_PASSWORD
ARG EMAIL_SERVER_PORT
ARG EMAIL_SERVER_USER
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG PG_DATABASE_URL
ARG PLAUSIBLE_API_TOKEN
ARG PLAUSIBLE_SITE_ID
ARG POSTHOG_API_KEY
ARG REDIS_DATABASE_URL
ARG SENTRY_DSN

# Alpine image
FROM node:${NODE_VERSION}-alpine AS alpine
ENV APP_NAME="server"
ENV PROJECT="@sigle/$APP_NAME"
RUN apk update
RUN apk add --no-cache libc6-compat

# Setup pnpm and turbo on the alpine base
FROM alpine AS base
RUN corepack enable pnpm
RUN npm i -g turbo@2
RUN pnpm config set store-dir ~/.pnpm-store

# Prune projects
FROM base AS pruner

WORKDIR /app
COPY . .
RUN turbo prune $PROJECT --docker

# Build the project
FROM base AS builder

WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# First install the dependencies (as they change less often)
RUN pnpm install --frozen-lockfile

# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

RUN turbo run db:generate --filter=$PROJECT
RUN turbo build --filter=$PROJECT
RUN pnpm prune --prod --no-optional

# Final image
FROM alpine AS runner

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app .
WORKDIR /app/apps/$APP_NAME

ENV NODE_ENV=production

CMD npm run db:deploy && npm run start
