import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { PremiumCard } from "@/components/ui/premium-card";
import { shoppingCenters } from "@/lib/data/shopping-centers";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function ShoppingCentersSection() {
  const centers = shoppingCenters.slice(0, 6);

  return (
    <section className="py-20">
      <Container narrow>
        <FadeIn>
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
            Popularni tržni centri
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            Najveće retail destinacije sa najbogatijom ponudom brendova.
          </p>
        </FadeIn>
        <FadeIn delay={0.1} className="mt-12">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-5 pb-4">
              {centers.map((center) => (
                <Link
                  key={center.slug}
                  href={`/shopping-centers/${center.slug}`}
                  className="inline-block w-[300px] shrink-0 whitespace-normal sm:w-[340px]"
                >
                  <PremiumCard className="overflow-hidden">
                    <div className="flex h-40 items-center justify-center bg-[#f0f0ed]">
                      <Building2 className="h-12 w-12 text-muted/40" />
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-xl font-semibold">
                        {center.name}
                      </h3>
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                        <MapPin className="h-4 w-4" />
                        {center.city}
                      </div>
                      <p className="mt-3 text-sm text-muted">
                        {center.brandCount} brendova
                      </p>
                    </div>
                  </PremiumCard>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </FadeIn>
      </Container>
    </section>
  );
}
