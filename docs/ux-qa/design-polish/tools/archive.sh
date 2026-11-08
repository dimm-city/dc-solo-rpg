#!/usr/bin/env bash
# Copy the design-review working files (no images, logs or probes) into the repo archive.
# Usage: archive.sh <round>   (run from anywhere)
set -euo pipefail
SPD=/tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review
A=/home/user/dc-solo-rpg/docs/ux-qa/design-polish
ROUND="$1"
mkdir -p "$A/round-$ROUND"
rm -rf "$A/tools" && mkdir -p "$A/tools"
(cd "$SPD/tools" && tar cf - --exclude='*.png' --exclude='*.jpg' --exclude='*.webm' --exclude='*.mp4' \
  --exclude='*.log' --exclude='probe' --exclude='node_modules' --exclude='pylib' --exclude='*.tgz' .) | (cd "$A/tools" && tar xf -)
cp "$SPD"/round-"$ROUND"/*.md "$A/round-$ROUND/" 2>/dev/null || true
echo "archived round $ROUND: $(find "$A/round-$ROUND" -type f | wc -l) round files, $(find "$A/tools" -type f | wc -l) tool files"
