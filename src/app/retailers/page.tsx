import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { FadeIn } from "@/components/motion/fade-in";
import { RetailersList } from "@/components/retailers/retailers-list";
import { getAllRetailers } from "@/lib/data/repository";
import { formatRetailerCount } from "@/lib/format/sr-plural";
import { createMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = createMetadata({
  title: "Prodavci",
  description:
    "Prodavci i distributeri modnih brendova u Srbiji — gde možete kupiti patike, streetwear i premium modu.",
  path: "/retailers",
});

export default async function RetailersPage() {
  const retailers = await getAllRetailers();

  return (
    <PageSection>
      <Container>
        <PageHeader
          title="Prodavci"
          description={`${formatRetailerCount(retailers.length)} — gde možete kupiti modne brendove u Srbiji, od sneaker shopova do multibrend lanaca.`}
          className="pb-12 md:pb-16"
        />
        <RetailersList retailers={retailers} />
      </Container>
    </PageSection>
  );
}
