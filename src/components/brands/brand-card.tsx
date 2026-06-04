import Link from "next/link";
import { MapPin } from "lucide-react";
import { getCategoryName } from "@/lib/data/categories";
import type { Brand } from "@/types";
import { BrandLogo } from "@/components/ui/brand-logo";
import { PremiumCard } from "@/components/ui/premium-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BrandCardProps {
  brand: Brand;
  variant?: "default" | "compact";
}

export function BrandCard({ brand, variant = "default" }: BrandCardProps) {
  if (variant === "compact") {
    return (
      <Link href={`/brands/${brand.slug}`} className="group block">
        <PremiumCard className="p-5">
          <div className="flex items-center gap-4">
            <BrandLogo name={brand.name} size="sm" />
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-accent">
                {brand.name}
              </h3>
              <p className="text-sm text-muted">
                {getCategoryName(brand.category)}
              </p>
            </div>
          </div>
        </PremiumCard>
      </Link>
    );
  }

  return (
    <PremiumCard className="flex h-full flex-col p-6">
      <BrandLogo name={brand.name} size="md" className="mb-5" />
      <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        {brand.name}
      </h3>
      <p className="mt-1 text-sm text-muted">{getCategoryName(brand.category)}</p>
      <div className="mt-4 flex items-center gap-1.5 text-sm text-muted">
        <MapPin className="h-4 w-4 shrink-0" />
        <span>{brand.availabilityCount} lokacija</span>
      </div>
      <div className="mt-6">
        <Link
          href={`/brands/${brand.slug}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-11 w-full rounded-full border-border text-accent hover:bg-accent hover:text-white"
          )}
        >
          Pogledaj profil
        </Link>
      </div>
    </PremiumCard>
  );
}
