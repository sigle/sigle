ARG NODE_VERSION=26
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ENV APP_NAME="sigle"

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN apk add --no-cache git
COPY --link ./package.json ./
RUN PNPM_VERSION=$(grep -o '"packageManager": "[^"]*' package.json | cut -d'"' -f4 | cut -d'@' -f2) && \
    npm install -g pnpm@${PNPM_VERSION}
RUN TURBO_VERSION=$(grep -o '"turbo": "[^"]*' package.json | cut -d'"' -f4) && \
    pnpm install turbo@${TURBO_VERSION} --global

# --- Turbo stage ---

FROM base AS builder
WORKDIR /app
RUN apk update && \
    apk add --no-cache libc6-compat
COPY . .
RUN turbo prune @sigle/$APP_NAME --docker

# --- Build stage ---

FROM base AS installer
WORKDIR /app

RUN apk update && \
    apk add --no-cache libc6-compat build-base gyp pkgconfig python3

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
# The lockfile records the pnpmfile checksum, a frozen install needs it
COPY .pnpmfile.mjs .pnpmfile.mjs
RUN npm pkg delete scripts.prepare
RUN pnpm install --frozen-lockfile --prod=false

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

WORKDIR /app/apps/$APP_NAME

# Add fake environment file for build to succeed
COPY ./apps/$APP_NAME/.env.development .env.production
# NEXT_PUBLIC_* values are inlined at build time, so the image is built with
# the committed file of the Railway environment it deploys to (Railway passes
# RAILWAY_ENVIRONMENT_NAME to this ARG). A missing file stops the build rather
# than shipping another environment's URLs.
ARG RAILWAY_ENVIRONMENT_NAME
RUN test -n "$RAILWAY_ENVIRONMENT_NAME" || (echo "RAILWAY_ENVIRONMENT_NAME is required" && exit 1)
COPY ./apps/$APP_NAME/.env.${RAILWAY_ENVIRONMENT_NAME} .env.production.local

# Railway passes these service variables to the build, which uploads the
# source maps to PostHog (next.config.ts). They stay out of the final image.
ARG POSTHOG_PERSONAL_API_KEY
ARG RAILWAY_GIT_COMMIT_SHA

# Build application
RUN pnpm turbo run build --filter=@sigle/$APP_NAME...

# --- Runner stage ---

# The standalone server only needs Node: not git, pnpm or turbo from `base`.
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV="production"

COPY --from=installer --chown=node:node /app/apps/sigle/.next/standalone ./
COPY --from=installer --chown=node:node /app/apps/sigle/.next/static ./apps/sigle/.next/static
COPY --from=installer --chown=node:node /app/apps/sigle/public ./apps/sigle/public

USER node

EXPOSE 3000
CMD ["node", "apps/sigle/server.js"]
