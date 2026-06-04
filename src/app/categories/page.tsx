import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { categories } from "@/lib/data/categories";
import { brands } from "@/lib/data/brands";
import { createMetadata } from "@/lib/seo";
import { PremiumCard } from "@/components/ui/premium-card";

export const metadata = createMetadata({
  title: "Kategorije",
  description: "Pregledajte brendove po kategorijama — moda, lepota, sport, luksuz i više.",
  path: "/categories",
});

export default function CategoriesPage() {
  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">Kategorije</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Istražite brendove organizovane po segmentima retail tržišta Srbije.
        </p>
      </FadeIn>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, i) => {
          const count = brands.filter((b) => b.category === category.slug).length;
          return (
            <FadeIn key={category.slug} delay={i * 0.05}>
              <Link href={`/categories/${category.slug}`}>
                <PremiumCard className="group p-8">
                  <ArrowUpRight className="ml-auto h-5 w-5 text-muted group-hover:text-accent" />
                  <h2 className="font-display text-2xl font-semibold">{category.name}</h2>
                  <p className="mt-2 text-muted">{category.description}</p>
                  <p className="mt-4 text-sm text-success">{count} brendova</p>
                </PremiumCard>
              </Link>
            </FadeIn>
          );
        })}
      </div>
    </Container>
  );
}
