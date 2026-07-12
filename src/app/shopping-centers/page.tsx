import Link from "next/link";
import { MapPin } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { FadeIn } from "@/components/motion/fade-in";
import { PremiumCard } from "@/components/ui/premium-card";
import { PAGE_CONTENT_MT } from "@/components/home/section-spacing";
import { ShoppingCenterLogo } from "@/components/shopping-centers/shopping-center-logo";
import { getAllShoppingCenters } from "@/lib/data/repository";
import { formatBrandCount } from "@/lib/format/sr-plural";
import { createMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = createMetadata({
  title: "Tržni centri",
  description:
    "Pregled tržnih centara u Srbiji i brenda koji su u njima dostupni.",
  path: "/shopping-centers",
});

export default async function ShoppingCentersPage() {
  const shoppingCenters = await getAllShoppingCenters();

  return (
    <PageSection>
      <Container>
        <PageHeader
          title="Tržni centri"
          description="Najveće retail destinacije u Srbiji sa kompletnom ponudom brendova."
        />
        <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${PAGE_CONTENT_MT}`}>
        {shoppingCenters.map((center, i) => (
          <FadeIn key={center.slug} delay={i * 0.04}>
            <Link href={`/shopping-centers/${center.slug}`} prefetch={false}>
              <PremiumCard className="overflow-hidden">
                <ShoppingCenterLogo
                  slug={center.slug}
                  name={center.name}
                  variant="banner"
                />
                <div className="p-6">
                  <h2 className="font-display text-xl font-semibold">{center.name}</h2>
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                    <MapPin className="h-4 w-4" />
                    {center.city}
                  </div>
                  <p className="mt-3 text-sm text-success">
                    {formatBrandCount(center.brandCount)}
                  </p>
                </div>
              </PremiumCard>
            </Link>
          </FadeIn>
        ))}
      </div>
      </Container>
    </PageSection>
  );
}
