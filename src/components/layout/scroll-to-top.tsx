"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Na svakoj promeni rute skroluje na vrh (bez smooth animacije). */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}
