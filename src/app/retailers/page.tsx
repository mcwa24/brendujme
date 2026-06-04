import Link from "next/link";
import { MapPin, Store } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { PremiumCard } from "@/components/ui/premium-card";
import { retailers } from "@/lib/data/retailers";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Prodavci",
  description: "Pronađite prodavce i retail partnere koji nude premium brendove u Srbiji.",
  path: "/retailers",
});

export default function RetailersPage() {
  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">Prodavci</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Multi-brand prodavnice, department store-ovi i specijalizovani retail partneri.
        </p>
      </FadeIn>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {retailers.map((retailer, i) => (
          <FadeIn key={retailer.slug} delay={i * 0.04}>
            <Link href={`/retailers/${retailer.slug}`}>
              <PremiumCard className="group p-8">
                <Store className="h-8 w-8 text-muted/50" />
                <h2 className="font-display mt-4 text-xl font-semibold group-hover:text-accent">
                  {retailer.name}
                </h2>
                <p className="mt-2 text-sm text-muted line-clamp-2">
                  {retailer.description}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-sm text-muted">
                  <MapPin className="h-4 w-4" />
                  {retailer.city}
                </div>
                <p className="mt-3 text-sm font-medium text-success">
                  {retailer.brandCount} brendova
                </p>
              </PremiumCard>
            </Link>
          </FadeIn>
        ))}
      </div>
    </Container>
  );
}
