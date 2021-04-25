# Stage 1: Building the code
FROM node:14 AS builder

WORKDIR /app

COPY ./.yarnrc.yml ./.yarnrc.yml
COPY ./.yarn/releases ./.yarn/releases
COPY ./.yarn/plugins ./.yarn/plugins
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY ./blog-viewer/package.json ./blog-viewer/package.json
COPY ./sigle/package.json ./sigle/package.json

RUN yarn install --immutable

# Copy the rest of the code
COPY . .

# Build the next.js application
RUN yarn workspace sigle build
# Install only the production dependencies to reduce the image size
RUN yarn workspaces focus sigle --production

# Stage 2: And then copy over node_modules, etc from that stage to the smaller base image
FROM node:14 as production

WORKDIR /app

ENV NODE_ENV=production

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
