"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const LOGO_SIZE = 120;

interface BrandLogoBoxProps {
  src: string;
  alt: string;
  className?: string;
  size?: number;
  onFailed?: () => void;
  /** Bez okvira i pozadine — za marquee / providne PNG logoe */
  bare?: boolean;
}

export function BrandLogoBox({
  src,
  alt,
  className,
  size = LOGO_SIZE,
  onFailed,
  bare = false,
}: BrandLogoBoxProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden",
        !bare && "rounded-none border border-border bg-background",
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
        className={cn(
          "h-full w-full bg-transparent object-contain",
          bare ? "p-0" : "p-3"
        )}
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
