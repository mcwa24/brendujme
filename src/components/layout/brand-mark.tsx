import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  logoHeight?: number;
  brandsClassName?: string;
  asLink?: boolean;
}

/**
 * Transparentan crni logo mora stajati na beloj podlozi — inače se ne vidi
 * na tamnoj ili providnoj pozadini headera.
 */
export function BrandMark({
  className,
  logoHeight = 28,
  brandsClassName,
  asLink = true,
}: BrandMarkProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-3 py-2"
        style={{ minHeight: logoHeight + 16 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bilbord-logo.png"
          alt="Bilbord"
          width={Math.round(logoHeight * 4)}
          height={logoHeight}
          className="block h-auto max-h-none w-auto object-contain"
          style={{ height: logoHeight, width: "auto" }}
          decoding="async"
        />
      </span>
      <span
        className={cn(
          "font-sans text-lg font-medium tracking-tight text-[#171717] md:text-xl",
          brandsClassName
        )}
      >
        Brands
      </span>
    </span>
  );

  if (!asLink) return content;

  return (
    <Link href="/" className="inline-flex transition-opacity hover:opacity-80">
      {content}
    </Link>
  );
}
