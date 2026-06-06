import { BrandDirectory } from "@/components/brands/brand-directory";
import { toBrandDirectoryItem } from "@/lib/data/brand-directory-item";
import { getAllBrands } from "@/lib/data/repository";
import { createMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = createMetadata({
  title: "Brendovi",
  description:
    "Pretražite modne brendove u Srbiji i saznajte gde ih možete kupiti.",
  path: "/brands",
});

export default async function BrandsPage() {
  const brands = await getAllBrands();
  return <BrandDirectory brands={brands.map(toBrandDirectoryItem)} />;
}
