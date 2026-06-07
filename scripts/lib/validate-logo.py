#!/usr/bin/env python3
"""Provera da li je preuzeti logo validan (nije favicon, chat-crni-kvadrat, HTML greška)."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

SCRIPTS = Path(__file__).resolve().parents[1]
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

from lib.logo_pixels import analyze, is_chat_corrupt_png, is_white_on_transparent


def validate(path: Path) -> tuple[bool, str]:
    if not path.exists():
        return False, "missing"
    data = path.read_bytes()
    if len(data) < 200:
        return False, f"tiny ({len(data)}b)"

    if path.suffix.lower() == ".svg":
        text = data.decode("utf-8", errors="replace")
        if "<html" in text.lower() or "<!doctype" in text.lower():
            return False, "html not svg"
        if "<svg" not in text.lower():
            return False, "no svg root"
        return True, "ok"

    try:
        im = Image.open(path).convert("RGBA")
    except OSError as e:
        return False, str(e)

    w, h = im.size
    if w <= 64 and h <= 64:
        return False, f"favicon size {w}x{h}"

    stats = analyze(im)

    if is_chat_corrupt_png(stats):
        return False, "chat corrupt (solid black, no transparency)"

    if stats.trans_ratio > 0.9 and stats.dark_ratio + stats.light_ratio < 0.005:
        return False, "empty/transparent only"

    if is_white_on_transparent(stats):
        return False, "white on transparent"

    return True, "ok"


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(2)
    ok, msg = validate(Path(sys.argv[1]))
    if not ok:
        print(msg)
        sys.exit(1)
    print(msg)


if __name__ == "__main__":
    main()
