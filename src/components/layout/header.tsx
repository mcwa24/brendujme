"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, Search } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
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

const navItems = [
  { href: "/brands", label: "Brendovi" },
  { href: "/retailers", label: "Prodavci" },
  { href: "/shopping-centers", label: "Tržni centri" },
  { href: "/news", label: "Vesti" },
];

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
        "sticky top-0 z-40",
        retailerDetail
          ? "bg-card"
          : "bg-background/90 backdrop-blur-md"
      )}
    >
      <Container narrow>
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          <BrandMark />

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-accent",
                  pathname.startsWith(item.href)
                    ? "text-accent"
                    : "text-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setOpen(true)}
              aria-label="Pretraga"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Link
              href="/contact?topic=brand"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "hidden rounded-full bg-accent px-4 hover:bg-accent-hover sm:inline-flex"
              )}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Prijavi brend
            </Link>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "rounded-full lg:hidden"
                )}
                aria-label="Meni"
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm rounded-l-[20px]">
                <SheetHeader>
                  <SheetTitle className="text-left font-normal">
                    <BrandMark logoHeight={32} asLink={false} />
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "text-lg font-medium",
                        pathname.startsWith(item.href)
                          ? "text-accent"
                          : "text-muted"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-8 flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="h-12 rounded-full justify-start"
                    onClick={() => {
                      setMobileOpen(false);
                      setOpen(true);
                    }}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Pretraga
                    <kbd className="ml-auto rounded border border-border px-2 text-xs text-muted">
                      ⌘K
                    </kbd>
                  </Button>
                  <Link
                    href="/contact?topic=brand"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-12 rounded-full bg-accent hover:bg-accent-hover"
                    )}
                  >
                    <Plus className="mr-2 h-4 w-4" />
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
