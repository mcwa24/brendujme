import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Kontakt",
  description: "Kontaktirajte tim Bilbord Shop-a.",
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
