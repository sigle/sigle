#!/usr/bin/env bash
# Copies the variables of the 1Password Environments listed in TARGETS to their
# Railway services, then redeploys each service once so it picks them up.
#
# Usage: scripts/sync-railway-env.sh <railway-environment> [<railway-service>]
#
# Syncs every service of the Railway environment, or only the one given.
# Requires the 1Password CLI (v2.42+, signed in through the desktop app) and
# the Railway CLI (signed in with `railway login`). Variables removed from
# 1Password are not removed from Railway.
set -euo pipefail

# Railway project "sigle-v2"
PROJECT_ID="8d9c9801-6167-42e8-85a0-2b5d9a322649"

# <railway-environment> <railway-service> <1password-environment-id>
# Copy an Environment's ID in the 1Password app: Developer > View Environments >
# View environment > Manage environment > Copy environment ID.
TARGETS="
testnet server nno43tjcaj3qr4lh2xheon5xmu
"

if [ $# -lt 1 ] || [ $# -gt 2 ]; then
  echo "usage: $0 <railway-environment> [<railway-service>]" >&2
  exit 1
fi

ENVIRONMENT="$1"
ONLY_SERVICE="${2:-}"

sync_service() {
  local service="$1" op_environment="$2"

  # Only the names come from this listing; `op run` below hands over the
  # values exactly as stored, without dotenv quoting to undo.
  local names
  names="$(op environment secret list "$op_environment" --format=dotenv |
    sed -n 's/^\([A-Za-z_][A-Za-z0-9_]*\)=.*/\1/p')"

  # Values go through stdin so they stay out of the process list
  NAMES="$names" PROJECT_ID="$PROJECT_ID" ENVIRONMENT="$ENVIRONMENT" SERVICE="$service" \
    op run --environment "$op_environment" -- bash -c '
      set -euo pipefail
      for key in $NAMES; do
        printf "%s" "${!key}" | railway variable set "$key" --stdin --skip-deploys \
          -p "$PROJECT_ID" -e "$ENVIRONMENT" -s "$SERVICE" >/dev/null
        echo "Set $key"
      done
    '

  echo "Set $(echo "$names" | grep -c .) variables on $service ($ENVIRONMENT), redeploying..."
  railway redeploy -p "$PROJECT_ID" -e "$ENVIRONMENT" -s "$service" --yes
}

synced=0
# TARGETS is read on fd 3 so the commands in the loop cannot consume it from stdin
while read -r environment service op_environment <&3; do
  [ "$environment" = "$ENVIRONMENT" ] || continue
  [ -z "$ONLY_SERVICE" ] || [ "$service" = "$ONLY_SERVICE" ] || continue
  sync_service "$service" "$op_environment"
  synced=$((synced + 1))
done 3<<< "$TARGETS"

if [ "$synced" -eq 0 ]; then
  echo "No target for environment '$ENVIRONMENT'${ONLY_SERVICE:+ and service '$ONLY_SERVICE'} in TARGETS" >&2
  exit 1
fi
