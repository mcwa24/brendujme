"use client";

import { useMemo, useState } from "react";
import { BrandLocationCard } from "@/components/brands/brand-location-card";
import type { RetailLocation } from "@/types";
import { cn } from "@/lib/utils";

interface CityOption {
  city: string;
  count: number;
}

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

interface BrandLocationsSectionProps {
  brandName: string;
  locations: RetailLocation[];
}

export function BrandLocationsSection({
  brandName,
  locations,
}: BrandLocationsSectionProps) {
  const cities = useMemo(() => buildCityOptions(locations), [locations]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!selectedCity) return [];
    return locations.filter((loc) => loc.city.trim() === selectedCity);
  }, [locations, selectedCity]);

  if (locations.length === 0) {
    return (
      <p className="mt-10 text-muted">
        Trenutno nema evidentiranih prodavnica za {brandName} u Srbiji.
      </p>
    );
  }

  return (
    <>
      <div className="mt-8">
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
        </p>
      ) : filtered.length === 0 ? (
        <p className="mt-10 text-center text-muted">
          Nema lokacija u gradu {selectedCity}.
        </p>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">
            {filtered.length}{" "}
            {filtered.length === 1 ? "lokacija" : "lokacija"} u gradu{" "}
            {selectedCity}
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {filtered.map((loc, i) => (
              <BrandLocationCard
                key={`${loc.id}-${loc.retailerSlug}-${loc.address}`}
                storeName={loc.storeName}
                retailerSlug={loc.retailerSlug}
                address={loc.address}
                city={loc.city}
                delay={i * 0.05}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
