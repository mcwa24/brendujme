import { BrandDirectory } from "@/components/brands/brand-directory";
import { getAllBrands } from "@/lib/data/repository";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Brendovi",
  description:
    "Pretražite modne brendove u Srbiji i saznajte gde ih možete kupiti.",
  path: "/brands",
});

export default async function BrandsPage() {
  const brands = await getAllBrands();
  return <BrandDirectory brands={brands} />;
}
