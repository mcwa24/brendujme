import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { FeaturedBrandsMarquee } from "@/components/home/featured-brands-marquee";
import { HOME_SECTION_PY } from "@/components/home/section-spacing";
import type { Brand } from "@/types";

interface FeaturedBrandsSectionProps {
  brands: Brand[];
}

export function FeaturedBrandsSection({ brands }: FeaturedBrandsSectionProps) {
  if (brands.length === 0) return null;

  return (
    <section className={HOME_SECTION_PY}>
      <Container narrow>
        <FadeIn className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
              Istaknuti brendovi
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Premium i contemporary brendovi sa najširom dostupnošću u Srbiji.
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
        <div className="mt-8 sm:hidden">
          <Link
            href="/brands"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent"
          >
            Svi brendovi
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
