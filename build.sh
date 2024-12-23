#!/bin/bash

GRAB_SERVER_URL="https://api.slin.dev/grab/v1/";
GRAB_IMAGES_SERVER_URL="https://grab-images.slin.dev/";
if [ -z ${GRAB_PAGE_URL+x} ]; then GRAB_PAGE_URL="https://develop.grab-website.pages.dev"; fi

echo "export const SERVER_URL = '${GRAB_SERVER_URL}'" > website/src/configuration.js
echo "export const IMAGES_SERVER_URL = '${GRAB_IMAGES_SERVER_URL}'" >> website/src/configuration.js
echo "export const PAGE_URL = '${GRAB_PAGE_URL}'" >> website/src/configuration.js
echo "export const MAX_FORMAT_VERSION = 10" >> website/src/configuration.js

cd website
npm install
npm run build
