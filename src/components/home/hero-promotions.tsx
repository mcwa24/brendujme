"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { RetailerLogo } from "@/components/retailers/retailer-logo";
import type { PromotionBannerImage } from "@/lib/unsplash/promotion-banners";
import type { HomePromotion, PromotionCampaignType } from "@/types";

function formatDateRange(start: string, end: string) {
  const fmt = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString("sr-Latn-RS", {
      day: "numeric",
      month: "short",
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

const CAMPAIGN_LABELS: Record<PromotionCampaignType, string> = {
  sale: "Akcija",
  seasonal: "Sezonska akcija",
  black_friday: "Black Friday",
  clearance: "Rasprodaja",
  new_collection: "Nova kolekcija",
  collaboration: "Kolaboracija",
  other: "Ponuda",
};

function isMostlyDateRange(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  return /^[\d.\s–\-/]+$/u.test(trimmed) || /^\d{1,2}\.\s*\d{1,2}/.test(trimmed);
}

function promotionOfferLine(promo: HomePromotion): string {
  if (promo.scope?.trim()) return promo.scope.trim();
  if (
    promo.shortDescription?.trim() &&
    !isMostlyDateRange(promo.shortDescription)
  ) {
    return promo.shortDescription.trim();
  }
  return CAMPAIGN_LABELS[promo.campaignType];
}

interface HeroPromotionsProps {
  promotions: HomePromotion[];
  bannerImages?: PromotionBannerImage[];
}

export function HeroPromotions({
  promotions,
  bannerImages = [],
}: HeroPromotionsProps) {
  if (!promotions.length) return null;

  return (
    <div className="mt-8 space-y-3">
      <p className="text-sm font-medium text-muted">Aktuelne akcije</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promo, index) => {
          const offerLine = promotionOfferLine(promo);
          const hasDiscount =
            promo.discountPercent != null && promo.discountPercent > 0;
          const banner = bannerImages[index];

          return (
            <div
              key={promo.slug}
              className="relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-2xl shadow-[0_1px_2px_rgb(0_0_0/0.08),0_4px_16px_rgb(0_0_0/0.1)] transition-shadow duration-200 hover:shadow-[0_2px_6px_rgb(0_0_0/0.1),0_8px_24px_rgb(0_0_0/0.14)]"
            >
              {banner ? (
                <Image
                  src={banner.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={index === 0}
                />
              ) : null}

              <div
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15"
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"
                aria-hidden
              />

              <div className="relative flex flex-1 flex-col justify-between p-4">
                <div className="flex items-start gap-3">
                  <RetailerLogo
                    slug={promo.retailerSlug}
                    name={promo.retailerName}
                    logoUrl={promo.retailerLogoUrl}
                    size="md"
                    className="shrink-0 bg-white/95 shadow-[0_1px_4px_rgb(0_0_0/0.18)] ring-1 ring-white/40"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">
                      {promo.retailerName}
                    </p>

                    {hasDiscount ? (
                      <p className="font-display mt-1 text-2xl font-bold leading-none tracking-tight text-white">
                        −{promo.discountPercent}%
                      </p>
                    ) : (
                      <p className="font-display mt-1 text-sm font-semibold uppercase tracking-wide text-white/80">
                        {CAMPAIGN_LABELS[promo.campaignType]}
                      </p>
                    )}

                    <p className="font-display mt-2 text-lg font-semibold leading-snug tracking-tight text-white sm:text-xl">
                      {promo.title}
                    </p>

                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/85">
                      {offerLine}
                    </p>

                    <p className="mt-2.5 flex items-center gap-1.5 text-xs text-white/65">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      {formatDateRange(promo.startDate, promo.endDate)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={promo.href}
                    className="flex-1 rounded-full border border-white/25 bg-white/10 px-3 py-2 text-center text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    Prodavac
                  </Link>
                  <a
                    href={promo.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-semibold text-zinc-900 shadow-[0_1px_3px_rgb(0_0_0/0.2)] transition-opacity hover:opacity-95"
                  >
                    Akcija
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>

                {banner?.photographerName && banner.unsplashPageUrl ? (
                  <p className="mt-2 text-[10px] text-white/45">
                    Foto:{" "}
                    <a
                      href={banner.unsplashPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-2 hover:text-white/70 hover:underline"
                    >
                      {banner.photographerName}
                    </a>{" "}
                    / Unsplash
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
