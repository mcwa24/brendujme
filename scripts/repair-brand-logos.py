#!/usr/bin/env python3
"""Vraća ručno poslate logoe iz assets/ i Remiks JPG u PNG bez obrade piksela."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path.home() / ".cursor/projects"
# resolved at runtime from workspace
def find_assets_dir() -> Path:
    for p in ROOT.parents:
        candidate = p / ".cursor" / "projects"
        if candidate.exists():
            for proj in candidate.iterdir():
                assets = proj / "assets"
                if assets.is_dir() and any(assets.glob("*logo*")):
                    return assets
    raise SystemExit("Nema assets foldera sa logotipima")

CACHE = ROOT / "public/logos/cache"
MANIFEST_PATH = ROOT / "src/lib/data/logo-manifest.json"

def asset_is_usable(src: Path) -> bool:
    """Preskoči pokvarene seeklogo / chat placeholder assete."""
    if not src.exists():
        return False
    if src.stat().st_size < 2500:
        return False
    try:
        sys.path.insert(0, str(ROOT / "scripts"))
        from lib.logo_pixels import analyze, is_chat_corrupt_png

        with Image.open(src) as im:
            stats = analyze(im)
            if im.size[0] * im.size[1] < 4000:
                return False
            if is_chat_corrupt_png(stats):
                return False
            # solid color block (npr. zeleni seeklogo kvadrat)
            if stats.dark_ratio < 0.05 and stats.light_ratio < 0.05:
                rgba = im.convert("RGBA")
                px = list(rgba.getdata())
                sample = next((p for p in px if p[3] > 200), px[0])
                flat = sum(
                    1
                    for r, g, b, a in px
                    if a > 200
                    and abs(r - sample[0]) < 8
                    and abs(g - sample[1]) < 8
                    and abs(b - sample[2]) < 8
                )
                if flat > stats.total * 0.85:
                    return False
    except OSError:
        return False
    return True


MANUAL_ASSETS: dict[str, str] = {
    "reserved": "Reserved-logo-2f3b8261-dc22-44fb-8b85-2293ba091be2.png",
    "sinsay": "1706624214sinsay-logo-dcd00409-4657-4448-a64e-3a6e3df9d29b.png",
    "cropp": "Cropp-logo-171a2bd0-e548-4e2c-8f02-5398f11d070d.png",
    "pull-and-bear": "pull_bear_2x_2809fe7800-942a0b57-c4d2-47da-b6f8-573b2dfad72b.png",
    "antony-morato": "antony_morato_logo-864d0a98-d47b-4855-b990-ee07f5c08606.png",
    "mango": "Mango-logo-fca785de-f7e2-4566-b037-1a37d8aa2789.png",
    "oysho": "oysho-logo-png_seeklogo-320984-143cd7e6-c9ab-4a35-afa4-4bcfe4a08aa2.png",
    "dolce-vita": "Dolce-Vita-Logo-e8d6c974-9de9-4bcb-8a5d-9b1e08a76097.png",
    "inuikii": "INUIKII-f9f5d92a-c787-4ddd-9ea8-ba7ccc4cca81.png",
    "miss-sixty": "Miss-Sixty-Logo-3f473d75-3106-4e86-98af-c9b619f12988.png",
    "labubu": "__57-cfbeeef4-b993-4f72-942c-c3d84e51ee92.png",
    "nike": "Nike-Logo-c6ac73bd-2b83-4aba-8043-a2ded7b9b31c.png",
    "zara": "zara-black-logo-png-img-701751694774630cfeeznr7es-32375785-6dc9-4a11-8cb2-1adccb6cd71a.png",
    "bershka": "bershka-d093cbd8-a0ed-4707-830f-24e7a81c69f1.png",
    "cos": "cos-logo-702759b0-4c54-46eb-8eb9-5bba5a01449c.png",
    "armani-exchange": "armani-exchange-eps-vector-logo-39a791c9-307e-4ce0-af2b-825f80eeded7.png",
    "dkny": "dkny-2-12fbcff7-74fa-4e44-8598-716c36bc7a68.png",
    "diesel": "diesel-3-logo-png-transparent-9f54161a-7233-4606-9524-302f19c7d313.png",
    "guess": "guess_clothing-logo_brandlogos.net_mhqck-f2bd9ba3-ee10-4c0c-805a-f15f72279bde.png",
    "kiko": "kiko-logo-png_seeklogo-261623-8f942d07-21af-4b2c-aeff-4235eb786a1a.png",
    "north-face": "the-north-face-logo-png_seeklogo-138874-31fad3ba-a7fc-4d13-9267-13f832a2c03a.png",
    "stradivarius": "stradivarius-logo-png_seeklogo-435719-73e3ce92-15e6-4aa4-a6ac-602b1dd5e8d5.png",
    "steve-madden": "steve-madden-logo-png_seeklogo-355131-59160064-189f-4021-8575-ffe79230a5b1.png",
    "wellensteyn": "logo_1247_wellensteyn-12fcf503-dd1d-4f9d-96d9-5b4e6a6397be.png",
    "sandro": "lg-67cb92f012895-SANDRO-7c2ebbb8-7d33-4e9b-9771-fad323ada37f.png",
    "scotch-and-soda": "scotch-soda-12843336-ff0b-42e9-bbfa-f3493b3a7841.png",
    "replay": "logo-replay-01-e98b3135-18fb-4a7c-84db-1d5f55c5403c.png",
    "rituals": "GLAD056_New_Website_Logos79-f226d14b-cb61-4d3b-945b-19b1e3a8aaf6.png",
    "massimo-dutti": "massimo-dutti-logo-png-transparent-22eeea64-5b1d-4fb2-8293-e89e8b67c1c4.png",
    "dirty-london": "69740_18890-1651f583-4067-4522-bb88-9d1200022661.png",
}


def save_png(src: Path, dest: Path) -> None:
    with Image.open(src) as im:
        if im.mode in ("RGBA", "LA"):
            im.save(dest, format="PNG")
        else:
            im.convert("RGB").save(dest, format="PNG")


def main() -> None:
    assets = find_assets_dir()
    manifest: dict = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))

    for slug, fname in MANUAL_ASSETS.items():
        src = assets / fname
        if not src.exists():
            print(f"skip {slug}: nema {fname}")
            continue
        if not asset_is_usable(src):
            print(f"skip {slug}: loš asset {fname} ({src.stat().st_size}b)")
            continue
        dest = CACHE / f"{slug}.png"
        save_png(src, dest)
        prev = manifest.get(slug, {})
        source = prev.get("source", "manual") if isinstance(prev, dict) else "manual"
        manifest[slug] = {"path": f"/logos/cache/{slug}.png", "source": source}
        print(f"asset {slug} → {dest.stat().st_size}b")

    manual = set(MANUAL_ASSETS)
    for jpg in sorted(CACHE.glob("*.jpg")):
        slug = jpg.stem
        if slug in manual:
            continue
        dest = CACHE / f"{slug}.png"
        save_png(jpg, dest)
        entry = manifest.get(slug)
        if isinstance(entry, dict):
            entry["path"] = f"/logos/cache/{slug}.png"
        else:
            manifest[slug] = {"path": f"/logos/cache/{slug}.png", "source": "url"}

    # fallback ako je asset png pokvaren
    for slug in manual:
        png = CACHE / f"{slug}.png"
        jpg = CACHE / f"{slug}.jpg"
        if png.exists() and png.stat().st_size < 2000 and jpg.exists():
            save_png(jpg, png)
            print(f"fallback jpg {slug}")

    MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(f"Manifest: {len(manifest)} unosa")


if __name__ == "__main__":
    main()
