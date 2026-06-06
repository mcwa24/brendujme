import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  /** Fiksna visina; ako nije setovano, koristi responsive klase */
  logoHeight?: number;
  logoClassName?: string;
  asLink?: boolean;
}

export function BrandMark({
  className,
  logoHeight,
  logoClassName,
  asLink = true,
}: BrandMarkProps) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/bilbord-logo.png"
      alt="Bilbord Shop"
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
    <span className={cn("inline-flex items-center", className)}>{img}</span>
  );

  if (!asLink) return content;

  return (
    <Link href="/" className="inline-flex transition-opacity hover:opacity-80">
      {content}
    </Link>
  );
}
