#!/bin/bash

# Define the URL and target paths
URL="https://cdn.shinobi.video/modules/shinobi-peer-server.zip"
TOOLS_DIR="$(dirname "$0")"
PACKAGE_ROOT="$(realpath "$TOOLS_DIR/..")"
NODE_MODULES_DIR="$PACKAGE_ROOT/node_modules"
EXTRACTION_DIR="$NODE_MODULES_DIR/shinobi-peer-server"
ZIP_FILE="$TOOLS_DIR/shinobi-peer-server.zip"
SAVED_IDENTIFIERS="$PACKAGE_ROOT/savedIdentifiers.json"



# Create node_modules directory if it doesn't exist
[ ! -d "$NODE_MODULES_DIR" ] && mkdir -p "$NODE_MODULES_DIR"

# Remove the existing folder if it exists
[ -d "$EXTRACTION_DIR" ] && rm -rf "$EXTRACTION_DIR"

# Download the zip file silently
curl -sL -o "$ZIP_FILE" "$URL"

# Check if the download was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to download $URL" >&2
    exit 1
fi

# Extract the zip file to node_modules silently
unzip -q "$ZIP_FILE" -d "$NODE_MODULES_DIR"

# Verify the folder exists after extraction
if [ ! -d "$EXTRACTION_DIR" ]; then
    echo "Error: The folder shinobi-peer-server was not found after extraction." >&2
    exit 1
fi

# Clean up the downloaded zip file
rm -f "$ZIP_FILE"

if [ ! -f "$SAVED_IDENTIFIERS" ]; then
    echo "[]" > "$SAVED_IDENTIFIERS"
fi
