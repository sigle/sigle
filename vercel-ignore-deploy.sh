#!/bin/bash

# Get current Git branch name
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Check if branch name starts with "v1-" or is exactly "v1"
if [[ $BRANCH == "v1" || $BRANCH == v1-* ]]; then
    # Build needed
    exit 1
else
    # Skip build
    exit 0
fi
