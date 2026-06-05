import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { BrandCard } from "@/components/brands/brand-card";
import { getAllBrands, getPopulatedCategories } from "@/lib/data/repository";
import { formatBrandCount } from "@/lib/format/sr-plural";
import { createMetadata } from "@/lib/seo";
import { PremiumCard } from "@/components/ui/premium-card";

export const metadata = createMetadata({
  title: "Kategorije",
  description: "Pregledajte sve brendove po kategorijama — lepota, sport, obuća, luksuz i lifestyle.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const [categories, brands] = await Promise.all([
    getPopulatedCategories(),
    getAllBrands(),
  ]);

  const sortedBrands = [...brands].sort((a, b) =>
    a.name.localeCompare(b.name, "sr")
  );

  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">Kategorije</h1>
        <p className="mt-3 max-w-2xl text-muted">
          {formatBrandCount(brands.length)} u katalogu — po segmentima ili kompletan pregled ispod.
        </p>
      </FadeIn>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, i) => {
          const count = brands.filter((b) => b.category === category.slug).length;
          return (
            <FadeIn key={category.slug} delay={i * 0.05}>
              <Link href={`/brands?category=${category.slug}`}>
                <PremiumCard className="group p-8">
                  <ArrowUpRight className="ml-auto h-5 w-5 text-muted group-hover:text-accent" />
                  <h2 className="font-display text-2xl font-semibold">{category.name}</h2>
                  <p className="mt-2 text-muted">{category.description}</p>
                  <p className="mt-4 text-sm text-success">{formatBrandCount(count)}</p>
                </PremiumCard>
              </Link>
            </FadeIn>
          );
        })}
      </div>

      <section className="mt-20 border-t border-border pt-16">
        <FadeIn>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Svi brendovi
          </h2>
          <p className="mt-3 text-muted">
            Kompletan katalog sortiran A–Ž — {formatBrandCount(sortedBrands.length)}.
          </p>
        </FadeIn>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedBrands.map((brand, i) => (
            <FadeIn key={brand.slug} delay={(i % 9) * 0.03}>
              <BrandCard brand={brand} variant="compact" />
            </FadeIn>
          ))}
        </div>
      </section>
    </Container>
  );
}
