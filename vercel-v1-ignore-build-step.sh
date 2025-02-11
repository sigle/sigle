#!/bin/bash

# In Vercel, ignore the build of the v1 apps if it's not from the v1 branch

# Get current Git branch name
BRANCH=$VERCEL_GIT_COMMIT_REF
echo "Current branch: $BRANCH"

# Check if branch name starts with "v1-" or is exactly "v1"
if [[ $BRANCH == "v1" || $BRANCH == v1-* ]]; then
    echo "Building: Branch matches v1 pattern"
    exit 1
else
    echo "Skipping: Branch does not match v1 pattern"
    exit 0
fi
