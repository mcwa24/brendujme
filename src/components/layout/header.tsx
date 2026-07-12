"use client";

import Link from "next/link";
import { golosText } from "@/lib/fonts";
import { BILBORD_CONTACT_URL } from "@/lib/bilbord";
import { BILBORD_SITE_URL } from "@/lib/bilbord-footer";
import { BILBORD_MODA_STIL_URL } from "@/lib/news/urls";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HeaderBurgerButton,
  HeaderCloseButton,
  HeaderSearchButton,
} from "@/components/layout/header-icon-button";
import { useSearch } from "@/components/search/search-provider";

const navItems = [
  { href: BILBORD_SITE_URL, label: "Portal", external: true },
  { href: "/brands", label: "Brendovi" },
  { href: "/retailers", label: "Prodavci" },
  { href: "/shopping-centers", label: "Tržni centri" },
  { href: BILBORD_MODA_STIL_URL, label: "Vesti", external: true },
] as const;

function NavMenu({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className={`s-menu ${golosText.className}`}>
      {navItems.map((item) => (
        <li key={item.href}>
          {"external" in item && item.external ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavigate}
            >
              {item.label}
            </a>
          ) : (
            <Link href={item.href} prefetch={false} onClick={onNavigate}>
              {item.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export function Header() {
  const pathname = usePathname();
  const { setOpen } = useSearch();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("s-nav-open", mobileOpen);
    return () => {
      document.body.classList.remove("s-nav-open");
    };
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);
  const toggleMenu = () => setMobileOpen((open) => !open);
  const openSearch = () => {
    closeMenu();
    setOpen(true);
  };

  return (
    <header className="s-header">
      <div className="s-container">
        <Link href="/" className="s-logo s-logo--image" suppressHydrationWarning>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bilbord-logo.png" alt="Bilbord Shop" decoding="async" />
        </Link>

        <nav className="s-nav" aria-hidden={mobileOpen ? "false" : "true"}>
          <NavMenu onNavigate={closeMenu} />
          <div className="s-utils s-utils--nav">
            <div className="s-utils-account">
              <Link href={BILBORD_CONTACT_URL} className="s-btn" onClick={closeMenu}>
                <span>Prijavi brend</span>
              </Link>
            </div>
            <HeaderCloseButton className="s-utils-close" onClick={closeMenu} />
          </div>
        </nav>

        <div className="s-utils">
          <HeaderSearchButton className="s-utils-search" onClick={openSearch} />
          <div className="s-utils-account">
            <Link href={BILBORD_CONTACT_URL} className="s-btn">
              <span>Prijavi brend</span>
            </Link>
          </div>
          <HeaderBurgerButton
            className="s-utils-burger"
            isOpen={mobileOpen}
            onClick={toggleMenu}
          />
        </div>
      </div>
    </header>
  );
}
