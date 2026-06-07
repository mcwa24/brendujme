import { Container } from "@/components/layout/container";
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
    <Container narrow className="py-12 md:py-16">
      <FadeIn when="mount">
        <h1 className="font-display text-3xl font-semibold leading-tight md:text-5xl">
          Prodavci
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          {formatRetailerCount(retailers.length)} — gde možete kupiti modne brendove u
          Srbiji, od sneaker shopova do multibrend lanaca.
        </p>
      </FadeIn>
      <RetailersList retailers={retailers} />
    </Container>
  );
}
