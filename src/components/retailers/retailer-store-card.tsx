import { MapPin } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { PremiumCard } from "@/components/ui/premium-card";
import { formatBrandLocationTitle } from "@/lib/format/display-text";
import { googleMapsUrl } from "@/lib/maps/google-maps-url";

interface RetailerStoreCardProps {
  name: string;
  address: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  delay?: number;
}

export function RetailerStoreCard({
  name,
  address,
  city,
  latitude,
  longitude,
  delay = 0,
}: RetailerStoreCardProps) {
  const title = formatBrandLocationTitle(name, city);

  return (
    <FadeIn delay={delay}>
      <PremiumCard className="p-6 md:p-8">
        <h3 className="font-display text-lg font-semibold md:text-xl">{title}</h3>
        <div className="mt-2 text-sm text-muted">
          <a
            href={googleMapsUrl({ address, city, latitude, longitude })}
            target="_blank"
            rel="noopener noreferrer"
            className="group/address inline-flex items-start gap-2 transition-colors hover:text-accent"
            aria-label={`${address}, ${city} — otvori u Google Maps`}
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="underline-offset-2 group-hover/address:underline">
              {address} · {city}
            </span>
          </a>
        </div>
      </PremiumCard>
    </FadeIn>
  );
}
