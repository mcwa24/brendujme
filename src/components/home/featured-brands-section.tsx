import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { FeaturedBrandsMarquee } from "@/components/home/featured-brands-marquee";
import { HOME_SECTION_PY, HOME_SECTION_TITLE } from "@/components/home/section-spacing";
import type { Brand } from "@/types";

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
    <Wrapper className={HOME_SECTION_PY}>
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
          <Link
            href="/brands"
            className="hidden shrink-0 items-center gap-1 text-sm font-medium text-accent hover:underline sm:flex"
          >
            Svi brendovi
            <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>
      </Container>

      <FadeIn delay={0.08} className="mt-10 w-full">
        <FeaturedBrandsMarquee brands={brands} />
      </FadeIn>

      <Container narrow>
        <div className="mt-6 sm:hidden">
          <Link
            href="/brands"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent"
          >
            Svi brendovi
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </Wrapper>
  );
}
