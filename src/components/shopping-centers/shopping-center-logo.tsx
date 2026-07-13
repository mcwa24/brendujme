import Image from "next/image";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getShoppingCenterImage } from "@/lib/data/shopping-center-images";

const sizeMap = {
  sm: { box: "h-8 w-8", img: 32 },
  md: { box: "h-10 w-10", img: 40 },
  tab: { box: "h-9 w-9", img: 36 },
  lg: { box: "h-16 w-16", img: 64 },
  xl: { box: "h-24 w-24", img: 96 },
  hero: { box: "h-28 w-full max-w-[280px]", img: 112 },
} as const;

interface ShoppingCenterLogoProps {
  slug: string;
  name: string;
  size?: keyof typeof sizeMap;
  className?: string;
  variant?: "icon" | "banner";
  /** Bez okvira i pozadine — samo ikonica */
  bare?: boolean;
}

export function ShoppingCenterLogo({
  slug,
  name,
  size = "md",
  className,
  variant = "icon",
  bare = false,
}: ShoppingCenterLogoProps) {
  const local = getShoppingCenterImage(slug);
  const alt = local?.alt || name;
  const dims = sizeMap[size];

  if (variant === "banner") {
    const coverSrc = local?.coverSrc;

    if (coverSrc) {
      return (
        <div
          className={cn(
            "relative aspect-[16/9] overflow-hidden bg-secondary",
            className
          )}
        >
          <Image
            src={coverSrc}
            alt={alt}
            fill
            className="shopping-center-banner-img rounded-none object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex aspect-[16/9] items-center justify-center bg-accent/90",
          className
        )}
      >
        <span className="font-display px-4 text-center text-lg text-white/90 md:text-xl">
          {name}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[var(--radius)] bg-secondary text-muted/40",
        bare ? "bg-transparent" : "",
        dims.box,
        className
      )}
      aria-hidden
    >
      <Building2 className="h-1/2 w-1/2" />
    </div>
  );
}
