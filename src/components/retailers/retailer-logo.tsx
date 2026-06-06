"use client";

import Image from "next/image";
import { useState } from "react";
import { getBrandLetter } from "@/lib/brand-logo-resolve";
import { getRetailerDisplayName } from "@/lib/data/retailer-names";
import { resolveRetailerLogoSrc } from "@/lib/retailer-logo-resolve";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { box: "h-8 w-8", img: 32, letter: "text-sm" },
  md: { box: "h-10 w-10", img: 40, letter: "text-base" },
  lg: { box: "h-12 w-12", img: 48, letter: "text-xl" },
  xl: { box: "h-16 w-16", img: 64, letter: "text-2xl" },
  hero: { box: "h-20 w-20 md:h-24 md:w-24", img: 96, letter: "text-3xl md:text-4xl" },
} as const;

interface RetailerLogoProps {
  slug: string;
  name?: string;
  logoUrl?: string | null;
  size?: keyof typeof sizeMap;
  className?: string;
  /** Stranica prodavca — npr. FCO ikona za Fashion Company */
  variant?: "default" | "page";
}

function RetailerLetterPlaceholder({
  name,
  dims,
  className,
}: {
  name: string;
  dims: (typeof sizeMap)[keyof typeof sizeMap];
  className?: string;
}) {
  const letter = getBrandLetter(name);
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-none border border-border bg-secondary",
        dims.box,
        className
      )}
      aria-label={`Prodavac ${name}`}
      role="img"
    >
      <span
        className={cn(
          "font-display font-semibold leading-none text-accent/90",
          dims.letter
        )}
      >
        {letter}
      </span>
    </div>
  );
}

export function RetailerLogo({
  slug,
  name,
  logoUrl,
  size = "sm",
  className,
  variant = "default",
}: RetailerLogoProps) {
  const displayName = name ?? getRetailerDisplayName(slug);
  const src = resolveRetailerLogoSrc(
    { slug, logoUrl },
    { page: variant === "page" }
  );
  const dims = sizeMap[size];
  const isDarkBadge =
    slug === "fashion-friends" ||
    (variant === "page" && slug === "fashion-company");
  const [imageFailed, setImageFailed] = useState(false);

  if (!src || imageFailed) {
    return (
      <RetailerLetterPlaceholder
        name={displayName}
        dims={dims}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-none p-1",
        isDarkBadge ? "bg-black" : "bg-secondary",
        dims.box,
        className
      )}
    >
      <Image
        src={src}
        alt={`${displayName} logo`}
        width={dims.img}
        height={dims.img}
        className="h-full w-full object-contain"
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}
