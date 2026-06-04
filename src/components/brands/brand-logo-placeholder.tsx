import { getBrandLetter } from "@/lib/brand-logo-resolve";
import { getCategoryName } from "@/lib/data/categories";
import type { CategorySlug } from "@/types";
import { cn } from "@/lib/utils";

interface BrandLogoPlaceholderProps {
  name: string;
  category?: CategorySlug;
  variant?: "card" | "compact" | "hero";
  className?: string;
  showName?: boolean;
  showCategory?: boolean;
}

export function BrandLogoPlaceholder({
  name,
  category,
  variant = "card",
  className,
  showName = true,
  showCategory = true,
}: BrandLogoPlaceholderProps) {
  const letter = getBrandLetter(name);

  if (variant === "hero") {
    return (
      <div className={cn("max-w-3xl", className)}>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-accent sm:text-5xl md:text-6xl lg:text-7xl">
          {name.toUpperCase()}
        </h1>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex h-[120px] w-[120px] shrink-0 flex-col items-center justify-center rounded-[20px] border border-border bg-[#f5f5f3]",
          className
        )}
        aria-label={`Brend ${name}`}
        role="img"
      >
        <span className="font-display text-4xl font-semibold text-accent/90">
          {letter}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[200px] w-full flex-col items-center justify-center rounded-[20px] border border-border bg-[#f5f5f3] px-6 py-10 text-center",
        className
      )}
      aria-label={`Brend ${name}`}
      role="img"
    >
      <span className="font-display text-5xl font-semibold leading-none text-accent/90 md:text-6xl">
        {letter}
      </span>
      {showName && (
        <p className="font-display mt-6 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          {name}
        </p>
      )}
      {showCategory && category && (
        <p className="mt-2 text-sm text-muted">{getCategoryName(category)}</p>
      )}
    </div>
  );
}
