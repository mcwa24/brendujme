import { notFound, redirect } from "next/navigation";
import { getPopulatedCategories } from "@/lib/data/repository";
import { createMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getPopulatedCategories();
  const params = categories.map((c) => ({ slug: c.slug }));
  params.push({ slug: "fashion" });
  return params;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const categories = await getPopulatedCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category && slug !== "fashion") return {};
  const title = category?.name ?? "Ostali brendovi";
  const description =
    category?.description ??
    "Brendovi bez posebnog segmenta — kompletan pregled u direktorijumu.";
  return createMetadata({
    title,
    description,
    path: `/categories/${slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const categories = await getPopulatedCategories();
  const known = categories.some((c) => c.slug === slug) || slug === "fashion";
  if (!known) notFound();

  redirect(`/brands?category=${slug}`);
}
