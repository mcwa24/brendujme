"use client";

import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumCard } from "@/components/ui/premium-card";

export function NewsletterSection() {
  return (
    <section className="py-20">
      <Container narrow>
        <FadeIn>
          <PremiumCard className="px-8 py-12 md:px-16 md:py-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Budite u toku sa novim brendovima u Srbiji
              </h2>
              <p className="mt-4 text-muted">
                Mesečni pregled novih otvaranja, retail vesti i premium brendova
                na vašem emailu.
              </p>
              <form
                className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
                onSubmit={(e) => e.preventDefault()}
              >
                <Input
                  type="email"
                  placeholder="vaš@email.com"
                  className="h-12 flex-1 rounded-full border-border bg-background px-5 text-base"
                  required
                />
                <Button
                  type="submit"
                  className="h-12 rounded-full bg-accent px-8 hover:bg-accent-hover"
                >
                  Prijavite se
                </Button>
              </form>
              <p className="mt-4 text-xs text-muted">
                Bez spama. Odjavite se u bilo kom trenutku.
              </p>
            </div>
          </PremiumCard>
        </FadeIn>
      </Container>
    </section>
  );
}
