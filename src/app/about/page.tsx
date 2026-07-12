import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { PAGE_CONTENT_MT } from "@/components/home/section-spacing";
import { FadeIn } from "@/components/motion/fade-in";
import { createMetadata, siteName } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = createMetadata({
  title: "O nama",
  description:
    "Bilbord Shop je vodič kroz modne brendove u Srbiji — gde kupiti patike, streetwear i premium odeću.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PageSection>
      <Container>
        <PageHeader title="O nama" />
        <FadeIn delay={0.06} className={cn(PAGE_CONTENT_MT, "max-w-3xl space-y-6 text-muted")}>
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
        </FadeIn>
      </Container>
    </PageSection>
  );
}
