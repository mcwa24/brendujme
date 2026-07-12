"use client";

import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { HOME_SECTION_PY, HOME_SECTION_TITLE } from "@/components/home/section-spacing";
import {
  formatPromotionExpiryUrgency,
} from "@/lib/data/promotions";
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

interface ExpiringSoonPromotionBannerProps {
  promotion: HomePromotion;
  bannerImage?: PromotionBannerImage;
}

export function ExpiringSoonPromotionBanner({
  promotion,
  bannerImage,
}: ExpiringSoonPromotionBannerProps) {
  const offerLine = promotionOfferLine(promotion);
  const hasDiscount =
    promotion.discountPercent != null && promotion.discountPercent > 0;
  const imageUrl = promotion.bannerImageUrl ?? bannerImage?.imageUrl;
  const urgency = formatPromotionExpiryUrgency(promotion.endDate);

  return (
    <section className={HOME_SECTION_PY}>
      <Container>
        <FadeIn>
          <h2 className={HOME_SECTION_TITLE}>Uskoro ističe</h2>
          <p className="mt-3 max-w-xl text-muted">
            Akcija koja najpre završava — ne propusti popust dok traje.
          </p>
        </FadeIn>

        <FadeIn delay={0.08} className="mt-10">
          <article className="group relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-[var(--radius)] shadow-[0_1px_2px_rgb(0_0_0/0.08),0_4px_16px_rgb(0_0_0/0.1)] transition-shadow duration-200 hover:shadow-[0_2px_6px_rgb(0_0_0/0.1),0_8px_24px_rgb(0_0_0/0.14)] sm:min-h-[380px] lg:min-h-[420px]">
            <a
              href={getPromotionExternalUrl(promotion)}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 z-[1] cursor-pointer rounded-[var(--radius)]"
              aria-label={`${promotion.title} — ${promotion.retailerName}, otvori akciju na sajtu prodavca`}
            />

            {imageUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.02]"
                style={{ backgroundImage: `url("${imageUrl}")` }}
                role="presentation"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900" />
            )}

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[75%] bg-gradient-to-t from-black/95 via-black/55 to-transparent"
              aria-hidden
            />

            <div className="pointer-events-none relative z-[3] p-6 sm:p-8 lg:p-10">
              <div className="[text-shadow:0_1px_2px_rgb(0_0_0/0.95),0_2px_12px_rgb(0_0_0/0.65)]">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-black">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {urgency}
                  </span>
                  <Link
                    href={promotion.href}
                    className="pointer-events-auto text-[11px] font-bold uppercase tracking-[0.14em] text-white underline-offset-2 transition-opacity hover:underline hover:opacity-90"
                  >
                    {promotion.retailerName}
                  </Link>
                </div>

                {hasDiscount ? (
                  <p className="font-display mt-4 text-4xl font-black leading-none tracking-tight text-white drop-shadow-[0_2px_4px_rgb(0_0_0/0.8)] sm:text-5xl lg:text-6xl">
                    −{promotion.discountPercent}%
                  </p>
                ) : (
                  <p className="font-display mt-4 text-sm font-bold uppercase tracking-wide text-white sm:text-base">
                    {CAMPAIGN_LABELS[promotion.campaignType]}
                  </p>
                )}

                <p className="font-display mt-3 max-w-4xl text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {promotion.title}
                </p>

                <p className="mt-3 max-w-3xl text-base font-semibold leading-snug text-white sm:text-lg">
                  {offerLine}
                </p>

                <p className="mt-4 flex items-center gap-1.5 text-sm font-bold text-white/95">
                  <Calendar className="h-4 w-4 shrink-0 drop-shadow-sm" />
                  {formatDateRange(promotion.startDate, promotion.endDate)}
                </p>
              </div>
            </div>
          </article>
        </FadeIn>
      </Container>
    </section>
  );
}
