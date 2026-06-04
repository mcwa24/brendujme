import Image from "next/image";
import { Store } from "lucide-react";
import { getRetailerDisplayName } from "@/lib/data/retailer-names";
import { resolveRetailerLogoSrc } from "@/lib/retailer-logo-resolve";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { box: "h-8 w-8", img: 32 },
  md: { box: "h-10 w-10", img: 40 },
  lg: { box: "h-12 w-12", img: 48 },
  xl: { box: "h-16 w-16", img: 64 },
  hero: { box: "h-20 w-20 md:h-24 md:w-24", img: 96 },
} as const;

interface RetailerLogoProps {
  slug: string;
  name?: string;
  logoUrl?: string | null;
  size?: keyof typeof sizeMap;
  className?: string;
  /** Stranica prodavca — npr. FCO ikona za Fashion Company */
  variant?: "default" | "page";
}

export function RetailerLogo({
  slug,
  name,
  logoUrl,
  size = "sm",
  className,
  variant = "default",
}: RetailerLogoProps) {
  const displayName = name ?? getRetailerDisplayName(slug);
  const src = resolveRetailerLogoSrc(
    { slug, logoUrl },
    { page: variant === "page" }
  );
  const dims = sizeMap[size];
  const isDarkBadge = variant === "page" && slug === "fashion-company";

  if (!src) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-[#f0f0ed] text-muted/50",
          dims.box,
          className
        )}
        aria-hidden
      >
        <Store className="h-1/2 w-1/2" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg p-1",
        isDarkBadge ? "bg-black" : "bg-[#fafaf8]",
        dims.box,
        className
      )}
    >
      <Image
        src={src}
        alt={`${displayName} logo`}
        width={dims.img}
        height={dims.img}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
