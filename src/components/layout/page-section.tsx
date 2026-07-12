import { cn } from "@/lib/utils";
import {
  PAGE_DETAIL_HERO_PY,
  PAGE_SECTION_PY,
} from "@/components/home/section-spacing";

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Detail hero (brand/prodavac) — isti top offset, više prostora dole. */
  detail?: boolean;
}

/** Ista struktura kao home hero: padding na section, ne na container. */
export function PageSection({
  children,
  className,
  detail = false,
}: PageSectionProps) {
  return (
    <section
      className={cn(detail ? PAGE_DETAIL_HERO_PY : PAGE_SECTION_PY, className)}
    >
      {children}
    </section>
  );
}
