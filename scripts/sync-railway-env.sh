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
testnet web 67vnasjviroe2a6by4jdb5veaa
"

if [ $# -lt 1 ] || [ $# -gt 2 ]; then
  echo "usage: $0 <railway-environment> [<railway-service>]" >&2
  exit 1
fi

ENVIRONMENT="$1"
ONLY_SERVICE="${2:-}"

# Prints the names of the secrets in a 1Password Environment. Only the names
# come from this listing; `op run` hands over the values exactly as stored,
# without dotenv quoting to undo.
secret_names() {
  op environment secret list "$1" --format=dotenv |
    sed -n 's/^\([A-Za-z_][A-Za-z0-9_]*\)=.*/\1/p'
}

# `railway variable set --stdin` strips a value's trailing CR/LF, and passing
# the value as an argument would expose it in the process list, so such values
# are rejected before anything is written.
check_service() {
  local service="$1" op_environment="$2"

  # CR and LF are defined inside: `op run` empties whitespace-only variables,
  # and an empty pattern would flag every value.
  NAMES="$(secret_names "$op_environment")" SERVICE="$service" \
    op run --environment "$op_environment" -- bash -c '
      set -euo pipefail
      CR=$'"'"'\r'"'"'
      LF=$'"'"'\n'"'"'
      status=0
      for key in $NAMES; do
        case "${!key}" in
          *"$CR" | *"$LF")
            echo "$key for $SERVICE ends with a CR or LF, which Railway would strip" >&2
            status=1
            ;;
        esac
      done
      exit "$status"
    '
}

sync_service() {
  local service="$1" op_environment="$2"
  local names
  names="$(secret_names "$op_environment")"

  # Values go through stdin so they stay out of the process list. Railway
  # rejects an empty value on stdin, so empty values use `KEY=` instead.
  NAMES="$names" PROJECT_ID="$PROJECT_ID" ENVIRONMENT="$ENVIRONMENT" SERVICE="$service" \
    op run --environment "$op_environment" -- bash -c '
      set -euo pipefail
      for key in $NAMES; do
        if [ -z "${!key}" ]; then
          railway variable set "$key=" --skip-deploys \
            -p "$PROJECT_ID" -e "$ENVIRONMENT" -s "$SERVICE" >/dev/null
        else
          printf "%s" "${!key}" | railway variable set "$key" --stdin --skip-deploys \
            -p "$PROJECT_ID" -e "$ENVIRONMENT" -s "$SERVICE" >/dev/null
        fi
        echo "Set $key"
      done
    '

  echo "Set $(echo "$names" | grep -c .) variables on $service ($ENVIRONMENT), redeploying..."
  railway redeploy -p "$PROJECT_ID" -e "$ENVIRONMENT" -s "$service" --yes
}

services=()
op_environments=()
while read -r environment service op_environment; do
  [ "$environment" = "$ENVIRONMENT" ] || continue
  [ -z "$ONLY_SERVICE" ] || [ "$service" = "$ONLY_SERVICE" ] || continue
  services+=("$service")
  op_environments+=("$op_environment")
done <<< "$TARGETS"

if [ "${#services[@]}" -eq 0 ]; then
  echo "No target for environment '$ENVIRONMENT'${ONLY_SERVICE:+ and service '$ONLY_SERVICE'} in TARGETS" >&2
  exit 1
fi

# Check every target before writing to any of them
for i in "${!services[@]}"; do
  check_service "${services[$i]}" "${op_environments[$i]}"
done

for i in "${!services[@]}"; do
  sync_service "${services[$i]}" "${op_environments[$i]}"
done
