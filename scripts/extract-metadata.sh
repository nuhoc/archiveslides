#!/usr/bin/env bash
# extract-metadata.sh
# Extracts photo metadata from images/full/ into _data/photos.json
#
# Requirements: exiftool (brew install exiftool)
#
# Usage: ./scripts/extract-metadata.sh

set -euo pipefail

SOURCE_DIR="images/full"
OUTPUT="_data/photos.json"

if ! command -v exiftool &> /dev/null; then
  echo "Error: exiftool is not installed."
  echo "  macOS:  brew install exiftool"
  echo "  Linux:  sudo apt install libimage-exiftool-perl"
  exit 1
fi

if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: $SOURCE_DIR directory not found."
  echo "Export your Lightroom photos into $SOURCE_DIR first."
  exit 1
fi

mkdir -p _data

echo "Extracting metadata from $SOURCE_DIR..."

exiftool -json \
  -FileName \
  -Title \
  -Caption-Abstract \
  -ImageDescription \
  -Keywords \
  -Subject \
  -DateTimeOriginal \
  -CreateDate \
  -ImageWidth \
  -ImageHeight \
  -GPSLatitude \
  -GPSLongitude \
  "$SOURCE_DIR"/*.jpg "$SOURCE_DIR"/*.jpeg "$SOURCE_DIR"/*.JPG 2>/dev/null \
  > "$OUTPUT"

COUNT=$(python3 -c "import json; print(len(json.load(open('$OUTPUT'))))" 2>/dev/null || echo "?")
echo "Done. Wrote $COUNT photos to $OUTPUT"

# --- Normalize: some cameras use Subject instead of Keywords ---
python3 - <<'PYEOF'
import json, sys

with open("_data/photos.json") as f:
    photos = json.load(f)

for p in photos:
    # Normalize keywords: merge Keywords and Subject fields
    kw = p.get("Keywords", p.get("Subject", []))
    if isinstance(kw, str):
        kw = [kw]
    p["Keywords"] = kw

    # Normalize caption
    if not p.get("Caption-Abstract"):
        p["Caption-Abstract"] = p.get("ImageDescription", "")

    # Normalize date
    if not p.get("DateTimeOriginal"):
        p["DateTimeOriginal"] = p.get("CreateDate", "")

    # Strip the SourceFile / directory prefix from FileName if present
    if "/" in p.get("FileName", ""):
        p["FileName"] = p["FileName"].rsplit("/", 1)[-1]

with open("_data/photos.json", "w") as f:
    json.dump(photos, f, indent=2)

print("Normalized metadata fields.")
PYEOF
