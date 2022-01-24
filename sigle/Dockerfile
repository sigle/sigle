# Stage 1: Building the code
FROM node:16 AS builder

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

WORKDIR /app

COPY pnpm-lock.yaml ./

RUN pnpm fetch

# Copy the rest of the code
COPY . .

RUN pnpm install -r --offline

# Build the next.js application
RUN pnpm run build --filter=sigle
# Install only the production dependencies to reduce the image size
RUN pnpm install --prod --filter=sigle

# Stage 2: And then copy over node_modules, etc from that stage to the smaller base image
FROM node:16 as production

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

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
