"use client";

import Link from "next/link";
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
  { href: BILBORD_SITE_URL, label: "Portal", external: true },
  { href: "/brands", label: "Brendovi" },
  { href: "/retailers", label: "Prodavci" },
  { href: "/shopping-centers", label: "Tržni centri" },
  { href: BILBORD_MODA_STIL_URL, label: "Vesti", external: true },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="nav">
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
    if (mobileOpen) {
      document.documentElement.style.overflowY = "hidden";
    } else {
      document.documentElement.style.overflowY = "";
    }
    return () => {
      document.documentElement.style.overflowY = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const items = document.querySelectorAll("#gh-navigation .nav li");
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    items.forEach((item, index) => {
      const el = item as HTMLElement;
      if (mobileOpen && isMobile) {
        el.style.transitionDelay = `${0.03 * (index + 1)}s`;
      } else {
        el.style.transitionDelay = "";
      }
    });
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);
  const toggleMenu = () => setMobileOpen((open) => !open);

  return (
    <header
      id="gh-navigation"
      className={cn("gh-navigation gh-outer is-left-logo z-40", mobileOpen && "is-open")}
    >
      <div className="gh-navigation-inner gh-inner">
        <div className="gh-navigation-brand">
          <Link href="/" className="gh-navigation-logo" suppressHydrationWarning>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/bilbord-logo.png"
              alt="Bilbord Shop"
              decoding="async"
            />
          </Link>
          <HeaderSearchButton
            className="gh-search gh-icon-button"
            onClick={() => {
              closeMenu();
              setOpen(true);
            }}
          />
          <HeaderBurgerButton isOpen={mobileOpen} onClick={toggleMenu} />
        </div>

        <nav className="gh-navigation-menu">
          <NavLinks onNavigate={closeMenu} />
        </nav>

        <div className="gh-navigation-actions">
          <HeaderSearchButton
            className="gh-search gh-icon-button"
            onClick={() => setOpen(true)}
          />
          <Link href={BILBORD_CONTACT_URL} className="gh-button">
            Prijavi brend
          </Link>
        </div>
      </div>
    </header>
  );
}
