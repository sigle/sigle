# Stage 1: Building the code
FROM node:14 AS builder

WORKDIR /app

ENV APP_URL="https://dev.sigle.io"
# TODO uncomment when pushing to prod
# ENV FATHOM_SITE_ID="DLJCUFGQ"

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build
RUN yarn install --production --frozen-lockfile


# Stage 2: And then copy over node_modules, etc from that stage to the smaller base image
FROM node:14 as production

WORKDIR /app

# COPY package.json next.config.js .env* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"] 
