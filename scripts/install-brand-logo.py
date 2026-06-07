#!/usr/bin/env python3
"""Instalira ručno poslat logo — čuva alpha, uklanja belu/svetlo sivu pozadinu."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

from lib.logo_pixels import analyze, describe, is_chat_corrupt_png

CACHE_DIR = ROOT / "public" / "logos" / "cache"
MANIFEST_PATH = ROOT / "src" / "lib" / "data" / "logo-manifest.json"


def strip_light_background(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    out: list[tuple[int, int, int, int]] = []
    for r, g, b, a in rgba.getdata():
        if a < 16:
            out.append((r, g, b, 0))
            continue
        # bela i svetlo siva pozadina → transparentno (NE diramo crnu/tamnu)
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


def optimize_size(im: Image.Image, max_px: int = 512) -> Image.Image:
    w, h = im.size
    longest = max(w, h)
    if longest <= max_px:
        return im
    scale = max_px / longest
    return im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)


def remove_stale_variants(slug: str, keep: Path) -> None:
    for ext in (".svg", ".jpg", ".jpeg", ".webp", ".png"):
        path = CACHE_DIR / f"{slug}{ext}"
        if path != keep and path.exists():
            path.unlink()


def update_manifest(slug: str) -> None:
    manifest: dict = {}
    if MANIFEST_PATH.exists():
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    manifest[slug] = {"path": f"/logos/cache/{slug}.png", "source": "manual"}
    MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def install(src: Path, slug: str, *, force: bool = False) -> None:
    if not src.exists():
        raise SystemExit(f"Fajl ne postoji: {src}")

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    dest = CACHE_DIR / f"{slug}.png"

    with Image.open(src) as im:
        stats = analyze(im)
        if is_chat_corrupt_png(stats) and not force:
            raise SystemExit(
                "Fajl izgleda pokvaren (skoro ceo crni kvadrat bez providnosti).\n"
                f"  Analiza: {describe(stats)}\n"
                "  Ako ti na Macu izgleda OK, kopiraj fajl u projekat (Finder) i ponovi,\n"
                "  ili dodaj --force ako si siguran da je original dobar."
            )
        processed = strip_light_background(im)
        processed = optimize_size(processed)
        processed.save(dest, format="PNG", optimize=True)

    remove_stale_variants(slug, dest)
    update_manifest(slug)
    out_stats = analyze(processed)
    print(f"OK {slug} → {dest}")
    print(f"  {describe(out_stats)}")


def main() -> None:
    args = [a for a in sys.argv[1:] if a != "--force"]
    force = "--force" in sys.argv
    if len(args) != 2:
        raise SystemExit(
            "Upotreba: python3 scripts/install-brand-logo.py [--force] <slug> <putanja-do-fajla>"
        )

    slug = args[0].strip().lower()
    src = Path(args[1]).expanduser().resolve()
    install(src, slug, force=force)


if __name__ == "__main__":
    main()
