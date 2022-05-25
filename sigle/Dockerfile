# Stage 1: Building the code
FROM node:16 AS builder

RUN corepack enable && corepack prepare pnpm@7.1.5 --activate

WORKDIR /app

COPY pnpm-lock.yaml ./

RUN pnpm fetch

# Copy the rest of the code
COPY . .

RUN pnpm install -r --offline

# Build the next.js application
RUN pnpm --filter=@sigle/app run build
# Install only the production dependencies to reduce the image size
RUN pnpm install --prod --filter=@sigle/app

# Stage 2: And then copy over node_modules, etc from that stage to the smaller base image
FROM node:16 as production

RUN corepack enable && corepack prepare pnpm@7.1.5 --activate

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/sigle/package.json ./sigle/package.json
COPY --from=builder /app/sigle/node_modules ./sigle/node_modules
COPY --from=builder /app/sigle/public ./sigle/public
COPY --from=builder /app/sigle/.next ./sigle/.next
COPY --from=builder /app/sigle/.env.production ./sigle/.env.production

EXPOSE 3000

WORKDIR /app/sigle

CMD ["pnpm", "run", "start"] 
