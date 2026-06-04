"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, MapPin, Phone } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { PremiumCard } from "@/components/ui/premium-card";
import { buttonVariants } from "@/components/ui/button";
import type { RetailerStore } from "@/types";
import { cn } from "@/lib/utils";

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
      <p className="text-muted">
        Nema evidentiranih prodavnica za {retailerName}.
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
          Izaberite grad da vidite adrese prodavnica.
        </p>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">
            {filtered.length}{" "}
            {filtered.length === 1 ? "prodavnica" : "prodavnica"} u gradu{" "}
            {selectedCity}
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {filtered.map((store, i) => (
              <FadeIn key={store.id} delay={i * 0.05}>
                <PremiumCard className="p-6">
                  <h3 className="font-display text-lg font-semibold">
                    {store.name}
                  </h3>
                  <div className="mt-3 space-y-2 text-sm text-muted">
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        {store.address}
                        <br />
                        {store.city}
                      </span>
                    </p>
                    {store.shoppingCenterSlug && (
                      <p>
                        <Link
                          href={`/shopping-centers/${store.shoppingCenterSlug}`}
                          className="text-accent hover:underline"
                        >
                          {store.shoppingCenterName ?? store.shoppingCenterSlug}
                        </Link>
                      </p>
                    )}
                    {store.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0" />
                        <a
                          href={`tel:${store.phone.replace(/\s/g, "")}`}
                          className="hover:text-foreground"
                        >
                          {store.phone}
                        </a>
                      </p>
                    )}
                  </div>
                  {store.storeUrl && (
                    <a
                      href={store.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "mt-4 inline-flex gap-1.5 rounded-full"
                      )}
                    >
                      Detalji na sajtu
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </PremiumCard>
              </FadeIn>
            ))}
          </div>
        </>
      )}
    </>
  );
}
