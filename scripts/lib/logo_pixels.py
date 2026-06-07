#!/usr/bin/env python3
"""Analiza PNG logoa — razlikuje providnost, crni znak i chat-pokvarene fajlove."""

from __future__ import annotations

from dataclasses import dataclass

from PIL import Image


@dataclass
class LogoStats:
    width: int
    height: int
    total: int
    transparent: int
    dark_opaque: int
    light_opaque: int
    colored_opaque: int

    @property
    def trans_ratio(self) -> float:
        return self.transparent / self.total if self.total else 0.0

    @property
    def dark_ratio(self) -> float:
        return self.dark_opaque / self.total if self.total else 0.0

    @property
    def light_ratio(self) -> float:
        return self.light_opaque / self.total if self.total else 0.0


def analyze(im: Image.Image) -> LogoStats:
    rgba = im.convert("RGBA")
    w, h = rgba.size
    px = list(rgba.getdata())
    total = w * h
    transparent = dark_opaque = light_opaque = colored_opaque = 0

    for r, g, b, a in px:
        if a < 20:
            transparent += 1
            continue
        if a < 200:
            continue
        s = r + g + b
        if s < 40:
            dark_opaque += 1
        elif s > 680:
            light_opaque += 1
        else:
            colored_opaque += 1

    return LogoStats(w, h, total, transparent, dark_opaque, light_opaque, colored_opaque)


def is_chat_corrupt_png(stats: LogoStats) -> bool:
    """
    Seeklogo / chat upload garbage: skoro ceo fajl je neprovidni crni kvadrat.
    NE odbijaj normalan crni logo na providnoj pozadini (macOS Preview checkerboard).
    """
    if stats.trans_ratio > 0.12:
        return False
    if stats.dark_ratio > 0.85 and stats.light_ratio < 0.02:
        return True
    if stats.dark_ratio > 0.92:
        return True
    return False


def is_white_on_transparent(stats: LogoStats) -> bool:
    """Beli znak na providnom — nevidljiv na belim karticama."""
    return (
        stats.dark_ratio < 0.01
        and stats.light_ratio > 0.05
        and stats.trans_ratio > 0.4
    )


def describe(stats: LogoStats) -> str:
    return (
        f"{stats.width}×{stats.height}, "
        f"providno {stats.trans_ratio:.0%}, "
        f"tamno {stats.dark_ratio:.0%}, "
        f"svetlo {stats.light_ratio:.0%}, "
        f"obojeno {stats.colored_opaque / stats.total:.0%}"
    )
