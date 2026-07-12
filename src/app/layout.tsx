import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { CookieConsentProvider } from "@/components/cookies/cookie-consent-provider";
import { SearchProvider } from "@/components/search/search-provider";
import { golosText, inter } from "@/lib/fonts";
import { baseMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  themeColor: "#F5F7FB",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" className={`${inter.variable} ${golosText.variable}`}>
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}
      >
        <CookieConsentProvider>
          <SearchProvider>
            <ScrollToTop />
            <Header />
            <main id="gh-main" className="s-content gh-main flex-1">
              {children}
            </main>
            <Footer />
          </SearchProvider>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
