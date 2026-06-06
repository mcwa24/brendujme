import Link from "next/link";
import { MapPin } from "lucide-react";
import { BrandIdentity } from "@/components/brands/brand-identity";
import { hasBrandLogo } from "@/lib/brand-logo-resolve";
import type { Brand } from "@/types";
import { PremiumCard } from "@/components/ui/premium-card";
import { buttonVariants } from "@/components/ui/button";
import { formatLocationCount } from "@/lib/format/sr-plural";
import { cn } from "@/lib/utils";

interface BrandCardProps {
  brand: Brand;
  variant?: "default" | "compact";
}

export function BrandCard({ brand, variant = "default" }: BrandCardProps) {
  const hasLogo = hasBrandLogo(brand);

  if (variant === "compact") {
    return (
      <Link href={`/brands/${brand.slug}`} className="group block">
        <PremiumCard className="p-5 transition-colors group-hover:border-accent/20">
          <BrandIdentity brand={brand} variant="compact" />
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
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full border-border text-accent hover:bg-accent hover:text-white"
            )}
          >
            Pogledaj profil
          </Link>
        </div>
      </div>
    </PremiumCard>
  );
}
