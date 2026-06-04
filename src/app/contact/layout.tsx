import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Kontakt",
  description: "Kontaktirajte tim Bilbord Brands.",
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
