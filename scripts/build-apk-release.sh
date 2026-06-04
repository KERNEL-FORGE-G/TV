#!/usr/bin/env bash
# Build APK release et copie à la racine du projet (telecommande-release.apk)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

bash scripts/patch-react-native-ir-manager.sh

APK_SRC="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
APK_DST="$ROOT/telecommande-release.apk"

echo "→ Compilation release (assembleRelease)…"
cd "$ROOT/android"
./gradlew assembleRelease --no-daemon

if [ ! -f "$APK_SRC" ]; then
  echo "Erreur : APK introuvable ($APK_SRC)" >&2
  exit 1
fi

cp -f "$APK_SRC" "$APK_DST"
SIZE="$(du -h "$APK_DST" | cut -f1)"
echo "✓ APK release : $APK_DST ($SIZE)"
