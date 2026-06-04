import Link from "next/link";
import {
  getRetailerDisplayName,
  retailerHasPage,
  retailerPageHref,
} from "@/lib/data/retailer-names";
import { cn } from "@/lib/utils";

interface RetailerLinkProps {
  slug: string;
  /** Podrazumevano ime iz kataloga */
  children?: React.ReactNode;
  className?: string;
}

export function RetailerLink({ slug, children, className }: RetailerLinkProps) {
  const label = children ?? getRetailerDisplayName(slug);

  if (!retailerHasPage(slug)) {
    return <span className={className}>{label}</span>;
  }

  return (
    <Link
      href={retailerPageHref(slug)}
      className={cn("text-accent hover:underline", className)}
    >
      {label}
    </Link>
  );
}
