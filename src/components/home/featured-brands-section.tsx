import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { FeaturedBrandsMarquee } from "@/components/home/featured-brands-marquee";
import { HOME_SECTION_PY, HOME_SECTION_TITLE } from "@/components/home/section-spacing";
import { SectionCtaLink } from "@/components/ui/section-cta-link";
import type { Brand } from "@/types";
import { cn } from "@/lib/utils";

interface FeaturedBrandsSectionProps {
  brands: Brand[];
  /** U hero bloku odmah ispod pretrage — bez dodatnog section paddinga. */
  embedded?: boolean;
}

export function FeaturedBrandsSection({
  brands,
  embedded = false,
}: FeaturedBrandsSectionProps) {
  if (brands.length === 0) return null;

  const Wrapper = embedded ? "div" : "section";

  return (
    <Wrapper
      className={cn(
        "w-full bg-card",
        embedded ? "py-12 md:py-16" : HOME_SECTION_PY
      )}
    >
      <Container narrow>
        <FadeIn className="flex items-end justify-between gap-6">
          <div>
            <h2 className={HOME_SECTION_TITLE}>
              Istaknuti brendovi
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Brendovi koje najčešće tražite — i gde ih možete kupiti u Srbiji.
            </p>
          </div>
          <SectionCtaLink href="/brands" className="hidden shrink-0 sm:flex">
            Svi brendovi
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </SectionCtaLink>
        </FadeIn>
      </Container>

      <FadeIn delay={0.08} className="mt-8 w-full md:mt-10">
        <FeaturedBrandsMarquee brands={brands} fullWidth />
      </FadeIn>

      <Container narrow>
        <div className="mt-6 sm:hidden">
          <SectionCtaLink href="/brands">
            Svi brendovi
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </SectionCtaLink>
        </div>
      </Container>
    </Wrapper>
  );
}
