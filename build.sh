#!/bin/bash

if [ -z ${GRAB_SERVER_URL+x} ]; then GRAB_SERVER_URL="https://grab-api-dev.slindev.workers.dev/grab/v1/"; fi

echo "const SERVER_URL = '${GRAB_SERVER_URL}'" > configuration.js