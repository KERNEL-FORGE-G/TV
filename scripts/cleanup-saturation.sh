#!/usr/bin/env bash
# Libère RAM/CPU en tuant les processus dev orphelins (node/jest/metro/gradle).
# Usage : bash scripts/cleanup-saturation.sh

set -euo pipefail

USER_NAME="${USER:-ravel}"

echo "── Avant ──"
free -h | head -2
uptime
NODE_BEFORE=$(pgrep -u "$USER_NAME" -c node 2>/dev/null || echo 0)
echo "Processus node : $NODE_BEFORE"

# Arrêts ciblés (ne touche pas Cursor/Electron directement)
pkill -u "$USER_NAME" -f 'jest|metro\.|react-native start|@react-native-community/cli' 2>/dev/null || true
pkill -u "$USER_NAME" -f '/home/ravel/Desktop/dev.*node' 2>/dev/null || true
pkill -u "$USER_NAME" -f 'tsc --noEmit' 2>/dev/null || true

if command -v gradle >/dev/null 2>&1; then
  gradle --stop 2>/dev/null || true
fi
if [ -d "$HOME/Desktop/dev/android" ]; then
  (cd "$HOME/Desktop/dev/android" && ./gradlew --stop 2>/dev/null) || true
fi

# Si encore > 500 processus node, relance agressive (langage serveur peut redémarrer)
NODE_AFTER_PARTIAL=$(pgrep -u "$USER_NAME" -c node 2>/dev/null || echo 0)
if [ "$NODE_AFTER_PARTIAL" -gt 500 ] 2>/dev/null; then
  echo "Trop de processus node ($NODE_AFTER_PARTIAL) — arrêt des node hors Cursor…"
  pgrep -u "$USER_NAME" -a node 2>/dev/null | grep -v -E 'cursor|Cursor|\.cursor' | awk '{print $1}' | xargs -r kill -9 2>/dev/null || true
fi

sleep 2
NODE_AFTER=$(pgrep -u "$USER_NAME" -c node 2>/dev/null || echo 0)
echo "── Après ──"
free -h | head -2
uptime
echo "Processus node : $NODE_AFTER (libérés : $((NODE_BEFORE - NODE_AFTER)))"
