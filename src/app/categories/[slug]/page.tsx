import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { BrandCard } from "@/components/brands/brand-card";
import {
  getAllCategories,
  getBrandsByCategory,
  getCategoryBySlug,
} from "@/lib/data/repository";
import { formatBrandCount } from "@/lib/format/sr-plural";
import { createMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return createMetadata({
    title: category.name,
    description: category.description,
    path: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const categoryBrands = await getBrandsByCategory(slug);

  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">
          {category.name}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{category.description}</p>
        <p className="mt-4 text-sm text-success">
          {formatBrandCount(categoryBrands.length)}
        </p>
      </FadeIn>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categoryBrands.map((brand, i) => (
          <FadeIn key={brand.slug} delay={i * 0.04}>
            <BrandCard brand={brand} variant="compact" />
          </FadeIn>
        ))}
      </div>
    </Container>
  );
}
