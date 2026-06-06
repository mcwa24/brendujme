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
import { getBrandLetter, resolveBrandLogoSrc } from "@/lib/brand-logo-resolve";
import type { Brand } from "@/types";
import { cn } from "@/lib/utils";

const LOGO_SIZE = 120;
const PIXELS_PER_SECOND = 52;

interface FeaturedBrandsMarqueeProps {
  brands: Brand[];
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
      className="relative z-20 shrink-0 transition-transform duration-300 hover:scale-[1.04]"
    >
      {showImage && src ? (
        <BrandLogoBox
          src={src}
          alt={`Logo brenda ${brand.name}`}
          size={LOGO_SIZE}
          bare
          className="!border-0 !bg-transparent !p-0"
          onFailed={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-none border border-border bg-background font-display text-4xl font-semibold text-accent/90"
          style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
          role="img"
          aria-label={`Logo brenda ${brand.name}`}
        >
          {getBrandLetter(brand.name)}
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
      className="flex shrink-0 items-center gap-10 sm:gap-14"
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

export function FeaturedBrandsMarquee({ brands }: FeaturedBrandsMarqueeProps) {
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

  return (
    <div className="relative w-full">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent sm:w-24"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-r from-transparent to-background sm:w-24"
        aria-hidden
      />

      <div className="overflow-hidden py-2 motion-reduce:hidden">
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

      <div className="hidden overflow-x-auto py-2 no-scrollbar motion-reduce:block">
        <div className="flex w-max items-center gap-10 sm:gap-14">
          {brands.map((brand) => (
            <MarqueeItem key={brand.slug} brand={brand} />
          ))}
        </div>
      </div>
    </div>
  );
}
