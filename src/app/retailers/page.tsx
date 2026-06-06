import Link from "next/link";
import { MapPin } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { RetailerLogo } from "@/components/retailers/retailer-logo";
import { PremiumCard } from "@/components/ui/premium-card";
import { getRetailerCatalogMeta } from "@/lib/data/retailer-catalog-meta";
import { getAllRetailers } from "@/lib/data/repository";
import { formatBrandCount, formatStoreCount } from "@/lib/format/sr-plural";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Prodavci",
  description:
    "Prodavci i distributeri modnih brendova u Srbiji — gde možete kupiti patike, streetwear i premium modu.",
  path: "/retailers",
});

export default async function RetailersPage() {
  const retailers = await getAllRetailers();

  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">Prodavci</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Gde kupiti — distributeri i prodavci modnih brendova u Srbiji.
        </p>
      </FadeIn>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {retailers.map((retailer, i) => {
          const catalogMeta = getRetailerCatalogMeta(retailer.slug);
          return (
          <FadeIn key={retailer.slug} delay={i * 0.04}>
            <Link href={`/retailers/${retailer.slug}`}>
              <PremiumCard className="p-8">
                <div className="flex items-center gap-4">
                  <RetailerLogo
                    slug={retailer.slug}
                    name={retailer.name}
                    size="lg"
                    variant={
                      retailer.slug === "fashion-company" ? "page" : "default"
                    }
                    className="rounded-xl"
                  />
                  <h2 className="font-display text-2xl font-semibold">{retailer.name}</h2>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                  <MapPin className="h-4 w-4" />
                  {retailer.city}
                </div>
                <p className="mt-3 line-clamp-2 text-muted">{retailer.description}</p>
                {catalogMeta ? (
                  <p className="mt-4 text-sm text-success">
                    {formatBrandCount(catalogMeta.brandCount)} u portfoliju ·{" "}
                    {formatStoreCount(catalogMeta.storeCount)} u Srbiji
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-success">
                    {formatBrandCount(retailer.brandCount)}
                  </p>
                )}
              </PremiumCard>
            </Link>
          </FadeIn>
          );
        })}
      </div>
    </Container>
  );
}
