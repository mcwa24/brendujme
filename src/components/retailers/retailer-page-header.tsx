import { RetailerLogo } from "@/components/retailers/retailer-logo";
import type { Retailer } from "@/types";

interface RetailerPageHeaderProps {
  retailer: Retailer;
  children?: React.ReactNode;
}

export function RetailerPageHeader({ retailer, children }: RetailerPageHeaderProps) {
  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
      <RetailerLogo
        slug={retailer.slug}
        name={retailer.name}
        logoUrl={retailer.logoUrl}
        size="hero"
        variant="page"
        className="rounded-[var(--radius)]"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium uppercase tracking-wider text-muted">
          Prodavac
        </p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight md:text-6xl">
          {retailer.name}
        </h1>
        {children}
      </div>
    </div>
  );
}
