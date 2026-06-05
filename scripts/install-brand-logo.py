#!/usr/bin/env python3
"""Instalira ručno poslat logo — čuva alpha, uklanja belu/svetlo sivu pozadinu."""

from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CACHE_DIR = ROOT / "public" / "logos" / "cache"
MANIFEST_PATH = ROOT / "src" / "lib" / "data" / "logo-manifest.json"


def is_corrupt_black(im: Image.Image) -> bool:
    rgba = im.convert("RGBA")
    pixels = list(rgba.getdata())
    if not pixels:
        return True
    opaque_black = sum(
        1 for r, g, b, a in pixels if a > 200 and r < 20 and g < 20 and b < 20
    )
    return opaque_black / len(pixels) > 0.92


def strip_light_background(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    out: list[tuple[int, int, int, int]] = []
    for r, g, b, a in rgba.getdata():
        if a < 16:
            out.append((r, g, b, 0))
            continue
        # bela i svetlo siva pozadina → transparentno
        if r > 228 and g > 228 and b > 228:
            out.append((r, g, b, 0))
            continue
        if r > 200 and g > 200 and b > 200 and max(r, g, b) - min(r, g, b) < 18:
            out.append((r, g, b, 0))
            continue
        out.append((r, g, b, a))
    result = Image.new("RGBA", rgba.size)
    result.putdata(out)
    bbox = result.getbbox()
    return result.crop(bbox) if bbox else result


def update_manifest(slug: str) -> None:
    manifest: dict = {}
    if MANIFEST_PATH.exists():
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    manifest[slug] = {"path": f"/logos/cache/{slug}.png", "source": "manual"}
    MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def install(src: Path, slug: str) -> None:
    if not src.exists():
        raise SystemExit(f"Fajl ne postoji: {src}")

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    dest = CACHE_DIR / f"{slug}.png"

    with Image.open(src) as im:
        if is_corrupt_black(im):
            raise SystemExit(
                "Logo izgleda pokvaren (skoro sav crn). "
                "Pošalji fajl preko Findera u public/logos/cache/ umesto chata."
            )
        processed = strip_light_background(im)
        processed.save(dest, format="PNG", optimize=True)

    update_manifest(slug)
    alpha = sum(1 for _, _, _, a in processed.getdata() if a < 20)
    total = processed.size[0] * processed.size[1]
    print(f"OK {slug} → {dest} ({processed.size[0]}×{processed.size[1]}, transparent {alpha}/{total})")


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Upotreba: python3 scripts/install-brand-logo.py <slug> <putanja-do-fajla>")

    slug = sys.argv[1].strip().lower()
    src = Path(sys.argv[2]).expanduser().resolve()
    install(src, slug)


if __name__ == "__main__":
    main()
