# Stage 1: Building the code
FROM node:14 AS builder

RUN curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm

WORKDIR /app

COPY pnpm-lock.yaml ./

RUN pnpm fetch

# Copy the rest of the code
COPY . .

RUN pnpm install -r --offline

# Build the next.js application
RUN pnpm run build --filter=blog-viewer
# Install only the production dependencies to reduce the image size
RUN pnpm install --prod --filter=blog-viewer

# Stage 2: And then copy over node_modules, etc from that stage to the smaller base image
FROM node:14 as production

RUN curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/blog-viewer/prisma ./blog-viewer/prisma
COPY --from=builder /app/blog-viewer/package.json ./blog-viewer/package.json
COPY --from=builder /app/blog-viewer/node_modules ./blog-viewer/node_modules
COPY --from=builder /app/blog-viewer/public ./blog-viewer/public
COPY --from=builder /app/blog-viewer/.next ./blog-viewer/.next
COPY --from=builder /app/blog-viewer/.env.production ./blog-viewer/.env.production

EXPOSE 3000

WORKDIR /app/blog-viewer

CMD ["pnpm", "run", "start"] 
