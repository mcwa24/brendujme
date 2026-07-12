import { FooterSocialIcon } from "@/components/layout/footer-social-icon";
import {
  BILBORD_FOOTER_TAGLINE,
  BILBORD_SITE_URL,
  bilbordFooterBarLinks,
  bilbordFooterNavColumns,
  bilbordFooterSocial,
} from "@/lib/bilbord-footer";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="s-footer">
      <div className="s-container">
        <div className="s-footer-stack">
          <div className="s-footer-main">
            <div className="s-footer-brand">
              <a href={BILBORD_SITE_URL} className="s-footer-brand-logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/bilbord-logo.png" alt="Bilbord.rs" decoding="async" />
              </a>
              <p>{BILBORD_FOOTER_TAGLINE}</p>
              <ul className="s-social">
                {bilbordFooterSocial.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                    >
                      <FooterSocialIcon name={item.icon} />
                      <span className="sr-text">{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <nav className="s-footer-nav" aria-label="Navigacija u podnožju">
              {bilbordFooterNavColumns.map((column) => (
                <ul key={column.title}>
                  <li>
                    <span role="heading" aria-level={4}>
                      {column.title}
                    </span>
                  </li>
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              ))}
            </nav>
          </div>

          <div className="s-footer-bar">
            <p className="s-footer-bar-copyright">
              © {year} Bilbord.rs. Sva prava zadržana.
            </p>
            <nav className="s-footer-bar-links" aria-label="Pravni linkovi">
              {bilbordFooterBarLinks.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
