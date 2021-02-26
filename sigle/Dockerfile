# Stage 1: Building the code
FROM node:14 AS builder

WORKDIR /app

COPY . .

RUN yarn install --immutable

# Build the next.js application
RUN yarn workspace sigle build
# Install only the production dependencies to reduce the image size
RUN yarn workspaces focus sigle --production

# Stage 2: And then copy over node_modules, etc from that stage to the smaller base image
FROM node:14 as production

WORKDIR /app

# COPY package.json next.config.js .env* ./
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/sigle/package.json ./sigle/package.json
COPY --from=builder /app/sigle/public ./sigle/public
COPY --from=builder /app/sigle/.next ./sigle/.next
COPY --from=builder /app/sigle/.env.production ./sigle/.env.production
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

WORKDIR /app/sigle

CMD ["yarn", "start"] 
