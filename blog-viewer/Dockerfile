# Stage 1: Building the code
FROM node:14 AS builder

WORKDIR /app

COPY . .

RUN yarn install --immutable

# Build the next.js application
RUN yarn workspace blog-viewer build
# Install only the production dependencies to reduce the image size
RUN yarn workspaces focus blog-viewer --production

# Stage 2: And then copy over node_modules, etc from that stage to the smaller base image
FROM node:14 as production

WORKDIR /app

# COPY package.json next.config.js .env* ./
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/blog-viewer/package.json ./blog-viewer/package.json
COPY --from=builder /app/blog-viewer/prisma ./blog-viewer/prisma
COPY --from=builder /app/blog-viewer/public ./blog-viewer/public
COPY --from=builder /app/blog-viewer/.next ./blog-viewer/.next
COPY --from=builder /app/blog-viewer/.env.production ./blog-viewer/.env.production
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

WORKDIR /app/blog-viewer

CMD ["yarn", "start"] 
