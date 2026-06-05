import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";
import { Container } from "@/components/layout/container";
import { Separator } from "@/components/ui/separator";

const footerColumns = [
  {
    title: "Platforma",
    links: [
      { href: "/brands", label: "Brendovi" },
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
      { href: "/privacy", label: "Politika privatnosti" },
      { href: "/submit-brand", label: "Prijavi brend" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-card">
      <Container narrow className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <BrandMark logoHeight={36} />
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              Premium platforma za otkrivanje brenda dostupnih u Srbiji.
              Retail inteligencija za modu, lepotu i lifestyle.
            </p>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground/80">
                {col.title}
              </h4>
              <ul className="mt-2.5 space-y-1">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col gap-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Bilbord Brands. Sva prava zadržana.{" "}
            <Link href="/privacy" className="hover:text-accent">
              Politika privatnosti
            </Link>
          </p>
          <p>Premium Retail Intelligence Platform za Srbiju</p>
        </div>
      </Container>
    </footer>
  );
}
