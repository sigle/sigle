#!/bin/sh
# Starts the Sigle server. With `LITESTREAM_BUCKET` set, Litestream restores
# the database if the volume has none, then runs the server and ships the
# database to that R2 bucket as it changes (see litestream.yml), forwarding
# stop signals to the server and syncing once more when it exits.
# The committed .env.<railway environment> file adds the non-secret values.
set -u

: "${DATABASE_PATH:?DATABASE_PATH is required}"

server="node --env-file-if-exists=.env.${RAILWAY_ENVIRONMENT_NAME:-} dist/main.mjs"

if [ -z "${LITESTREAM_BUCKET:-}" ]; then
  echo "Database backups off: LITESTREAM_BUCKET is not set"
  exec $server
fi
: "${R2_ENDPOINT:?R2_ENDPOINT is required with LITESTREAM_BUCKET}"
: "${LITESTREAM_ACCESS_KEY_ID:?LITESTREAM_ACCESS_KEY_ID is required with LITESTREAM_BUCKET}"
: "${LITESTREAM_SECRET_ACCESS_KEY:?LITESTREAM_SECRET_ACCESS_KEY is required with LITESTREAM_BUCKET}"

# A missing database (a new or wiped volume) is restored from the latest
# backup, if there is one. A failed restore stops here rather than starting
# on an empty database that Litestream would then replicate.
litestream restore -if-db-not-exists -if-replica-exists "$DATABASE_PATH" || exit 1

exec litestream replicate -exec "$server"
