"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { HOME_SECTION_PY, HOME_SECTION_TITLE } from "@/components/home/section-spacing";
import { getPromotionExternalUrl } from "@/lib/data/retailer-serbia-urls";
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
    <section className={HOME_SECTION_PY}>
      <Container narrow>
        <FadeIn>
          <h2 className={HOME_SECTION_TITLE}>
            Aktuelne akcije
          </h2>
        </FadeIn>
        <FadeIn delay={0.08} className="mt-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promo, index) => {
              const offerLine = promotionOfferLine(promo);
              const hasDiscount =
                promo.discountPercent != null && promo.discountPercent > 0;
              const banner = bannerImages[index];

              return (
                <article
                  key={promo.slug}
                  className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-none shadow-[0_1px_2px_rgb(0_0_0/0.08),0_4px_16px_rgb(0_0_0/0.1)] transition-shadow duration-200 hover:shadow-[0_2px_6px_rgb(0_0_0/0.1),0_8px_24px_rgb(0_0_0/0.14)]"
                >
                  <a
                    href={getPromotionExternalUrl(promo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-[1] cursor-pointer rounded-none"
                    aria-label={`${promo.title} — ${promo.retailerName}, otvori akciju na sajtu prodavca`}
                  />

                  {banner ? (
                    <Image
                      src={banner.imageUrl}
                      alt=""
                      fill
                      className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index === 0}
                    />
                  ) : null}

                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[70%] bg-gradient-to-t from-black/90 via-black/50 to-transparent"
                    aria-hidden
                  />

                  <div className="pointer-events-none relative z-[3] p-4">
                    <div className="[text-shadow:0_1px_2px_rgb(0_0_0/0.95),0_2px_12px_rgb(0_0_0/0.65)]">
                      <Link
                        href={promo.href}
                        className="pointer-events-auto text-[11px] font-bold uppercase tracking-[0.14em] text-white underline-offset-2 transition-opacity hover:underline hover:opacity-90"
                      >
                        {promo.retailerName}
                      </Link>

                      {hasDiscount ? (
                        <p className="font-display mt-1 text-3xl font-black leading-none tracking-tight text-white drop-shadow-[0_2px_4px_rgb(0_0_0/0.8)]">
                          −{promo.discountPercent}%
                        </p>
                      ) : (
                        <p className="font-display mt-1 text-sm font-bold uppercase tracking-wide text-white">
                          {CAMPAIGN_LABELS[promo.campaignType]}
                        </p>
                      )}

                      <p className="font-display mt-2 text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl">
                        {promo.title}
                      </p>

                      <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-white">
                        {offerLine}
                      </p>

                      <p className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-white/95">
                        <Calendar className="h-3.5 w-3.5 shrink-0 drop-shadow-sm" />
                        {formatDateRange(promo.startDate, promo.endDate)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
