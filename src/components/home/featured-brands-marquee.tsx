"use client";

import type { CSSProperties } from "react";
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import Link from "next/link";
import { BrandLogoBox } from "@/components/brands/brand-logo-box";
import { getBrandLetter, getBrandLogoDisplayScale, resolveBrandLogoSrc } from "@/lib/brand-logo-resolve";
import type { Brand } from "@/types";
import { cn } from "@/lib/utils";

const LOGO_SIZE = 120;
const PIXELS_PER_SECOND = 52;
const MARQUEE_GAP = "gap-12 sm:gap-16";
const MARQUEE_GAP_PX = "pr-12 sm:pr-16";

interface FeaturedBrandsMarqueeProps {
  brands: Brand[];
  /** Edge-to-edge traka preko cele širine ekrana */
  fullWidth?: boolean;
}

function MarqueeItem({ brand }: { brand: Brand }) {
  const src = useMemo(() => resolveBrandLogoSrc(brand), [brand]);
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <Link
      href={`/brands/${brand.slug}`}
      prefetch={false}
      aria-label={brand.name}
      className="relative z-20 block shrink-0 overflow-hidden transition-transform duration-300 hover:scale-[1.04]"
    >
      {showImage && src ? (
        <BrandLogoBox
          src={src}
          alt={`Logo brenda ${brand.name}`}
          size={LOGO_SIZE}
          displayScale={getBrandLogoDisplayScale(brand.slug)}
          bare
          className="!border-0 !bg-transparent !p-0"
          onFailed={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex items-center justify-center bg-transparent font-display text-4xl font-semibold text-accent/90"
          style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
          role="img"
          aria-label={`Logo brenda ${brand.name}`}
        >
          {getBrandLetter(brand.name, brand.slug)}
        </div>
      )}
    </Link>
  );
}

function MarqueeStrip({
  brands,
  stripId,
  innerRef,
}: {
  brands: Brand[];
  stripId: string;
  innerRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={innerRef}
      className={cn(
        "flex shrink-0 items-center",
        MARQUEE_GAP,
        MARQUEE_GAP_PX
      )}
      aria-hidden={stripId === "clone" ? true : undefined}
    >
      {brands.map((brand, index) => (
        <MarqueeItem key={`${stripId}-${brand.slug}-${index}`} brand={brand} />
      ))}
    </div>
  );
}

/** Dovoljno kopija da traka uvek prekrije široki ekran. */
function buildMarqueeSegment(brands: Brand[]): Brand[] {
  if (brands.length === 0) return [];
  let segment = [...brands];
  while (segment.length < 14) {
    segment = [...segment, ...brands];
  }
  return segment;
}

export function FeaturedBrandsMarquee({
  brands,
  fullWidth = false,
}: FeaturedBrandsMarqueeProps) {
  const segment = useMemo(() => buildMarqueeSegment(brands), [brands]);
  const segmentRef = useRef<HTMLDivElement>(null);
  const [segmentWidth, setSegmentWidth] = useState(0);

  useLayoutEffect(() => {
    const el = segmentRef.current;
    if (!el) return;

    const measure = () => {
      setSegmentWidth(Math.round(el.getBoundingClientRect().width));
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [segment]);

  const duration =
    segmentWidth > 0
      ? Math.max(28, segmentWidth / PIXELS_PER_SECOND)
      : 40;

  const trackStyle = {
    "--marquee-width": `${segmentWidth}px`,
    "--marquee-duration": `${duration}s`,
  } as CSSProperties;

  if (brands.length === 0) return null;

  const fadeWidth = fullWidth ? "w-16 sm:w-32 lg:w-40" : "w-12 sm:w-24";
  const fadeFrom = fullWidth ? "from-card" : "from-background";

  return (
    <div className={cn("relative w-full", fullWidth && "overflow-hidden")}>
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 bg-gradient-to-r to-transparent",
          fadeFrom,
          fadeWidth
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 bg-gradient-to-r from-transparent",
          fullWidth ? "to-card" : "to-background",
          fadeWidth
        )}
        aria-hidden
      />

      <div className="overflow-hidden py-4 motion-reduce:hidden">
        <div
          className={cn(
            "marquee-infinite flex w-max items-center",
            segmentWidth > 0 && "marquee-infinite--ready"
          )}
          style={trackStyle}
        >
          <MarqueeStrip
            brands={segment}
            stripId="primary"
            innerRef={segmentRef}
          />
          <MarqueeStrip brands={segment} stripId="clone" />
        </div>
      </div>

      <div className="hidden overflow-x-auto py-4 no-scrollbar motion-reduce:block">
        <div className={cn("flex w-max items-center", MARQUEE_GAP)}>
          {brands.map((brand) => (
            <MarqueeItem key={brand.slug} brand={brand} />
          ))}
        </div>
      </div>
    </div>
  );
}
