import Link from "next/link";
import { tagChipClassName } from "@/components/ui/tag-chip";
import { cn } from "@/lib/utils";

interface SectionCtaLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
  prefetch?: boolean;
}

/** CTA u zaglavlju sekcije — isti oblik/stil kao tag tab (s-tag). */
export function SectionCtaLink({
  href,
  children,
  className,
  external = false,
  prefetch = false,
}: SectionCtaLinkProps) {
  const wrapClass = cn("s-tags shrink-0", className);
  const tagClass = tagChipClassName();

  if (external) {
    return (
      <span className={wrapClass}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={tagClass}
        >
          {children}
        </a>
      </span>
    );
  }

  return (
    <span className={wrapClass}>
      <Link href={href} prefetch={prefetch} className={tagClass}>
        {children}
      </Link>
    </span>
  );
}
