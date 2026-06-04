import { ExternalLink } from "lucide-react";
import type { RetailerCatalogMeta } from "@/lib/data/retailer-catalog-meta";
import { formatBrandCount, formatStoreCount } from "@/lib/format/sr-plural";

interface RetailerCatalogMetaProps {
  meta: RetailerCatalogMeta;
}

export function RetailerCatalogMetaBar({ meta }: RetailerCatalogMetaProps) {
  return (
    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
      <span>
        <strong className="text-foreground">
          {formatBrandCount(meta.brandCount)}
        </strong>{" "}
        u portfoliju
      </span>
      <span>
        <strong className="text-foreground">
          {formatStoreCount(meta.storeCount)}
        </strong>{" "}
        u Srbiji
      </span>
      <span>Ažurirano: {meta.lastSynced}</span>
      <a
        href={meta.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-accent hover:underline"
      >
        Izvor: {meta.sourceLabel}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
