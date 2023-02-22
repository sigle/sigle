#!/bin/sh
envsubst < daemon.config.json > daemon.config.json

# This will exec the CMD from your Dockerfile, i.e. "npm start"
exec "$@"
