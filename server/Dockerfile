FROM node:18-alpine AS base

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

ENV APP_NAME="server"
RUN corepack enable pnpm
RUN npm i -g turbo
RUN apk add --no-cache libc6-compat python3 g++ make
RUN apk update

FROM base AS builder
# Set working directory
WORKDIR /app
COPY . .
RUN turbo prune --scope=@sigle/$APP_NAME --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo run db:generate --filter=@sigle/$APP_NAME
RUN pnpm turbo run build --filter=@sigle/$APP_NAME

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs
USER nestjs
COPY --from=installer /app .

WORKDIR /app/$APP_NAME

CMD pnpm run db:deploy && pnpm run start
