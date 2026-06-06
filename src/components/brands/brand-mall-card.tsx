import Link from "next/link";
import { MapPin } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { ShoppingCenterLogo } from "@/components/shopping-centers/shopping-center-logo";
import { PremiumCard } from "@/components/ui/premium-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShoppingCenter } from "@/types";

interface BrandMallCardProps {
  center: ShoppingCenter;
  delay?: number;
}

export function BrandMallCard({ center, delay = 0 }: BrandMallCardProps) {
  return (
    <FadeIn delay={delay}>
      <Link href={`/shopping-centers/${center.slug}`}>
        <PremiumCard className="h-full p-6 transition-shadow hover:shadow-md md:p-8">
          <ShoppingCenterLogo
            slug={center.slug}
            name={center.name}
            size="md"
            className="mb-4"
          />
          <h3 className="font-display text-lg font-semibold md:text-xl">
            {center.name}
          </h3>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted">
            Tržni centar
          </p>
          <div className="mt-4 space-y-2 text-sm text-muted">
            {center.address && (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {center.address}
              </p>
            )}
            <p>{center.city}</p>
          </div>
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "mt-6 inline-flex rounded-none"
            )}
          >
            Profil centra
          </span>
        </PremiumCard>
      </Link>
    </FadeIn>
  );
}
