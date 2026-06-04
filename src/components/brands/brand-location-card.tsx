import Link from "next/link";
import { MapPin } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { RetailerLink } from "@/components/retailers/retailer-link";
import { PremiumCard } from "@/components/ui/premium-card";
import { buttonVariants } from "@/components/ui/button";
import { formatOfferingsLabel } from "@/lib/data/brand-offerings";
import { retailerHasPage, retailerPageHref } from "@/lib/data/retailer-names";
import type { BrandOfferingSlug } from "@/types";
import { cn } from "@/lib/utils";

interface BrandLocationCardProps {
  storeName: string;
  retailerSlug: string;
  address: string;
  city: string;
  offerings?: BrandOfferingSlug[];
  delay?: number;
}

export function BrandLocationCard({
  storeName,
  retailerSlug,
  address,
  city,
  offerings,
  delay = 0,
}: BrandLocationCardProps) {
  return (
    <FadeIn delay={delay}>
      <PremiumCard className="p-6 md:p-8">
        <h3 className="font-display text-lg font-semibold md:text-xl">
          {storeName}
        </h3>
        {offerings && offerings.length > 0 && (
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-success">
            {formatOfferingsLabel(offerings)}
          </p>
        )}
        <p className="mt-2 text-sm font-medium">
          <RetailerLink slug={retailerSlug} />
        </p>
        <div className="mt-4 space-y-2 text-sm text-muted">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            {address}
          </p>
          <p>{city}</p>
        </div>
        {retailerHasPage(retailerSlug) && (
          <Link
            href={retailerPageHref(retailerSlug)}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-6 rounded-full"
            )}
          >
            Profil prodavca
          </Link>
        )}
      </PremiumCard>
    </FadeIn>
  );
}
