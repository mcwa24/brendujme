import Image from "next/image";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getShoppingCenterImage } from "@/lib/data/shopping-center-images";
import { getStoragePublicUrl } from "@/lib/supabase/storage";

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
  logoUrl?: string | null;
  logoStoragePath?: string | null;
}

export function ShoppingCenterLogo({
  slug,
  name,
  size = "md",
  className,
  variant = "icon",
  logoUrl,
  logoStoragePath,
}: ShoppingCenterLogoProps) {
  const local = getShoppingCenterImage(slug);
  const src =
    local?.src ||
    logoUrl?.trim() ||
    getStoragePublicUrl(logoStoragePath) ||
    null;
  const alt = local?.alt || name;
  const dims = sizeMap[size];

  if (!src) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-[#f0f0ed] text-muted/40",
          variant === "banner" ? "h-40 w-full rounded-t-[20px]" : dims.box,
          className
        )}
        aria-hidden
      >
        <Building2 className="h-1/2 w-1/2" />
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex h-40 items-center justify-center rounded-t-[20px] bg-[#fafaf8] px-8",
          className
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={280}
          height={112}
          className="max-h-24 w-auto max-w-full object-contain"
          sizes="(max-width: 768px) 240px, 280px"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#fafaf8] p-1",
        dims.box,
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={dims.img}
        height={dims.img}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
