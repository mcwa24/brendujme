"use client";

import { useMemo, useState } from "react";
import { BrandLogoBox, BRAND_LOGO_SIZE } from "@/components/brands/brand-logo-box";
import { BrandLogoPlaceholder } from "@/components/brands/brand-logo-placeholder";
import { resolveBrandLogoSrc } from "@/lib/brand-logo-resolve";
import { getFilterCategoryLabel } from "@/lib/brands/catalog-filters";
import type { CategorySlug } from "@/types";
import type { BrandLogoInput } from "@/types";
import { cn } from "@/lib/utils";

interface BrandIdentityProps {
  brand: BrandLogoInput;
  variant?: "card" | "compact" | "hero" | "inline";
  className?: string;
  /** Server-preresolved src (optional, skips client resolve) */
  logoSrc?: string | null;
}

export function BrandIdentity({
  brand,
  variant = "card",
  className,
  logoSrc: logoSrcProp,
}: BrandIdentityProps) {
  const resolvedSrc = useMemo(
    () => logoSrcProp ?? resolveBrandLogoSrc(brand),
    [brand, logoSrcProp]
  );
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
          className={className}
          onFailed={() => setImageFailed(true)}
        />
      );
    }
    return (
      <BrandLogoPlaceholder
        name={brand.name}
        category={brand.category}
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
          className={cn("!h-12 !w-12 rounded-xl", className)}
          onFailed={() => setImageFailed(true)}
        />
      );
    }
    return (
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-[#f5f5f3] font-display text-lg font-semibold text-accent",
          className
        )}
        aria-label={alt}
        role="img"
      >
        {brand.name.charAt(0).toUpperCase()}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        {showImage && resolvedSrc ? (
          <BrandLogoBox
            src={resolvedSrc}
            alt={alt}
            onFailed={() => setImageFailed(true)}
          />
        ) : (
          <BrandLogoPlaceholder name={brand.name} variant="compact" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold text-foreground">
            {brand.name}
          </p>
          {brand.category ? (
            <p className="text-sm text-muted">
              {getFilterCategoryLabel(brand.category as CategorySlug)}
            </p>
          ) : null}
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
          onFailed={() => setImageFailed(true)}
        />
      ) : (
        <BrandLogoPlaceholder
          name={brand.name}
          category={brand.category}
          variant="card"
        />
      )}
    </div>
  );
}
