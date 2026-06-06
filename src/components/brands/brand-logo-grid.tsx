"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BrandLogoBox } from "@/components/brands/brand-logo-box";
import { getBrandLetter, resolveBrandLogoSrc } from "@/lib/brand-logo-resolve";
import type { Brand } from "@/types";
import { cn } from "@/lib/utils";

const DEFAULT_LOGO_SIZE = 96;

interface BrandLogoGridProps {
  brands: Brand[];
  className?: string;
  logoSize?: number;
}

function BrandLogoGridItem({
  brand,
  size,
}: {
  brand: Brand;
  size: number;
}) {
  const src = useMemo(() => resolveBrandLogoSrc(brand), [brand]);
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <Link
      href={`/brands/${brand.slug}`}
      prefetch={false}
      aria-label={brand.name}
      className="flex items-center justify-center transition-transform duration-300 hover:scale-[1.04]"
    >
      {showImage && src ? (
        <BrandLogoBox
          src={src}
          alt={`Logo brenda ${brand.name}`}
          size={size}
          bare
          className="!border-0 !bg-transparent !p-0"
          onFailed={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex items-center justify-center font-display text-3xl font-semibold text-accent/90"
          style={{ width: size, height: size }}
          role="img"
          aria-label={`Logo brenda ${brand.name}`}
        >
          {getBrandLetter(brand.name)}
        </div>
      )}
    </Link>
  );
}

export function BrandLogoGrid({
  brands,
  className,
  logoSize = DEFAULT_LOGO_SIZE,
}: BrandLogoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6",
        className
      )}
    >
      {brands.map((brand) => (
        <BrandLogoGridItem key={brand.slug} brand={brand} size={logoSize} />
      ))}
    </div>
  );
}
