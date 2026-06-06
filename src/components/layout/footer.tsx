import Link from "next/link";
import { Container } from "@/components/layout/container";
import { FooterSocialIcon } from "@/components/layout/footer-social-icon";
import {
  BILBORD_IMPRESUM_URL,
  BILBORD_SITE_URL,
  bilbordFooterColumns,
  bilbordFooterSocial,
} from "@/lib/bilbord-footer";

const footerLinkClass =
  "text-[14.5px] font-medium leading-[1.35] text-[#878685] no-underline transition-opacity hover:opacity-[0.85]";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-[12vw] bg-background text-[15px] text-foreground">
      <Container>
        <div className="pb-[clamp(18px,2.5vw,32px)]">
          <div className="flex flex-col gap-[clamp(32px,4vw,48px)] pt-[clamp(28px,3vw,40px)]">
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5 max-sm:flex-col max-sm:items-start">
              <Link
                href={BILBORD_SITE_URL}
                className="inline-flex items-center leading-none transition-opacity hover:opacity-[0.85]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/bilbord-logo.png"
                  alt="Bilbord Media"
                  className="block h-10 w-auto max-h-10 object-contain"
                  decoding="async"
                />
              </Link>

              <ul className="m-0 flex list-none flex-wrap items-center gap-x-[18px] gap-y-2 p-0 max-sm:gap-x-3.5">
                {bilbordFooterSocial.map((item) => (
                  <li key={item.href} className="flex">
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className="flex size-9 items-center justify-center text-[#2A2A2A] opacity-90 no-underline transition-opacity hover:opacity-100"
                    >
                      <FooterSocialIcon name={item.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <nav
              className="grid w-full grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-[clamp(24px,3vw,40px)]"
              aria-label="Navigacija u podnožju"
            >
              {bilbordFooterColumns.map((column) => (
                <section key={column.title} className="flex min-w-0 flex-col gap-[18px]">
                  <h3 className="m-0 text-xs font-[650] uppercase tracking-[0.02em] text-[#2A2A2A]">
                    {column.title}
                  </h3>
                  <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <a href={link.href} className={footerLinkClass}>
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </nav>
          </div>

          <div className="mt-[clamp(28px,3vw,40px)] pt-[clamp(20px,2vw,28px)]">
            <p className="m-0 w-full text-center text-[13.5px] font-medium tracking-[-0.01em] text-[#878685]">
              © {year} Bilbord Media
              <span aria-hidden="true"> · </span>
              <a href={BILBORD_IMPRESUM_URL} className={footerLinkClass}>
                Impresum
              </a>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
