import Link from "next/link";
import { Container } from "@/components/layout/container";
import { BILBORD_CONTACT_URL } from "@/lib/bilbord";
import { FadeIn } from "@/components/motion/fade-in";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Politika privatnosti",
  description:
    "Politika privatnosti Bilbord Shop-a (shop.bilbord.rs), uključujući korišćenje fotografija sa Unsplash-a.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">
          Politika privatnosti
        </h1>
        <div className="prose prose-neutral mt-8 max-w-3xl space-y-6 text-muted">
          <p className="text-lg text-foreground">
            Ova stranica opisuje kako Bilbord Shop postupa sa podacima i
            sadržajem trećih strana na shop.bilbord.rs.
          </p>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Podaci koje prikupljamo
            </h2>
            <p>
              Katalog brendova i prodajnih lokacija prikazuje javno dostupne
              retail informacije. Ako nas kontaktirate putem{" "}
              <a
                href={BILBORD_CONTACT_URL}
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                kontakt stranice na bilbord.rs
              </a>
              , koristimo podatke koje nam pošaljete isključivo radi odgovora na
              upit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Fotografije sa Unsplash-a
            </h2>
            <p>
              Na pojedinim delovima sajta (npr. vizuelne pozadine banera
              akcija) mogu se prikazivati stock fotografije preuzete preko{" "}
              <a
                href="https://unsplash.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Unsplash
              </a>
              . Te slike nisu naše originalne fotografije proizvoda ili
              prodavnica; služe isključivo kao ilustrativna pozadina u skladu
              sa Unsplash licencom.
            </p>
            <p>
              Vesti i slike uz članke sa{" "}
              <a
                href="https://bilbord.rs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                bilbord.rs
              </a>{" "}
              dolaze iz našeg Ghost CMS-a i nisu Unsplash materijal, osim ako
              nije drugačije naznačeno uz sam članak.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Kolačići i analitika
            </h2>
            <p>
              Platforma može koristiti neophodne kolačiće za rad sajta. Ne
              prodajemo lične podatke trećim stranama.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Kontakt
            </h2>
            <p>
              Za pitanja u vezi privatnosti pišite nam putem{" "}
              <a
                href={BILBORD_CONTACT_URL}
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                bilbord.rs/kontakt
              </a>
              .
            </p>
          </section>

          <p className="text-sm">Poslednje ažuriranje: jun 2026.</p>
        </div>
      </FadeIn>
    </Container>
  );
}
