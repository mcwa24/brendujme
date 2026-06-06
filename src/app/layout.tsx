import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { SearchProvider } from "@/components/search/search-provider";
import { baseMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" className={GeistSans.variable}>
      <body className={`${GeistSans.className} min-h-screen antialiased`}>
        <SearchProvider>
          <ScrollToTop />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SearchProvider>
      </body>
    </html>
  );
}
