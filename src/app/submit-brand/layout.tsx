import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Prijavite brend",
  description: "Predložite brend za uključivanje u Bilbord Brands direktorijum.",
  path: "/submit-brand",
});

export default function SubmitBrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
