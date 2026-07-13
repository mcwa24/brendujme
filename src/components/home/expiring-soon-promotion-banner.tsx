import Image from "next/image";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { HOME_SECTION_PY, HOME_SECTION_TITLE } from "@/components/home/section-spacing";
import { tagChipClassName, tagListClassName } from "@/components/ui/tag-chip";
import {
  promotionDisplayTitle,
  promotionOfferLine,
} from "@/lib/data/promotion-display";
import { getPromotionExternalUrl } from "@/lib/data/retailer-serbia-urls";
import type { HomePromotion } from "@/types";

/** Fiksni baner za „Uskoro ističe” — samo tekst akcije se menja. */
const EXPIRING_SOON_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1587802659513-7748a6e21f0c?auto=format&fit=crop&w=1800&q=85";

function formatDateRange(start: string, end: string) {
  const fmt = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString("sr-Latn-RS", {
      day: "numeric",
      month: "short",
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

function expiringSoonHeading(promo: HomePromotion): string {
  const title = promotionDisplayTitle(promo);
  const hasDiscount =
    promo.discountPercent != null && promo.discountPercent > 0;

  if (hasDiscount) {
    return `−${promo.discountPercent}% · ${title}`;
  }

  return title;
}

interface ExpiringSoonPromotionBannerProps {
  promotion: HomePromotion;
}

export function ExpiringSoonPromotionBanner({
  promotion,
}: ExpiringSoonPromotionBannerProps) {
  const offerLine = promotionOfferLine(promotion);
  const dates = formatDateRange(promotion.startDate, promotion.endDate);

  return (
    <section className={HOME_SECTION_PY}>
      <Container>
        <FadeIn>
          <h2 className={HOME_SECTION_TITLE}>Uskoro ističe</h2>
          <p className="mt-3 max-w-xl text-muted">
            Akcija koja najpre završava — ne propusti popust dok traje.
          </p>
        </FadeIn>

        <FadeIn delay={0.08} className="s-home-hero mt-10">
          <div className="s-slide group">
            <a
              href={getPromotionExternalUrl(promotion)}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 z-[3] rounded-[var(--corner-radius-lg)]"
              aria-label={`${promotionDisplayTitle(promotion)} — ${promotion.retailerName}, otvori akciju na sajtu prodavca`}
            />

            <div className="s-slide-image">
              <Image
                src={EXPIRING_SOON_BANNER_IMAGE}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(min-width: 1280px) 1280px, 100vw"
              />
            </div>

            <div className={tagListClassName()}>
              <span className={tagChipClassName()}>{promotion.retailerName}</span>
            </div>

            <div className="s-slide-content pointer-events-none">
              <h3 className="s-slide-heading">{expiringSoonHeading(promotion)}</h3>
              <p className="s-slide-excerpt">{offerLine}</p>
              <p className="s-slide-excerpt">{dates}</p>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
