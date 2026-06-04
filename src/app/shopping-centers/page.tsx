import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { PremiumCard } from "@/components/ui/premium-card";
import { shoppingCenters } from "@/lib/data/shopping-centers";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Tržni centri",
  description:
    "Pregled tržnih centara u Srbiji i brendova koji su u njima dostupni.",
  path: "/shopping-centers",
});

export default function ShoppingCentersPage() {
  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">
          Tržni centri
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Najveće retail destinacije u Srbiji sa kompletnom ponudom brendova.
        </p>
      </FadeIn>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shoppingCenters.map((center, i) => (
          <FadeIn key={center.slug} delay={i * 0.04}>
            <Link href={`/shopping-centers/${center.slug}`}>
              <PremiumCard className="overflow-hidden">
                <div className="flex h-44 items-center justify-center bg-[#f0f0ed]">
                  <Building2 className="h-14 w-14 text-muted/30" />
                </div>
                <div className="p-6">
                  <h2 className="font-display text-xl font-semibold">{center.name}</h2>
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                    <MapPin className="h-4 w-4" />
                    {center.city}
                  </div>
                  <p className="mt-3 text-sm text-success">
                    {center.brandCount} brendova
                  </p>
                </div>
              </PremiumCard>
            </Link>
          </FadeIn>
        ))}
      </div>
    </Container>
  );
}
