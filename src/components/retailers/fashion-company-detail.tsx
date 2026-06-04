"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, MapPin, Search } from "lucide-react";
import { BrandCard } from "@/components/brands/brand-card";
import { PremiumCard } from "@/components/ui/premium-card";
import { Input } from "@/components/ui/input";
import {
  fashionCompanyBrands,
  fashionCompanyMeta,
  fashionCompanyStores,
  getFashionCompanyStoresByCity,
  type FashionCompanyStore,
} from "@/lib/data/fashion-company";
import {
  fashionAndFriendsBrands,
  fashionAndFriendsMeta,
  fashionAndFriendsStores,
  isFashionAndFriendsMultibrandStore,
} from "@/lib/data/fashion-and-friends";
import { getBrandBySlug } from "@/lib/data/brands";
import {
  bilbordSlugFromBrandName,
  bilbordSlugFromFfSlug,
} from "@/lib/data/ff-brand-slugs";
import { Badge } from "@/components/ui/badge";

export function FashionCompanyDetail() {
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string | "all">("all");

  const brandsInApp = useMemo(
    () =>
      fashionCompanyBrands
        .map((b) => {
          const slug =
            b.slug ?? bilbordSlugFromBrandName(b.name);
          return slug ? getBrandBySlug(slug) : undefined;
        })
        .filter(Boolean),
    []
  );

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    return fashionCompanyStores.filter((store) => {
      if (brandFilter !== "all" && store.brandName !== brandFilter) return false;
      if (!q) return true;
      return (
        store.storeName.toLowerCase().includes(q) ||
        store.brandName.toLowerCase().includes(q) ||
        store.address.toLowerCase().includes(q) ||
        store.cityLabel.toLowerCase().includes(q) ||
        (store.shoppingCenter?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [query, brandFilter]);

  const storesByCity = useMemo(() => {
    const grouped: Record<string, FashionCompanyStore[]> = {};
    for (const store of filteredStores) {
      if (!grouped[store.cityLabel]) grouped[store.cityLabel] = [];
      grouped[store.cityLabel].push(store);
    }
    return grouped;
  }, [filteredStores]);

  const uniqueBrandNames = useMemo(
    () =>
      [...new Set(fashionCompanyStores.map((s) => s.brandName))].sort((a, b) =>
        a.localeCompare(b, "sr")
      ),
    []
  );

  const fullGrouped = getFashionCompanyStoresByCity();

  return (
    <div className="space-y-16">
      <div className="flex flex-wrap gap-4 text-sm text-muted">
        <span>
          <strong className="text-foreground">{fashionCompanyMeta.brandCount}</strong>{" "}
          brendova u portfoliju
        </span>
        <span>
          <strong className="text-foreground">{fashionCompanyMeta.storeCount}</strong>{" "}
          prodajnih mesta u Srbiji
        </span>
        <span>
          Ažurirano: {fashionCompanyMeta.lastSynced}
        </span>
        <a
          href={fashionCompanyMeta.brandsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-accent hover:underline"
        >
          Izvor: fashioncompany.rs
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <section>
        <h2 className="font-display text-2xl font-semibold md:text-3xl">
          Portfolio brendova
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Brendovi koje Fashion Company zastupa u Srbiji — prema zvaničnom sajtu.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {fashionCompanyBrands.map((brand) => {
            const slug =
              brand.slug ?? bilbordSlugFromBrandName(brand.name);
            const inDirectory = slug && getBrandBySlug(slug);
            if (inDirectory) {
              return (
                <Link key={brand.name} href={`/brands/${slug}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer rounded-full px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
                  >
                    {brand.name}
                  </Badge>
                </Link>
              );
            }
            return (
              <Badge
                key={brand.name}
                variant="outline"
                className="rounded-full px-3 py-1.5 text-sm text-muted"
              >
                {brand.name}
              </Badge>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold md:text-3xl">
          Fashion&amp;Friends — kompletan katalog
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Multibrand koncept Fashion Company —{" "}
          <strong className="text-foreground">
            {fashionAndFriendsMeta.brandCount} brendova
          </strong>{" "}
          preuzeto sa zvanične F&amp;F stranice brendova. U radnjama Fashion&amp;Friends
          dostupna je većina ovog portfolija (pored mono-brand prodavnica u istim centrima).
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
          <span>
            Ažurirano: {fashionAndFriendsMeta.lastSynced}
          </span>
          <a
            href={fashionAndFriendsMeta.brandsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent hover:underline"
          >
            Izvor: fashionandfriends.com/rs/brendovi
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {fashionAndFriendsBrands.map((brand) => {
            const slug = bilbordSlugFromFfSlug(brand.ffSlug);
            const inDirectory = Boolean(getBrandBySlug(slug));
            if (inDirectory) {
              return (
                <Link key={brand.ffSlug} href={`/brands/${slug}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer rounded-full px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
                  >
                    {brand.name}
                  </Badge>
                </Link>
              );
            }
            return (
              <a
                key={brand.ffSlug}
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Badge
                  variant="outline"
                  className="cursor-pointer rounded-full px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-accent"
                >
                  {brand.name}
                </Badge>
              </a>
            );
          })}
        </div>

        <h3 className="mt-10 font-display text-xl font-semibold">
          Fashion&amp;Friends prodavnice
        </h3>
        <p className="mt-2 text-sm text-muted">
          {fashionAndFriendsStores.length} dokumentovanih multibrand lokacija u Srbiji.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {fashionAndFriendsStores.map((store) => (
            <PremiumCard key={store.id} className="p-5">
              <h4 className="font-medium text-foreground">{store.name}</h4>
              <div className="mt-3 space-y-1 text-sm text-muted">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {store.address}
                </p>
                <p>{store.cityLabel}</p>
                {store.shoppingCenter && store.shoppingCenterSlug ? (
                  <Link
                    href={`/shopping-centers/${store.shoppingCenterSlug}`}
                    className="hover:text-accent hover:underline"
                  >
                    {store.shoppingCenter}
                  </Link>
                ) : (
                  store.shoppingCenter && <p>{store.shoppingCenter}</p>
                )}
              </div>
              <p className="mt-4 text-xs text-muted">
                +{fashionAndFriendsMeta.brandCount} brendova u ponudi (online katalog)
              </p>
            </PremiumCard>
          ))}
        </div>
      </section>

      {brandsInApp.length > 0 && (
        <section>
          <h2 className="font-display text-2xl font-semibold md:text-3xl">
            U našem direktorijumu
          </h2>
          <p className="mt-2 text-muted">
            Brendovi iz FC portfolija sa profilom na Bilbord Brands.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brandsInApp.map(
              (brand) =>
                brand && <BrandCard key={brand.slug} brand={brand} variant="compact" />
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-2xl font-semibold md:text-3xl">
          Gde se šta prodaje
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Pregled mono-brand i multibrand prodavnica (Fashion&Friends, Bata, itd.)
          po gradovima. Podaci iz loyalty programa i najnovijih vesti kompanije.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pretraži prodavnicu, brend, adresu..."
              className="h-12 rounded-full pl-11"
            />
          </div>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="h-12 rounded-full border border-border bg-card px-4 text-sm"
            aria-label="Filter po brendu"
          >
            <option value="all">Svi brendovi</option>
            {uniqueBrandNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <p className="mt-4 text-sm text-muted">
          {filteredStores.length} prodajnih mesta
          {filteredStores.length !== fashionCompanyStores.length &&
            ` (od ${fashionCompanyStores.length})`}
        </p>

        <div className="mt-8 space-y-10">
          {Object.keys(storesByCity).length === 0 && (
            <p className="text-center text-muted">Nema rezultata za izabrane filtere.</p>
          )}
          {Object.entries(storesByCity)
            .sort(([a], [b]) => a.localeCompare(b, "sr"))
            .map(([city, stores]) => (
              <div key={city}>
                <h3 className="font-display text-xl font-semibold">{city}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {stores.map((store) => (
                    <StoreCard key={store.id} store={store} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </section>

      <section className="rounded-[20px] border border-border bg-[#fafaf8] p-6 text-sm text-muted">
        <p>
          <strong className="text-foreground">Napomena:</strong> Kompletna mreža Fashion
          Company obuhvata 148+ maloprodajnih objekata u Srbiji i regionu. Ova lista
          obuhvata dokumentovana prodajna mesta sa{" "}
          <a
            href={fashionCompanyMeta.storesUrl}
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            loyalty programa
          </a>{" "}
          ({Object.keys(fullGrouped).length} grada) plus novootvorene lokacije (Galerija,
          Ušće). Za najnovije informacije posetite{" "}
          <a
            href={fashionCompanyMeta.website}
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            fashioncompany.rs
          </a>
          .
        </p>
        <p className="mt-3">
          Sedište: {fashionCompanyMeta.headquarters} · Tel: {fashionCompanyMeta.phone}
        </p>
      </section>
    </div>
  );
}

function StoreCard({ store }: { store: FashionCompanyStore }) {
  const isFfMultibrand = isFashionAndFriendsMultibrandStore(store.storeName);

  return (
    <PremiumCard className="p-5">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-foreground">{store.storeName}</h4>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {isFfMultibrand && (
            <Badge variant="outline" className="text-xs">
              F&amp;F multibrand
            </Badge>
          )}
          {store.source === "news" && (
            <Badge variant="outline" className="text-xs">
              Novo
            </Badge>
          )}
        </div>
      </div>
      <p className="mt-1 text-sm font-medium text-accent">
        {isFfMultibrand ? "Fashion&Friends" : store.brandName}
      </p>
      {isFfMultibrand && (
        <p className="mt-2 text-xs text-muted">
          Ponuda: {fashionAndFriendsMeta.brandCount}+ brendova (Replay, Diesel, BOSS,
          Liu Jo, KIKO, UGG…).{" "}
          <a
            href={fashionAndFriendsMeta.brandsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Pogledaj katalog
          </a>
        </p>
      )}
      <div className="mt-3 space-y-1 text-sm text-muted">
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          {store.address}
        </p>
        {store.shoppingCenter && (
          <p>
            {store.shoppingCenterSlug ? (
              <Link
                href={`/shopping-centers/${store.shoppingCenterSlug}`}
                className="hover:text-accent hover:underline"
              >
                {store.shoppingCenter}
              </Link>
            ) : (
              store.shoppingCenter
            )}
          </p>
        )}
      </div>
      {store.brandSlug && (
        <Link
          href={`/brands/${store.brandSlug}`}
          className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
        >
          Profil brenda →
        </Link>
      )}
    </PremiumCard>
  );
}
