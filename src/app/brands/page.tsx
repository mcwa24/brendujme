import { BrandDirectory } from "@/components/brands/brand-directory";
import { brands } from "@/lib/data/brands";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Brendovi",
  description:
    "Pregledajte i pretražite premium brendove dostupne u Srbiji — moda, lepota, sport i luksuz.",
  path: "/brands",
});

export default function BrandsPage() {
  return <BrandDirectory brands={brands} />;
}
