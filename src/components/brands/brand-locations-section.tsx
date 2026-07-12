"use client";

import { useMemo, useState } from "react";
import { TagChip, tagListClassName } from "@/components/ui/tag-chip";
import { BrandLocationCard } from "@/components/brands/brand-location-card";
import { BrandMallCard } from "@/components/brands/brand-mall-card";
import { OFFERING_LABELS } from "@/lib/data/brand-offerings";
import { filterLocationsByOfferings } from "@/lib/data/enrich-brand";
import type { BrandOfferingSlug, RetailLocation, ShoppingCenter } from "@/types";
import { formatLocationCount } from "@/lib/format/sr-plural";

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
        <div className="mt-6">
          <p className="text-sm font-medium text-muted">Šta tražite</p>
          <div className={tagListClassName("mt-2")}>
            {offeringChips.map((chip) => (
              <TagChip
                key={chip}
                active={offeringFilter === chip}
                onClick={() => {
                  setOfferingFilter(chip);
                  setSelectedCity(null);
                }}
              >
                {chip === "all" ? "Sve" : OFFERING_LABELS[chip]}
              </TagChip>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <p className="text-sm font-medium text-muted">Grad</p>
        <div className={tagListClassName("mt-2")}>
          {cities.map(({ city, count }) => (
            <TagChip
              key={city}
              active={activeCity === city}
              onClick={() => setSelectedCity(city)}
            >
              {city}
              <span className="s-tag-count">({count})</span>
            </TagChip>
          ))}
        </div>
      </div>

      {!activeCity ? (
        <p className="mt-10 rounded-[var(--radius)] bg-[var(--color-chip-bg)] px-6 py-10 text-center text-muted">
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
