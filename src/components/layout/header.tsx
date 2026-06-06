"use client";

import Link from "next/link";
import { BILBORD_CONTACT_URL } from "@/lib/bilbord";
import { BILBORD_MODA_STIL_URL } from "@/lib/news/urls";
import { inter } from "@/lib/fonts";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { HeaderSearchButton } from "@/components/layout/header-icon-button";
import { Container } from "@/components/layout/container";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSearch } from "@/components/search/search-provider";
import { cn } from "@/lib/utils";

const navLinkClass =
  "text-[15px] font-[550] leading-6 text-foreground no-underline transition-opacity hover:opacity-80";

const navItems = [
  { href: "/brands", label: "Brendovi" },
  { href: "/retailers", label: "Prodavci" },
  { href: "/shopping-centers", label: "Tržni centri" },
  { href: BILBORD_MODA_STIL_URL, label: "Vesti", external: true },
] as const;

function isRetailerDetailPath(pathname: string): boolean {
  return /^\/retailers\/[^/]+$/.test(pathname);
}

export function Header() {
  const pathname = usePathname();
  const { setOpen } = useSearch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const retailerDetail = isRetailerDetailPath(pathname);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background",
        retailerDetail && "bg-background"
      )}
    >
      <Container narrow>
        {/*
          Ghost bilbord .gh-navigation.is-left-logo:
          grid auto 1fr auto — logo | meni (odmah pored) | akcije
        */}
        <div
          className={cn(
            "grid h-16 grid-cols-[auto_1fr_auto] items-center gap-x-6 md:h-[100px]",
            inter.className
          )}
        >
          <div className="flex min-w-0 items-center gap-4">
            <BrandMark />
            <HeaderSearchButton
              className="md:hidden"
              onClick={() => setOpen(true)}
            />
          </div>

          <nav className="hidden min-w-0 items-center gap-7 pl-4 min-[992px]:mr-[100px] lg:flex">
            {navItems.map((item) =>
              "external" in item && item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={navLinkClass}
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={item.href} className={navLinkClass}>
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center justify-end gap-6">
            <HeaderSearchButton
              className="hidden md:inline-flex"
              onClick={() => setOpen(true)}
            />
            <Link
              href={BILBORD_CONTACT_URL}
              className={cn(
                buttonVariants({ variant: "default" }),
                "hidden bg-accent hover:bg-accent-hover hover:opacity-100 sm:inline-flex"
              )}
            >
              Prijavi brend
            </Link>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "lg:hidden"
                )}
                aria-label="Meni"
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm rounded-none">
                <SheetHeader>
                  <SheetTitle className="text-left font-normal">
                    <BrandMark logoHeight={40} asLink={false} />
                  </SheetTitle>
                </SheetHeader>
                <nav
                  className={cn(
                    "mt-8 flex flex-col gap-5",
                    inter.className
                  )}
                >
                  {navItems.map((item) =>
                    "external" in item && item.external ? (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileOpen(false)}
                        className="text-[1.75rem] font-semibold leading-[1.4] text-foreground no-underline transition-opacity hover:opacity-80"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="text-[1.75rem] font-semibold leading-[1.4] text-foreground no-underline transition-opacity hover:opacity-80"
                      >
                        {item.label}
                      </Link>
                    )
                  )}
                </nav>
                <div className="mt-8 flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setMobileOpen(false);
                      setOpen(true);
                    }}
                  >
                    <Search className="h-4 w-4" />
                    Pretraga
                    <kbd className="ml-auto border border-border px-2 text-xs text-muted">
                      ⌘K
                    </kbd>
                  </Button>
                  <Link
                    href={BILBORD_CONTACT_URL}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      buttonVariants(),
                      "w-full bg-accent hover:bg-accent-hover hover:opacity-100"
                    )}
                  >
                    Prijavi brend
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </header>
  );
}
