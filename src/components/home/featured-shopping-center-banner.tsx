import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { HOME_SECTION_PY, HOME_SECTION_TITLE } from "@/components/home/section-spacing";
import { formatBrandCount } from "@/lib/format/sr-plural";
import { getShoppingCenterImage } from "@/lib/data/shopping-center-images";
import { cn } from "@/lib/utils";
import type { ShoppingCenter } from "@/types";

interface FeaturedShoppingCenterBannerProps {
  centers: ShoppingCenter[];
}

function ShoppingCenterBannerCard({
  center,
  align,
  delay = 0,
}: {
  center: ShoppingCenter;
  align: "left" | "right";
  delay?: number;
}) {
  const image = getShoppingCenterImage(center.slug);
  const coverSrc = image?.coverSrc;
  const href = `/shopping-centers/${center.slug}`;
  const isRight = align === "right";

  return (
    <FadeIn delay={delay}>
      <Link href={href} className="group block h-full">
        <article className="relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-none shadow-[0_1px_2px_rgb(0_0_0/0.08),0_4px_16px_rgb(0_0_0/0.1)] transition-shadow duration-200 hover:shadow-[0_2px_6px_rgb(0_0_0/0.1),0_8px_24px_rgb(0_0_0/0.14)] sm:min-h-[340px] lg:min-h-[380px]">
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={image?.alt ?? center.name}
              fill
              className={cn(
                "object-cover transition-transform duration-300 group-hover:scale-[1.02]",
                isRight ? "object-right" : "object-left"
              )}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900" />
          )}

          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 z-[2] bg-gradient-to-l from-black/95 via-black/55 to-transparent",
              isRight
                ? "right-0 w-[90%] sm:w-[80%]"
                : "left-0 w-[90%] bg-gradient-to-r from-black/95 via-black/55 to-transparent sm:w-[80%]"
            )}
            aria-hidden
          />

          <div
            className={cn(
              "relative z-[3] flex p-5 sm:p-6 lg:p-8",
              isRight ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-md [text-shadow:0_1px_2px_rgb(0_0_0/0.95),0_2px_12px_rgb(0_0_0/0.65)]",
                isRight ? "text-right" : "text-left"
              )}
            >
              <p className="font-display text-2xl font-black leading-none tracking-tight text-white drop-shadow-[0_2px_4px_rgb(0_0_0/0.8)] sm:text-3xl">
                {center.name}
              </p>

              {center.address ? (
                <p className="mt-2 text-sm font-semibold text-white/95 sm:text-base">
                  {center.address}
                </p>
              ) : null}

              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/90 sm:text-base">
                {center.description}
              </p>

              <p className="mt-3 text-sm font-bold text-white/95">
                {formatBrandCount(center.brandCount)} u ponudi
              </p>
            </div>
          </div>
        </article>
      </Link>
    </FadeIn>
  );
}

export function FeaturedShoppingCenterBanner({
  centers,
}: FeaturedShoppingCenterBannerProps) {
  if (!centers.length) return null;

  return (
    <section className={HOME_SECTION_PY}>
      <Container>
        <FadeIn className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className={HOME_SECTION_TITLE}>Najpregledaniji tržni centri</h2>
            <p className="mt-3 max-w-xl text-muted">
              Destinacije koje najčešće otvarate — Galerija i Rajićeva u Beogradu.
            </p>
          </div>
          <Link
            href="/shopping-centers"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            Svi tržni centri
            <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>

        <div className="mt-10 grid gap-4 lg:grid-cols-2 lg:gap-6">
          {centers.map((center, index) => (
            <ShoppingCenterBannerCard
              key={center.slug}
              center={center}
              align={index === 0 ? "left" : "right"}
              delay={0.08 + index * 0.06}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
