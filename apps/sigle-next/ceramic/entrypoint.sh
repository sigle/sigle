#!/bin/sh

# Replace env values in the config file
envsubst < daemon.config.json > daemon-env.config.json

# Run the ceramic daemon
./packages/cli/bin/ceramic.js daemon --config daemon-env.config.json
