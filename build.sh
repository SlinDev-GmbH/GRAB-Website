#!/bin/bash

if [ -z ${GRAB_SERVER_URL+x} ]; then GRAB_SERVER_URL="https://grab-api-dev.slindev.workers.dev/grab/v1/"; fi
if [ -z ${GRAB_PAGE_URL+x} ]; then GRAB_PAGE_URL="https://develop.grab-website.pages.dev"; fi

echo "const SERVER_URL = '${GRAB_SERVER_URL}'" > public/configuration.js
echo "const PAGE_URL = '${GRAB_PAGE_URL}'" >> public/configuration.js
echo "const VIEWER_PATH = '/levels/viewer/'