import { CookieSettingsLink } from "@/components/cookies/cookie-settings-link";
import { FooterSocialIcon } from "@/components/layout/footer-social-icon";
import {
  BILBORD_IMPRESUM_URL,
  BILBORD_SITE_URL,
  bilbordFooterColumns,
  bilbordFooterSocial,
} from "@/lib/bilbord-footer";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="gh-footer gh-outer !mt-[12vw]">
      <div className="gh-footer-inner gh-inner">
        <div className="gh-footer-wrap">
          <div className="gh-footer-top">
            <a href={BILBORD_SITE_URL} className="gh-footer-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/bilbord-logo.png"
                alt="Bilbord Media"
                className="gh-footer-brand-logo"
                decoding="async"
              />
            </a>

            <ul className="gh-footer-social">
              {bilbordFooterSocial.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                  >
                    <FooterSocialIcon name={item.icon} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav className="gh-footer-columns" aria-label="Navigacija u podnožju">
            {bilbordFooterColumns.map((column) => (
              <section key={column.title} className="gh-footer-column">
                <h3 className="gh-footer-column-title">{column.title}</h3>
                <ul className="gh-footer-column-list">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      {link.label === "Kolačići" ? (
                        <CookieSettingsLink />
                      ) : (
                        <a href={link.href}>{link.label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>

        <div className="gh-footer-bottom">
          <p className="gh-footer-copyright">
            © {year} Bilbord Media
            <span className="gh-footer-copyright-sep" aria-hidden="true">
              {" "}
              ·{" "}
            </span>
            <a href={BILBORD_IMPRESUM_URL}>Impresum</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
