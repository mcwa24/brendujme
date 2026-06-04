import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  /** Fiksna visina; ako nije setovano, koristi responsive klase */
  logoHeight?: number;
  logoClassName?: string;
  brandsClassName?: string;
  asLink?: boolean;
}

export function BrandMark({
  className,
  logoHeight,
  logoClassName,
  brandsClassName,
  asLink = true,
}: BrandMarkProps) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/bilbord-logo.png"
      alt="Bilbord"
      className={cn(
        "block shrink-0 bg-transparent object-contain",
        logoHeight == null && "h-8 w-auto md:h-9",
        logoClassName
      )}
      style={logoHeight != null ? { height: logoHeight, width: "auto" } : undefined}
      decoding="async"
    />
  );

  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {img}
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
