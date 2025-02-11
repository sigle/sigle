#!/bin/bash

# In Vercel, ignore the build of the v1 apps if it's not from the v1 branch
# Get current Git branch name
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $BRANCH"

# Check if branch name starts with "v1-" or is exactly "v1"
if [[ $BRANCH == "v1" || $BRANCH == v1-* ]]; then
    echo "Building: Branch matches v1 pattern"
    # Build needed
    exit 1
else
    echo "Skipping: Branch does not match v1 pattern"
    # Skip build
    exit 0
fi
