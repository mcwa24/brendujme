import { BrandDirectory } from "@/components/brands/brand-directory";
import { getAllBrands } from "@/lib/data/repository";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Brendovi",
  description:
    "Pregledajte i pretražite premium brendove dostupne u Srbiji — moda, lepota, sport i luksuz.",
  path: "/brands",
});

export default async function BrandsPage() {
  const brands = await getAllBrands();
  return <BrandDirectory brands={brands} />;
}
