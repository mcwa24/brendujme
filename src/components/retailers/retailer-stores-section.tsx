"use client";

import { useMemo, useState } from "react";
import { TagChip, tagListClassName } from "@/components/ui/tag-chip";
import { RetailerStoreCard } from "@/components/retailers/retailer-store-card";
import type { RetailerStore } from "@/types";
import { formatRetailerStoreCount } from "@/lib/format/sr-plural";

interface CityOption {
  city: string;
  count: number;
}

function buildCityOptions(stores: RetailerStore[]): CityOption[] {
  const counts = new Map<string, number>();
  for (const store of stores) {
    const city = store.city.trim();
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

interface RetailerStoresSectionProps {
  retailerName: string;
  stores: RetailerStore[];
}

export function RetailerStoresSection({
  retailerName,
  stores,
}: RetailerStoresSectionProps) {
  const cities = useMemo(() => buildCityOptions(stores), [stores]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!selectedCity) return [];
    return stores.filter((s) => s.city.trim() === selectedCity);
  }, [stores, selectedCity]);

  if (stores.length === 0) {
    return (
      <p className="mt-10 text-muted">
        Trenutno nema evidentiranih prodavnica za {retailerName} u Srbiji.
      </p>
    );
  }

  return (
    <>
      <div className="mt-6">
        <p className="text-sm font-medium text-muted">Grad</p>
        <div className={tagListClassName("mt-2")}>
          {cities.map(({ city, count }) => (
            <TagChip
              key={city}
              active={selectedCity === city}
              onClick={() => setSelectedCity(city)}
            >
              {city}
              <span className="s-tag-count">({count})</span>
            </TagChip>
          ))}
        </div>
      </div>

      {!selectedCity ? (
        <p className="mt-10 rounded-[var(--radius)] bg-[var(--color-chip-bg)] px-6 py-10 text-center text-muted">
          Izaberite grad da vidite prodavnice, tržne centre i adrese.
        </p>
      ) : filtered.length === 0 ? (
        <p className="mt-10 text-center text-muted">
          Nema lokacija u gradu {selectedCity}.
        </p>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">
            {formatRetailerStoreCount(filtered.length)} u gradu {selectedCity}
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {filtered.map((store, i) => (
              <RetailerStoreCard
                key={store.id}
                name={store.name}
                address={store.address}
                city={store.city}
                latitude={store.latitude}
                longitude={store.longitude}
                delay={i * 0.05}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
