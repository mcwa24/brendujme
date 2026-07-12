import { cn } from "@/lib/utils";
import {
  PAGE_DETAIL_PB,
  PAGE_SECTION_CLASS,
  PAGE_SECTION_PB,
} from "@/components/home/section-spacing";

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Detail hero (brand/prodavac) — isti top offset, više prostora dole. */
  detail?: boolean;
}

/** Ghost page wrapper — padding-top preko .s-page-section. */
export function PageSection({
  children,
  className,
  detail = false,
}: PageSectionProps) {
  return (
    <section
      className={cn(
        PAGE_SECTION_CLASS,
        detail ? PAGE_DETAIL_PB : PAGE_SECTION_PB,
        className
      )}
    >
      {children}
    </section>
  );
}
