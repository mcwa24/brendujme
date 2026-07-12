import Link from "next/link";
import { MapPin } from "lucide-react";
import { BrandIdentity } from "@/components/brands/brand-identity";
import { hasBrandLogo } from "@/lib/brand-logo-resolve";
import type { BrandDirectoryItem } from "@/lib/data/brand-directory-item";
import type { Brand } from "@/types";
import { PremiumCard } from "@/components/ui/premium-card";
import { buttonVariants } from "@/components/ui/button";
import { formatLocationCount } from "@/lib/format/sr-plural";
import { cn } from "@/lib/utils";

type BrandCardData = BrandDirectoryItem | Brand;

interface BrandCardProps {
  brand: BrandCardData;
  variant?: "default" | "compact";
  /** Katalog — logo u fiksnom nevidljivom okviru (jednaka veličina) */
  uniformLogo?: boolean;
}

export function BrandCard({ brand, variant = "default", uniformLogo = false }: BrandCardProps) {
  const hasLogo = hasBrandLogo(brand);

  if (variant === "compact") {
    return (
      <Link href={`/brands/${brand.slug}`} prefetch={false} className="group block h-full">
        <PremiumCard className="flex h-full flex-col p-3 transition-colors sm:p-5">
          <BrandIdentity brand={brand} variant="compact" uniformLogo={uniformLogo} className="flex-1" />
        </PremiumCard>
      </Link>
    );
  }

  return (
    <PremiumCard className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border bg-secondary p-6">
        <BrandIdentity brand={brand} variant="card" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        {hasLogo && (
          <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            {brand.name}
          </h3>
        )}
        <div
          className={cn(
            "flex items-center gap-1.5 text-sm text-muted",
            hasLogo ? "mt-4" : "mt-0"
          )}
        >
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{formatLocationCount(brand.availabilityCount)}</span>
        </div>
        <div className="mt-auto pt-6">
          <Link
            href={`/brands/${brand.slug}`}
            prefetch={false}
            className={cn(buttonVariants(), "w-full")}
          >
            Pogledaj profil
          </Link>
        </div>
      </div>
    </PremiumCard>
  );
}
