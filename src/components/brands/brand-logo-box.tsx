"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const LOGO_SIZE = 120;

interface BrandLogoBoxProps {
  src: string;
  alt: string;
  className?: string;
  size?: number;
  /** 0–1, smanjuje logo unutar okvira bez menjanja slot dimenzija */
  displayScale?: number;
  onFailed?: () => void;
  /** Bez okvira — samo logo, transparentna pozadina */
  bare?: boolean;
}

export function BrandLogoBox({
  src,
  alt,
  className,
  size = LOGO_SIZE,
  displayScale = 1,
  onFailed,
  bare = false,
}: BrandLogoBoxProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <div
      className={cn(
        "brand-logo-slot flex shrink-0 items-center justify-center overflow-hidden",
        bare ? "brand-logo-slot--bare bg-transparent" : "rounded-none border border-border bg-background",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={cn("brand-logo-img object-contain", bare ? "p-0" : "p-3")}
        style={{
          maxHeight: `${displayScale * 100}%`,
          maxWidth: `${displayScale * 100}%`,
        }}
        decoding="async"
        onError={() => {
          setFailed(true);
          onFailed?.();
        }}
      />
    </div>
  );
}

export const BRAND_LOGO_SIZE = LOGO_SIZE;
