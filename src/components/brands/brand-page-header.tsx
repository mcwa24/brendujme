import { ExternalLink, Globe } from "lucide-react";
import { PAGE_LEAD, PAGE_TITLE } from "@/components/home/section-spacing";
import { cn } from "@/lib/utils";

interface BrandPageHeaderProps {
  brand: {
    name: string;
    country: string;
    description: string;
    website?: string | null;
  };
}

export function BrandPageHeader({ brand }: BrandPageHeaderProps) {
  return (
    <header>
      <h1 className={PAGE_TITLE}>{brand.name}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted md:mt-4">
        <span>{brand.country}</span>
        {brand.website ? (
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-accent hover:underline"
          >
            <Globe className="h-4 w-4" />
            Zvanični sajt
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
      <p className={cn(PAGE_LEAD, "max-w-3xl")}>{brand.description}</p>
    </header>
  );
}
