#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPOS_DIR="$ROOT_DIR/repos"

mkdir -p "$REPOS_DIR"

# Format: "dir_name|repo_url|branch"
REPOS=(
  "effect|https://github.com/Effect-TS/effect.git|main"
)

for entry in "${REPOS[@]}"; do
  IFS='|' read -r name url branch <<< "$entry"
  target="$REPOS_DIR/$name"

  if [ -d "$target/.git" ]; then
    echo "Updating $name ($branch)..."
    git -C "$target" fetch --depth 1 origin "$branch"
    git -C "$target" reset --hard "origin/$branch"
  else
    echo "Cloning $name ($branch)..."
    git clone --depth 1 --single-branch --branch "$branch" "$url" "$target"
  fi
done
