"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { HOME_SECTION_PY } from "@/components/home/section-spacing";
import { FadeIn } from "@/components/motion/fade-in";
import type { Category } from "@/types";

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className={HOME_SECTION_PY}>
      <Container narrow>
        <FadeIn>
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
            Pregledajte kategorije
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            Od modne i lepote do luksuza i tehnologije — sve na jednom mestu.
          </p>
        </FadeIn>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, i) => (
            <FadeIn key={category.slug} delay={i * 0.04}>
              <Link href={`/categories/${category.slug}`}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="group relative overflow-hidden rounded-none border border-border bg-card p-8 shadow-[var(--shadow-card)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <ArrowUpRight className="absolute right-6 top-6 h-5 w-5 text-muted transition-colors group-hover:text-accent" />
                  <h3 className="font-display relative text-2xl font-semibold text-foreground">
                    {category.name}
                  </h3>
                  <p className="relative mt-2 text-sm text-muted line-clamp-2">
                    {category.description}
                  </p>
                </motion.div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
