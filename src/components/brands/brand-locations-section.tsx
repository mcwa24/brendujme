"use client";

import { useMemo, useState } from "react";
import { BrandLocationCard } from "@/components/brands/brand-location-card";
import { OFFERING_LABELS } from "@/lib/data/brand-offerings";
import {
  filterLocationsByOfferings,
} from "@/lib/data/enrich-brand";
import type { BrandOfferingSlug, RetailLocation } from "@/types";
import { formatLocationCount } from "@/lib/format/sr-plural";
import { cn } from "@/lib/utils";

interface CityOption {
  city: string;
  count: number;
}

type OfferingFilter = "all" | BrandOfferingSlug;

function buildCityOptions(locations: RetailLocation[]): CityOption[] {
  const counts = new Map<string, number>();
  for (const loc of locations) {
    const city = loc.city.trim();
    if (!city) continue;
    counts.set(city, (counts.get(city) ?? 0) + 1);
  }

  const collator = new Intl.Collator("sr");
  return [...counts.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => {
      if (a.city === "Beograd") return -1;
      if (b.city === "Beograd") return 1;
      return collator.compare(a.city, b.city);
    });
}

function offeringFiltersInLocations(
  locations: RetailLocation[]
): OfferingFilter[] {
  const filters: OfferingFilter[] = ["all"];
  const seen = new Set<BrandOfferingSlug>();
  for (const loc of locations) {
    for (const o of loc.offerings ?? []) {
      if (!seen.has(o)) {
        seen.add(o);
        filters.push(o);
      }
    }
  }
  const order: BrandOfferingSlug[] = [
    "footwear",
    "apparel",
    "sportswear",
    "accessories",
  ];
  return [
    "all",
    ...order.filter((o) => seen.has(o)),
  ];
}

interface BrandLocationsSectionProps {
  brandName: string;
  locations: RetailLocation[];
}

export function BrandLocationsSection({
  brandName,
  locations,
}: BrandLocationsSectionProps) {
  const [offeringFilter, setOfferingFilter] = useState<OfferingFilter>("all");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const byOffering = useMemo(
    () => filterLocationsByOfferings(locations, offeringFilter),
    [locations, offeringFilter]
  );

  const offeringChips = useMemo(
    () => offeringFiltersInLocations(locations),
    [locations]
  );

  const cities = useMemo(() => buildCityOptions(byOffering), [byOffering]);

  const filtered = useMemo(() => {
    if (!selectedCity) return [];
    return byOffering.filter((loc) => loc.city.trim() === selectedCity);
  }, [byOffering, selectedCity]);

  if (locations.length === 0) {
    return (
      <p className="mt-10 text-muted">
        Trenutno nema evidentiranih prodavnica za {brandName} u Srbiji.
      </p>
    );
  }

  return (
    <>
      {offeringChips.length > 2 && (
        <div className="mt-8">
          <p className="text-sm font-medium text-muted">Šta tražite</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {offeringChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setOfferingFilter(chip);
                  setSelectedCity(null);
                }}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  offeringFilter === chip
                    ? "border-accent bg-accent font-medium text-white"
                    : "border-border bg-card text-muted hover:border-accent/40 hover:text-foreground"
                )}
              >
                {chip === "all" ? "Sve" : OFFERING_LABELS[chip]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={cn("mt-8", offeringChips.length <= 2 && "mt-8")}>
        <p className="text-sm font-medium text-muted">Grad</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {cities.map(({ city, count }) => (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                selectedCity === city
                  ? "border-accent bg-accent font-medium text-white"
                  : "border-border bg-card text-muted hover:border-accent/40 hover:text-foreground"
              )}
            >
              {city}
              <span
                className={cn(
                  "ml-1.5 tabular-nums",
                  selectedCity === city ? "text-white/80" : "text-muted"
                )}
              >
                ({count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {!selectedCity ? (
        <p className="mt-10 rounded-[20px] border border-dashed border-border bg-card/50 px-6 py-10 text-center text-muted">
          Izaberite grad da vidite prodavnice i adrese.
          {offeringFilter !== "all" && (
            <>
              {" "}
              Prikaz: {OFFERING_LABELS[offeringFilter].toLowerCase()}.
            </>
          )}
        </p>
      ) : filtered.length === 0 ? (
        <p className="mt-10 text-center text-muted">
          Nema lokacija u gradu {selectedCity} za izabrani tip ponude.
        </p>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">
            {formatLocationCount(filtered.length)} u gradu {selectedCity}
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {filtered.map((loc, i) => (
              <BrandLocationCard
                key={`${loc.id}-${loc.retailerSlug}-${loc.address}`}
                storeName={loc.storeName}
                retailerSlug={loc.retailerSlug}
                address={loc.address}
                city={loc.city}
                offerings={loc.offerings}
                delay={i * 0.05}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
