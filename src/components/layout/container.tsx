import { cn } from "@/lib/utils";

/**
 * Ghost bilbord layout:
 * .gh-outer → padding: 0 max(4vmin, 20px)
 * .gh-inner → max-width: 1320px; margin: 0 auto
 */
export const SITE_MAX_WIDTH = "max-w-[1320px]";
export const SITE_OUTER_PADDING = "px-[max(4vmin,20px)]";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Zadržano radi kompatibilnosti — širina je uvek 1320px kao na bilbord.rs */
  narrow?: boolean;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("w-full", SITE_OUTER_PADDING)}>
      <div className={cn("mx-auto w-full", SITE_MAX_WIDTH, className)}>
        {children}
      </div>
    </div>
  );
}
