import { getBrandLetter } from "@/lib/brand-logo-resolve";
import { cn } from "@/lib/utils";

interface BrandLogoPlaceholderProps {
  name: string;
  slug?: string;
  variant?: "card" | "compact" | "hero";
  className?: string;
  showName?: boolean;
  /** Nevidljivi okvir iste veličine — katalog brendova */
  uniform?: boolean;
}

export function BrandLogoPlaceholder({
  name,
  slug,
  variant = "card",
  className,
  showName = true,
  uniform = false,
}: BrandLogoPlaceholderProps) {
  const letter = getBrandLetter(name, slug);

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
          "flex shrink-0 flex-col items-center justify-center",
          uniform ? "h-full w-full" : "h-[120px] w-[120px] rounded-[var(--radius)] border border-border bg-secondary",
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
        "flex min-h-[200px] w-full flex-col items-center justify-center rounded-[var(--radius)] border border-border bg-secondary px-6 py-10 text-center",
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
    </div>
  );
}
