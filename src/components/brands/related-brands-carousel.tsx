"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { PremiumCard } from "@/components/ui/premium-card";
import { getCategoryName } from "@/lib/data/categories";
import type { Brand } from "@/types";
import { Button } from "@/components/ui/button";

interface RelatedBrandsCarouselProps {
  brands: Brand[];
}

export function RelatedBrandsCarousel({ brands }: RelatedBrandsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (brands.length === 0) return null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-3xl font-semibold">Srodni brendovi</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => scroll("left")}
            aria-label="Prethodni"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => scroll("right")}
            aria-label="Sledeći"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
      >
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/brands/${brand.slug}`}
            className="w-[260px] shrink-0"
          >
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <PremiumCard className="p-6">
                <BrandLogo name={brand.name} size="md" />
                <h3 className="font-display mt-4 text-xl font-semibold">
                  {brand.name}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {getCategoryName(brand.category)}
                </p>
              </PremiumCard>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
