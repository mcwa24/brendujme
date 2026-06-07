"use client";

import { useMemo, useState } from "react";
import { BrandLogoBox, BRAND_LOGO_SIZE } from "@/components/brands/brand-logo-box";
import { BrandLogoPlaceholder } from "@/components/brands/brand-logo-placeholder";
import { getBrandLogoDisplayScale, resolveBrandLogoSrc } from "@/lib/brand-logo-resolve";
import type { BrandLogoInput } from "@/types";

interface BrandHeroProps {
  brand: BrandLogoInput;
}

export function BrandHero({ brand }: BrandHeroProps) {
  const resolvedSrc = useMemo(() => resolveBrandLogoSrc(brand), [brand]);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(resolvedSrc) && !imageFailed;

  if (showImage && resolvedSrc) {
    return (
      <BrandLogoBox
        src={resolvedSrc}
        alt={`Logo brenda ${brand.name}`}
        size={BRAND_LOGO_SIZE}
        displayScale={getBrandLogoDisplayScale(brand.slug)}
        bare
        onFailed={() => setImageFailed(true)}
      />
    );
  }

  return (
    <BrandLogoPlaceholder name={brand.name} slug={brand.slug} variant="hero" />
  );
}
