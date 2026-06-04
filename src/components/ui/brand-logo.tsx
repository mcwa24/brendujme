import { cn } from "@/lib/utils";

interface BrandLogoProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({ name, className, size = "md" }: BrandLogoProps) {
  const initials = name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const sizeClasses = {
    sm: "h-12 w-12 text-sm",
    md: "h-16 w-16 text-base",
    lg: "h-24 w-24 text-xl",
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[20px] border border-border bg-[#f5f5f3] font-display font-semibold tracking-tight text-accent",
        sizeClasses[size],
        className
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
