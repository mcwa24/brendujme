import { Suspense } from "react";
import { BrandDirectory } from "@/components/brands/brand-directory";
import { Container } from "@/components/layout/container";
import { getAllBrands } from "@/lib/data/repository";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Brendovi",
  description:
    "Pregledajte i pretražite premium brendove dostupne u Srbiji — moda, lepota, sport i luksuz.",
  path: "/brands",
});

function BrandsDirectoryFallback() {
  return (
    <Container narrow className="py-12 md:py-16">
      <p className="text-muted">Učitavanje direktorijuma…</p>
    </Container>
  );
}

export default async function BrandsPage() {
  const brands = await getAllBrands();

  return (
    <Suspense fallback={<BrandsDirectoryFallback />}>
      <BrandDirectory brands={brands} />
    </Suspense>
  );
}
