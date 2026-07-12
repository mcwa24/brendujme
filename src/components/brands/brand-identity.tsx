"use client";

import { useMemo, useState } from "react";
import { BrandLogoBox, BRAND_LOGO_SIZE } from "@/components/brands/brand-logo-box";
import { BrandLogoPlaceholder } from "@/components/brands/brand-logo-placeholder";
import {
  getBrandLetter,
  getBrandLogoDisplayScale,
  resolveBrandLogoSrc,
} from "@/lib/brand-logo-resolve";
import type { BrandLogoInput } from "@/types";
import { cn } from "@/lib/utils";

const COMPACT_LOGO_SLOT =
  "h-[88px] w-full max-w-[104px] sm:h-[120px] sm:max-w-[140px]";

interface BrandIdentityProps {
  brand: BrandLogoInput;
  variant?: "card" | "compact" | "hero" | "inline";
  className?: string;
  /** Katalog — fiksni nevidljivi okvir, logo centriran */
  uniformLogo?: boolean;
  /** Server-preresolved src (optional, skips client resolve) */
  logoSrc?: string | null;
}

export function BrandIdentity({
  brand,
  variant = "card",
  className,
  uniformLogo = false,
  logoSrc: logoSrcProp,
}: BrandIdentityProps) {
  const resolvedSrc = useMemo(
    () => logoSrcProp ?? resolveBrandLogoSrc(brand),
    [brand, logoSrcProp]
  );
  const displayScale = getBrandLogoDisplayScale(brand.slug);
  const [imageFailed, setImageFailed] = useState(false);

  const showImage = Boolean(resolvedSrc) && !imageFailed;
  const alt = `Logo brenda ${brand.name}`;

  if (variant === "hero") {
    if (showImage && resolvedSrc) {
      return (
        <BrandLogoBox
          src={resolvedSrc}
          alt={alt}
          size={BRAND_LOGO_SIZE}
          displayScale={displayScale}
          className={className}
          onFailed={() => setImageFailed(true)}
        />
      );
    }
    return (
      <BrandLogoPlaceholder
        name={brand.name}
        slug={brand.slug}
        variant="hero"
        className={className}
      />
    );
  }

  if (variant === "inline") {
    if (showImage && resolvedSrc) {
      return (
        <BrandLogoBox
          src={resolvedSrc}
          alt={alt}
          size={48}
          displayScale={displayScale}
          className={cn("!h-12 !w-12 rounded-[var(--radius)]", className)}
          onFailed={() => setImageFailed(true)}
        />
      );
    }
    return (
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius)] border border-border bg-secondary font-display text-lg font-semibold text-accent",
          className
        )}
        aria-label={alt}
        role="img"
      >
        {getBrandLetter(brand.name, brand.slug)}
      </div>
    );
  }

  if (variant === "compact") {
    const logoSlot = (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-[var(--radius)]",
          uniformLogo
            ? "bg-transparent"
            : "border border-border bg-background",
          COMPACT_LOGO_SLOT
        )}
      >
        {showImage && resolvedSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedSrc}
            alt={alt}
            className="brand-logo-img object-contain"
            style={{
              maxHeight: `${displayScale * 100}%`,
              maxWidth: `${displayScale * 100}%`,
            }}
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <BrandLogoPlaceholder
            name={brand.name}
            slug={brand.slug}
            variant="compact"
            uniform={uniformLogo}
          />
        )}
      </span>
    );

    if (uniformLogo) {
      return (
        <div
          className={cn(
            "flex h-full flex-col items-center justify-between gap-3 text-center sm:gap-4",
            className
          )}
        >
          {logoSlot}
          <p className="font-display line-clamp-2 flex min-h-[2.5rem] w-full items-center justify-center text-xs font-semibold leading-tight text-foreground sm:min-h-[2.75rem] sm:text-sm md:text-base lg:text-lg">
            {brand.name}
          </p>
        </div>
      );
    }

    return (
      <div className={cn("flex items-center gap-4", className)}>
        {showImage && resolvedSrc ? (
          <BrandLogoBox
            src={resolvedSrc}
            alt={alt}
            displayScale={displayScale}
            onFailed={() => setImageFailed(true)}
          />
        ) : (
          <BrandLogoPlaceholder name={brand.name} slug={brand.slug} variant="compact" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold text-foreground">
            {brand.name}
          </p>
        </div>
      </div>
    );
  }

  // card — top area
  return (
    <div className={className}>
      {showImage && resolvedSrc ? (
        <BrandLogoBox
          src={resolvedSrc}
          alt={alt}
          displayScale={displayScale}
          onFailed={() => setImageFailed(true)}
        />
      ) : (
        <BrandLogoPlaceholder name={brand.name} slug={brand.slug} variant="card" />
      )}
    </div>
  );
}
