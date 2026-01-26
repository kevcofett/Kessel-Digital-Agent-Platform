#!/bin/bash
# Upload KB files to SharePoint using Microsoft Graph API via Azure CLI
# Usage: ./upload-kb-graph.sh <source_folder> <target_folder>
# Example: ./upload-kb-graph.sh ./release/v5.5/agents/mpa/base/kb MPA

set -e

SOURCE_PATH="${1:-.}"
TARGET_FOLDER="${2:-MPA}"
SITE_URL="kesseldigital.sharepoint.com:/sites/AragornAI"
LIBRARY="KB"

echo "========================================"
echo "SharePoint KB Upload via Graph API"
echo "========================================"
echo "Source: $SOURCE_PATH"
echo "Target: $SITE_URL/$LIBRARY/$TARGET_FOLDER"
echo "========================================"

# Get site ID
echo "Getting SharePoint site ID..."
SITE_ID=$(az rest --method GET \
  --url "https://graph.microsoft.com/v1.0/sites/${SITE_URL}" \
  --query "id" -o tsv 2>/dev/null)

if [ -z "$SITE_ID" ]; then
  echo "ERROR: Could not get site ID. Check site URL and permissions."
  exit 1
fi
echo "Site ID: $SITE_ID"

# Get drive ID (document library)
echo "Getting document library drive ID..."
DRIVE_ID=$(az rest --method GET \
  --url "https://graph.microsoft.com/v1.0/sites/${SITE_ID}/drives" \
  --query "value[?name=='$LIBRARY'].id | [0]" -o tsv 2>/dev/null)

if [ -z "$DRIVE_ID" ]; then
  echo "ERROR: Could not find document library '$LIBRARY'"
  exit 1
fi
echo "Drive ID: $DRIVE_ID"

# Check/create target folder
echo "Checking target folder '$TARGET_FOLDER'..."
FOLDER_EXISTS=$(az rest --method GET \
  --url "https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/root:/${TARGET_FOLDER}" \
  --query "id" -o tsv 2>/dev/null || echo "")

if [ -z "$FOLDER_EXISTS" ]; then
  echo "Creating folder '$TARGET_FOLDER'..."
  az rest --method POST \
    --url "https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/root/children" \
    --headers "Content-Type=application/json" \
    --body "{\"name\": \"$TARGET_FOLDER\", \"folder\": {}}" > /dev/null
  echo "Folder created."
else
  echo "Folder exists."
fi

# Upload files
UPLOADED=0
FAILED=0
TOTAL=$(find "$SOURCE_PATH" -maxdepth 1 -name "*.txt" | wc -l | tr -d ' ')

echo ""
echo "Uploading $TOTAL files..."
echo ""

for FILE in "$SOURCE_PATH"/*.txt; do
  if [ -f "$FILE" ]; then
    FILENAME=$(basename "$FILE")
    echo -n "Uploading: $FILENAME... "

    # Upload file using Graph API
    RESULT=$(az rest --method PUT \
      --url "https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/root:/${TARGET_FOLDER}/${FILENAME}:/content" \
      --headers "Content-Type=text/plain" \
      --body @"$FILE" 2>&1) || true

    if echo "$RESULT" | grep -q '"id"'; then
      echo "✓"
      UPLOADED=$((UPLOADED + 1))
    else
      echo "✗"
      FAILED=$((FAILED + 1))
    fi
  fi
done

echo ""
echo "========================================"
echo "Upload Complete"
echo "========================================"
echo "Total: $TOTAL"
echo "Uploaded: $UPLOADED"
echo "Failed: $FAILED"
echo "========================================"

if [ $FAILED -eq 0 ]; then
  echo "✓ All files uploaded successfully"
  exit 0
else
  echo "⚠ Some files failed to upload"
  exit 1
fi
