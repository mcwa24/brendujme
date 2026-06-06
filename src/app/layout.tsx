import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { SearchProvider } from "@/components/search/search-provider";
import { inter } from "@/lib/fonts";
import { baseMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" className={inter.variable}>
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}
      >
        <SearchProvider>
          <ScrollToTop />
          <Header />
          <main id="gh-main" className="gh-main flex-1">
            {children}
          </main>
          <Footer />
        </SearchProvider>
      </body>
    </html>
  );
}
