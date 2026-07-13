"use client";

import Image from "next/image";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { HOME_HERO_SECTION_PB } from "@/components/home/section-spacing";
import { tagChipClassName, tagListClassName } from "@/components/ui/tag-chip";
import { cn } from "@/lib/utils";
import type { HomeStats } from "@/lib/data/repository";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1555529733-ba28d9c4587c?auto=format&fit=crop&w=1800&q=80";

const HERO_EXCERPT =
  "Pronađite modne brendove i prodavce, uporedite ponude i pratite aktuelne akcije na jednom mestu u Srbiji.";

interface HeroSectionProps {
  stats: HomeStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className={cn("s-home-hero pt-3", HOME_HERO_SECTION_PB)}>
      <Container>
        <FadeIn when="mount">
          <div className="s-slide">
            <div className="s-slide-image">
              <Image
                src={HERO_IMAGE}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(min-width: 1280px) 1280px, 100vw"
                priority
              />
            </div>

            <div className={tagListClassName("s-home-hero-tags")}>
              <span className={tagChipClassName()}>Bilbord shop</span>
            </div>

            <div className="s-slide-content">
              <h1 className="s-slide-heading">Akcije, ponude i brendovi</h1>
              <p className="s-slide-excerpt">{HERO_EXCERPT}</p>

              <div className="s-home-hero-stats">
                <div>
                  <strong>{stats.storeCount}</strong>
                  <span>Prodajnih lokacija</span>
                </div>
                <div>
                  <strong>{stats.brandCount}</strong>
                  <span>Modnih brendova</span>
                </div>
                <div>
                  <strong>{stats.cityCount}</strong>
                  <span>Gradova</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
