#!/bin/bash
# Every board/HUD capture for one round, in two lanes (4 shared CPUs), then the build.
# Usage: ROUND=2 /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/tools/board/run-all.sh
# Needs the dev server: cd /home/user/dc-solo-rpg && npx vite dev --port 5191 --strictPort
# (BASE_URL overrides http://localhost:5191). About 50 minutes in all.
set -u
: "${ROUND:?set ROUND}"
T=/tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/tools/board
O=/tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-$ROUND
mkdir -p "$O/logs"
export ROUND
lane1() {
  node $T/capture.cjs --vp=android-small,iphone-13 > "$O/logs/run-android-small+iphone-13.log" 2>&1
  node $T/capture.cjs --vp=laptop,desktop > "$O/logs/run-laptop+desktop.log" 2>&1
}
lane2() {
  node $T/capture.cjs --vp=iphone-13-landscape,ipad-portrait > "$O/logs/run-iphone-13-landscape+ipad-portrait.log" 2>&1
  node $T/capture.cjs --vp=iphone-13,desktop --groups=reduced > "$O/logs/run-reduced.log" 2>&1
  node $T/capture.cjs --vp=iphone-se,pixel-7,ipad-landscape,fhd --groups=extended > "$O/logs/run-extended.log" 2>&1
}
lane1 &
lane2 &
wait
grep -h groupFailed "$O"/logs/run-*.log
python3 -I $T/build.py > "$O/logs/build.log" 2>&1
tail -1 "$O/logs/build.log"
