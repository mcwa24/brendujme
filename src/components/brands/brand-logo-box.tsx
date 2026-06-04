"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

const LOGO_SIZE = 120;

interface BrandLogoBoxProps {
  src: string;
  alt: string;
  className?: string;
  size?: number;
  onFailed?: () => void;
}

export function BrandLogoBox({
  src,
  alt,
  className,
  size = LOGO_SIZE,
  onFailed,
}: BrandLogoBoxProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  const isRemote = src.startsWith("http");

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-border bg-white",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="h-full w-full object-contain p-3"
        unoptimized={isRemote || src.startsWith("/logos/")}
        onError={() => {
          setFailed(true);
          onFailed?.();
        }}
      />
    </div>
  );
}

export const BRAND_LOGO_SIZE = LOGO_SIZE;
