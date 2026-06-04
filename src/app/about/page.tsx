import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "O nama",
  description:
    "Bilbord Brands je premium platforma za retail inteligenciju i otkrivanje brendova u Srbiji.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">O nama</h1>
        <div className="mt-8 max-w-3xl space-y-6 text-muted">
          <p className="text-lg text-foreground">
            Bilbord Brands je premium platforma za otkrivanje brendova dostupnih u
            Srbiji.
          </p>
          <p>
            Pomažemo kupcima, retail profesionalcima i brendovima da pronađu tačne
            informacije o dostupnosti — gde se prodaje, u kojim tržnim centrima i kod
            kojih partnera.
          </p>
          <p>
            Naš fokus nije e-commerce. Mi smo retail intelligence direktorijum —
            pouzdan, editorial i dizajniran sa istom pažnjom kao vodeći globalni
            produkti.
          </p>
        </div>
      </FadeIn>
    </Container>
  );
}
