import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Prijavite brend",
  description: "Predložite modni brend za uključivanje u Bilbord Shop.",
  path: "/submit-brand",
});

export default function SubmitBrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
