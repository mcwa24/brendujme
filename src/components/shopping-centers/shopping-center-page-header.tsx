import { ExternalLink, Globe, MapPin } from "lucide-react";
import { PAGE_LEAD, PAGE_TITLE } from "@/components/home/section-spacing";
import { cn } from "@/lib/utils";

interface ShoppingCenterPageHeaderProps {
  name: string;
  city: string;
  address?: string | null;
  description: string;
  mapsHref?: string | null;
  brandCountLabel?: string;
}

export function ShoppingCenterPageHeader({
  name,
  city,
  address,
  description,
  mapsHref,
  brandCountLabel,
}: ShoppingCenterPageHeaderProps) {
  return (
    <header>
      <h1 className={PAGE_TITLE}>{name}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted md:mt-4">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0" />
          {address ? (
            <>
              {address}
              <span aria-hidden="true"> · </span>
              {city}
            </>
          ) : (
            city
          )}
        </span>
        {mapsHref ? (
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-accent hover:underline"
          >
            <Globe className="h-4 w-4" />
            Google Maps
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
        {brandCountLabel ? (
          <span className="font-medium text-success">{brandCountLabel}</span>
        ) : null}
      </div>
      <p className={cn(PAGE_LEAD, "max-w-3xl")}>{description}</p>
    </header>
  );
}
