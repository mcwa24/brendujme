"use client";

import { useMemo, useState } from "react";
import { BrandLocationCard } from "@/components/brands/brand-location-card";
import { BrandMallCard } from "@/components/brands/brand-mall-card";
import { OFFERING_LABELS } from "@/lib/data/brand-offerings";
import { filterLocationsByOfferings } from "@/lib/data/enrich-brand";
import type { BrandOfferingSlug, RetailLocation, ShoppingCenter } from "@/types";
import { formatLocationCount } from "@/lib/format/sr-plural";
import { cn } from "@/lib/utils";

interface CityOption {
  city: string;
  count: number;
}

type OfferingFilter = "all" | BrandOfferingSlug;

function normalizeCity(city: string): string {
  return city.trim();
}

function buildCityOptions(
  locations: RetailLocation[],
  malls: ShoppingCenter[]
): CityOption[] {
  const counts = new Map<string, number>();

  for (const loc of locations) {
    const city = normalizeCity(loc.city);
    if (!city) continue;
    counts.set(city, (counts.get(city) ?? 0) + 1);
  }

  for (const mall of malls) {
    const city = normalizeCity(mall.city);
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
  const seen = new Set<BrandOfferingSlug>();
  for (const loc of locations) {
    for (const o of loc.offerings ?? []) {
      seen.add(o);
    }
  }
  const order: BrandOfferingSlug[] = [
    "footwear",
    "apparel",
    "sportswear",
    "beauty",
    "accessories",
  ];
  return ["all", ...order.filter((o) => seen.has(o))];
}

interface BrandLocationsSectionProps {
  brandName: string;
  locations: RetailLocation[];
  shoppingCenters?: ShoppingCenter[];
}

export function BrandLocationsSection({
  brandName,
  locations,
  shoppingCenters = [],
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

  const cities = useMemo(
    () => buildCityOptions(byOffering, shoppingCenters),
    [byOffering, shoppingCenters]
  );

  const activeCity =
    cities.length === 1 ? cities[0].city : selectedCity;

  const filteredStores = useMemo(() => {
    if (!activeCity) return [];
    return byOffering.filter(
      (loc) => normalizeCity(loc.city) === activeCity
    );
  }, [byOffering, activeCity]);

  const filteredMalls = useMemo(() => {
    if (!activeCity) return [];
    return shoppingCenters.filter(
      (c) => normalizeCity(c.city) === activeCity
    );
  }, [shoppingCenters, activeCity]);

  const totalPlaces =
    locations.length + shoppingCenters.length;

  if (totalPlaces === 0) {
    return (
      <p className="mt-10 text-muted">
        Trenutno nema evidentiranih prodavnica za {brandName} u Srbiji.
      </p>
    );
  }

  const resultCount = filteredStores.length + filteredMalls.length;

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
                  "rounded-none border px-4 py-2 text-sm transition-colors",
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

      <div className="mt-8">
        <p className="text-sm font-medium text-muted">Grad</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {cities.map(({ city, count }) => (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              className={cn(
                "rounded-none border px-4 py-2 text-sm transition-colors",
                activeCity === city
                  ? "border-accent bg-accent font-medium text-white"
                  : "border-border bg-card text-muted hover:border-accent/40 hover:text-foreground"
              )}
            >
              {city}
              <span
                className={cn(
                  "ml-1.5 tabular-nums",
                  activeCity === city ? "text-white/80" : "text-muted"
                )}
              >
                ({count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {!activeCity ? (
        <p className="mt-10 rounded-none border border-dashed border-border bg-card/50 px-6 py-10 text-center text-muted">
          Izaberite grad da vidite prodavnice, tržne centre i adrese.
          {offeringFilter !== "all" && (
            <>
              {" "}
              Prikaz: {OFFERING_LABELS[offeringFilter].toLowerCase()}.
            </>
          )}
        </p>
      ) : resultCount === 0 ? (
        <p className="mt-10 text-center text-muted">
          Nema lokacija u gradu {activeCity} za izabrani tip ponude.
        </p>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">
            {formatLocationCount(resultCount)} u gradu {activeCity}
            {filteredMalls.length > 0 && filteredStores.length > 0 && (
              <>
                {" "}
                ({formatLocationCount(filteredStores.length)} prodavnica
                {filteredMalls.length > 0 &&
                  `, ${formatLocationCount(filteredMalls.length)} tržnih centara`}
                )
              </>
            )}
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {filteredStores.map((loc, i) => (
              <BrandLocationCard
                key={`store-${loc.id}-${loc.retailerSlug}-${loc.address}`}
                storeName={loc.storeName}
                retailerSlug={loc.retailerSlug}
                address={loc.address}
                city={loc.city}
                offerings={loc.offerings}
                delay={i * 0.05}
              />
            ))}
            {filteredMalls.map((center, i) => (
              <BrandMallCard
                key={`mall-${center.slug}`}
                center={center}
                delay={(filteredStores.length + i) * 0.05}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
