import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { Container } from "@/components/layout/container";
import { Separator } from "@/components/ui/separator";

const footerColumns = [
  {
    title: "Platforma",
    links: [
      { href: "/brands", label: "Brendovi" },
      { href: "/categories", label: "Kategorije" },
      { href: "/retailers", label: "Prodavci" },
      { href: "/shopping-centers", label: "Tržni centri" },
    ],
  },
  {
    title: "Sadržaj",
    links: [
      { href: "/news", label: "Vesti" },
      { href: "/about", label: "O nama" },
      { href: "/contact", label: "Kontakt" },
      { href: "/submit-brand", label: "Prijavi brend" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <BrandMark logoHeight={40} brandsClassName="text-xl md:text-2xl" />
            <p className="mt-4 max-w-md text-muted">
              Premium platforma za otkrivanje brenda dostupnih u Srbiji.
              Retail inteligencija za modu, lepotu i lifestyle.
            </p>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-10" />
        <div className="flex flex-col gap-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Bilbord Brands. Sva prava zadržana.</p>
          <p>Premium Retail Intelligence Platform za Srbiju</p>
        </div>
      </Container>
    </footer>
  );
}
