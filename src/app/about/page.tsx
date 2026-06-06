import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { createMetadata, siteName } from "@/lib/seo";

export const metadata = createMetadata({
  title: "O nama",
  description:
    "Bilbord Shop je vodič kroz modne brendove u Srbiji — gde kupiti patike, streetwear i premium odeću.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">O nama</h1>
        <div className="mt-8 max-w-3xl space-y-6 text-muted">
          <p className="text-lg text-foreground">
            {siteName} je vodič za sve koji traže gde mogu kupiti modne brendove
            u Srbiji.
          </p>
          <p>
            Pomažemo vam da pronađete brend, zatim prodavnicu ili tržni centar
            gde je dostupan — u Beogradu, Novom Sadu, Nišu i drugim gradovima.
            Pokrivamo patike, streetwear, sportsku i premium modu.
          </p>
          <p>
            Još nismo online prodavnica i ne prodajemo proizvode. Naš posao je
            da povežemo kupce sa pravim mestom kupovine — fizičkom prodavnicom
            ili zvaničnim sajtom partnera.
          </p>
          <p>
            {siteName} je deo Bilbord ekosistema, uz medijski portal{" "}
            <a
              href="https://bilbord.rs"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              bilbord.rs
            </a>
            .
          </p>
        </div>
      </FadeIn>
    </Container>
  );
}
