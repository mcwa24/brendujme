import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { BrandCard } from "@/components/brands/brand-card";
import type { Brand } from "@/types";

interface FeaturedBrandsSectionProps {
  brands: Brand[];
}

export function FeaturedBrandsSection({ brands }: FeaturedBrandsSectionProps) {

  return (
    <section className="py-20">
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
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {brands.map((brand, i) => (
            <FadeIn key={brand.slug} delay={i * 0.05}>
              <BrandCard brand={brand} />
            </FadeIn>
          ))}
        </div>
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
