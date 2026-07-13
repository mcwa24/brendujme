import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { RetailerLogo } from "@/components/retailers/retailer-logo";
import { PremiumCard } from "@/components/ui/premium-card";
import { HOME_SECTION_PY, HOME_SECTION_TITLE } from "@/components/home/section-spacing";
import {
  promotionCampaignLabel,
  promotionDisplayTitle,
  promotionOfferLine,
} from "@/lib/data/promotion-display";
import { isHiddenFromHomePromotionsSection } from "@/lib/data/promotions";
import { getPromotionExternalUrl } from "@/lib/data/retailer-serbia-urls";
import type { HomePromotion } from "@/types";

const HOME_PROMOTIONS_LIMIT = 6;

function formatDateRange(start: string, end: string) {
  const fmt = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString("sr-Latn-RS", {
      day: "numeric",
      month: "short",
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

function promotionMetaLine(promo: HomePromotion): string {
  const dates = formatDateRange(promo.startDate, promo.endDate);
  const hasDiscount =
    promo.discountPercent != null && promo.discountPercent > 0;

  if (hasDiscount) {
    return `−${promo.discountPercent}% · ${dates}`;
  }

  return `${promotionCampaignLabel(promo.campaignType)} · ${dates}`;
}

interface HeroPromotionsProps {
  promotions: HomePromotion[];
}

export function HeroPromotions({ promotions }: HeroPromotionsProps) {
  const items = promotions
    .filter((promo) => !isHiddenFromHomePromotionsSection(promo))
    .slice(0, HOME_PROMOTIONS_LIMIT);

  if (!items.length) return null;

  return (
    <section className={HOME_SECTION_PY}>
      <Container narrow>
        <FadeIn>
          <h2 className={HOME_SECTION_TITLE}>Aktuelne akcije</h2>
        </FadeIn>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((promo, i) => (
            <FadeIn key={promo.slug} delay={i * 0.06}>
              <a
                href={getPromotionExternalUrl(promo)}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full"
                aria-label={`${promotionDisplayTitle(promo)} — ${promo.retailerName}, otvori akciju na sajtu prodavca`}
              >
                <PremiumCard className="flex h-full flex-col p-6 md:p-8">
                  <div className="flex items-start justify-between gap-3">
                    <RetailerLogo
                      slug={promo.retailerSlug}
                      name={promo.retailerName}
                      logoUrl={promo.retailerLogoUrl}
                      size="xl"
                      variant="bare"
                    />
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-muted opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent group-hover:opacity-100" />
                  </div>

                  <h3 className="mt-6 font-display text-xl font-semibold tracking-tight transition-colors group-hover:text-accent">
                    {promo.retailerName}
                  </h3>

                  <p className="mt-2 text-sm text-muted">{promotionMetaLine(promo)}</p>

                  <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
                    <span className="font-medium text-foreground">
                      {promotionDisplayTitle(promo)}
                    </span>
                    {promotionOfferLine(promo) ? (
                      <>
                        {" "}
                        — {promotionOfferLine(promo)}
                      </>
                    ) : null}
                  </p>
                </PremiumCard>
              </a>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
