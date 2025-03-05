#!/bin/bash

if [ -z ${GRAB_SERVER_URL+x} ]; then GRAB_SERVER_URL="https://grab-api-dev.slindev.workers.dev/grab/v1/"; fi
if [ -z ${GRAB_IMAGES_SERVER_URL+x} ]; then GRAB_IMAGES_SERVER_URL="https://grab-images-dev.slin.dev/"; fi
if [ -z ${GRAB_PAGE_URL+x} ]; then GRAB_PAGE_URL="https://develop.grab-website.pages.dev"; fi

echo "export const SERVER_URL = '${GRAB_SERVER_URL}'" > website/src/configuration.js
echo "export const IMAGES_SERVER_URL = '${GRAB_IMAGES_SERVER_URL}'" >> website/src/configuration.js
echo "export const PAGE_URL = '${GRAB_PAGE_URL}'" >> website/src/configuration.js
echo "export const MAX_FORMAT_VERSION = 11" >> website/src/configuration.js

cd website
npm install
npm run build
