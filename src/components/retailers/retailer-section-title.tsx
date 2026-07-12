import { RetailerLink } from "@/components/retailers/retailer-link";
import { RetailerLogo } from "@/components/retailers/retailer-logo";

interface RetailerSectionTitleProps {
  retailerSlug: string;
  /** Tekst posle imena prodavca, npr. „prodavnice“ */
  suffix?: string;
}

export function RetailerSectionTitle({
  retailerSlug,
  suffix = "prodavnice",
}: RetailerSectionTitleProps) {
  return (
    <div className="flex items-center gap-3 md:gap-4">
      <RetailerLogo slug={retailerSlug} size="lg" className="rounded-[var(--radius)]" />
      <h2 className="font-display text-3xl font-semibold md:text-4xl">
        <RetailerLink
          slug={retailerSlug}
          className="text-inherit hover:text-accent hover:underline"
        />{" "}
        {suffix}
      </h2>
    </div>
  );
}
