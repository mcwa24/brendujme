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
  HeaderSearchButton,
} from "@/components/layout/header-icon-button";
import { useSearch } from "@/components/search/search-provider";
import { cn } from "@/lib/utils";

const navItems = [
  { href: BILBORD_SITE_URL, label: "Portal" },
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
          ) : item.href.startsWith("http") ? (
            <a href={item.href} onClick={onNavigate}>
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
  const [isDesktopNav, setIsDesktopNav] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function syncViewport() {
      const desktop = window.innerWidth >= 1024;
      setIsDesktopNav(desktop);
      if (desktop) {
        setMobileOpen(false);
      }
    }

    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

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

        <nav
          className={cn("s-nav", mobileOpen && "s-nav-open")}
          aria-hidden={isDesktopNav || mobileOpen ? "false" : "true"}
        >
          <div className="s-menu-panel">
            <NavMenu onNavigate={closeMenu} />
            <div className="s-utils-account s-utils-account--menu">
              <Link href={BILBORD_CONTACT_URL} className="s-btn" onClick={closeMenu}>
                <span>Prijavi brend</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="s-utils">
          <HeaderSearchButton className="s-utils-search" onClick={openSearch} />
          {!isDesktopNav ? (
            <HeaderBurgerButton
              className="s-utils-burger"
              open={mobileOpen}
              onClick={toggleMenu}
            />
          ) : null}
          <div className="s-utils-account">
            <Link href={BILBORD_CONTACT_URL} className="s-btn">
              <span>Prijavi brend</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
