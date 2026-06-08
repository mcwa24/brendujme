"use client";

import Image from "next/image";
import { useState } from "react";
import { getBrandLetter } from "@/lib/brand-logo-resolve";
import { getRetailerDisplayName } from "@/lib/data/retailer-names";
import { resolveRetailerLogoSrc } from "@/lib/retailer-logo-resolve";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { box: "h-8 w-8", bareSlot: "h-8 w-[72px]", img: 32, letter: "text-sm" },
  md: { box: "h-10 w-10", bareSlot: "h-10 w-[88px]", img: 40, letter: "text-base" },
  lg: { box: "h-12 w-12", bareSlot: "h-12 w-24", img: 48, letter: "text-xl" },
  xl: { box: "h-16 w-16", bareSlot: "h-16 w-28", img: 64, letter: "text-2xl" },
  hero: {
    box: "h-20 w-20 md:h-24 md:w-24",
    bareSlot: "h-20 w-[220px] md:h-24",
    img: 96,
    letter: "text-3xl md:text-4xl",
  },
} as const;

interface RetailerLogoProps {
  slug: string;
  name?: string;
  logoUrl?: string | null;
  size?: keyof typeof sizeMap;
  className?: string;
  /** Stranica prodavca — veći logo bez okvira */
  variant?: "default" | "page" | "bare";
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
  const usePageLogo =
    variant === "page" || (variant === "bare" && slug === "fashion-company");
  const src = resolveRetailerLogoSrc({ slug, logoUrl }, { page: usePageLogo });
  const dims = sizeMap[size];
  const isDarkBadge = variant === "page" && slug === "fashion-company";
  const [imageFailed, setImageFailed] = useState(false);

  if (!src || imageFailed) {
    if (variant === "bare") {
      return (
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center font-display font-semibold leading-none text-accent/90",
            dims.bareSlot,
            dims.letter,
            className
          )}
          aria-label={`Prodavac ${displayName}`}
          role="img"
        >
          {getBrandLetter(displayName)}
        </span>
      );
    }

    return (
      <RetailerLetterPlaceholder
        name={displayName}
        dims={dims}
        className={className}
      />
    );
  }

  if (variant === "bare") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center",
          dims.bareSlot,
          className
        )}
      >
        <Image
          src={src}
          alt={`${displayName} logo`}
          width={dims.img}
          height={dims.img}
          className="brand-logo-img max-h-full max-w-full object-contain"
          onError={() => setImageFailed(true)}
        />
      </span>
    );
  }

  if (variant === "page") {
    return (
      <Image
        src={src}
        alt={`${displayName} logo`}
        width={dims.img * 2}
        height={dims.img}
        style={{ width: "auto", height: "auto" }}
        className={cn(
          "brand-logo-img h-20 max-h-24 max-w-[220px] shrink-0 object-contain md:h-24",
          isDarkBadge && "rounded-none bg-black px-2 py-1",
          className
        )}
        onError={() => setImageFailed(true)}
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
        className="brand-logo-img h-full w-full object-contain"
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}
