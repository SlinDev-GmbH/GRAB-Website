#!/usr/bin/env bash

if [ -z $1 ]; then
	echo "Usage: ./scripts/copy-cosmetics.sh <path/to/GRAB-Game/>"
	exit 1
fi

source_dir="${1}Resources/cosmetics"
dest_dir="website/public/cosmetics"

cp -r "$source_dir"/* "$dest_dir"/
