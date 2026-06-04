import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { BrandCard } from "@/components/brands/brand-card";
import { categories, getCategoryBySlug } from "@/lib/data/categories";
import { getBrandsByCategory } from "@/lib/data/brands";
import { createMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return createMetadata({
    title: category.name,
    description: category.description,
    path: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const categoryBrands = getBrandsByCategory(slug);

  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">
          {category.name}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{category.description}</p>
      </FadeIn>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categoryBrands.map((brand, i) => (
          <FadeIn key={brand.slug} delay={i * 0.04}>
            <BrandCard brand={brand} />
          </FadeIn>
        ))}
      </div>
      {categoryBrands.length === 0 && (
        <p className="mt-16 text-center text-muted">Nema brendova u ovoj kategoriji.</p>
      )}
    </Container>
  );
}
