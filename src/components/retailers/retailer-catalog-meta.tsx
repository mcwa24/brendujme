import type { RetailerCatalogMeta } from "@/lib/data/retailer-catalog-meta";
import { formatModniBrandCount, formatStoreCount } from "@/lib/format/sr-plural";

interface RetailerCatalogMetaProps {
  meta: RetailerCatalogMeta;
  brandCount: number;
}

export function RetailerCatalogMetaBar({
  meta,
  brandCount,
}: RetailerCatalogMetaProps) {
  return (
    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
      <span>
        <strong className="text-foreground">
          {formatModniBrandCount(brandCount)}
        </strong>{" "}
        u ponudi
      </span>
      <span>
        <strong className="text-foreground">
          {formatStoreCount(meta.storeCount)}
        </strong>{" "}
        u Srbiji
      </span>
    </div>
  );
}
