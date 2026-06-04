import Link from "next/link";
import { MapPin } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { PremiumCard } from "@/components/ui/premium-card";
import { getAllRetailers } from "@/lib/data/repository";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Prodavci",
  description: "Retail partneri i distributeri premium brendova u Srbiji.",
  path: "/retailers",
});

export default async function RetailersPage() {
  const retailers = await getAllRetailers();

  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">Prodavci</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Distributeri i retail partneri koji zastupaju međunarodne brendove u Srbiji.
        </p>
      </FadeIn>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {retailers.map((retailer, i) => (
          <FadeIn key={retailer.slug} delay={i * 0.04}>
            <Link href={`/retailers/${retailer.slug}`}>
              <PremiumCard className="p-8">
                <h2 className="font-display text-2xl font-semibold">{retailer.name}</h2>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                  <MapPin className="h-4 w-4" />
                  {retailer.city}
                </div>
                <p className="mt-3 line-clamp-2 text-muted">{retailer.description}</p>
                <p className="mt-4 text-sm text-success">
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
