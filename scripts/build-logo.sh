#!/usr/bin/env bash
# Génère les icônes Android et l’asset splash à partir de logo/tv-logo.png
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ROOT}/logo/tv-logo.png"
ASSETS_DIR="${ROOT}/src/assets"
ANDROID_RES="${ROOT}/android/app/src/main/res"

if [[ ! -f "$SRC" ]]; then
  echo "Erreur : fichier source introuvable : $SRC" >&2
  exit 1
fi

mkdir -p "$ASSETS_DIR"

export ROOT SRC ASSETS_DIR ANDROID_RES

python3 <<'PY'
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Erreur : installez Pillow (python3 -m pip install Pillow)", file=sys.stderr)
    sys.exit(1)

root = Path(os.environ["ROOT"])
src = Path(os.environ["SRC"])
assets_dir = Path(os.environ["ASSETS_DIR"])
android_res = Path(os.environ["ANDROID_RES"])

img = Image.open(src).convert("RGBA")
w, h = img.size
side = min(w, h)
left = (w - side) // 2
top = (h - side) // 2
img = img.crop((left, top, left + side, top + side))

def save_square(path: Path, px: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    resized = img.resize((px, px), Image.Resampling.LANCZOS)
    resized.save(path, format="PNG", optimize=True)

# Splash / écran de chargement in-app (Metro)
save_square(assets_dir / "app-logo.png", 512)

# Drawable optionnel (layouts natifs)
drawable = android_res / "drawable"
save_square(drawable / "splash_logo.png", 256)

# Icônes launcher Android
mipmap_sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

for folder, px in mipmap_sizes.items():
    base = android_res / folder
    save_square(base / "ic_launcher.png", px)
    save_square(base / "ic_launcher_round.png", px)

print("Logo généré :")
print(f"  - {assets_dir / 'app-logo.png'}")
print(f"  - {drawable / 'splash_logo.png'}")
for folder in mipmap_sizes:
    print(f"  - {android_res / folder}/ic_launcher*.png")
PY

echo "Terminé."
