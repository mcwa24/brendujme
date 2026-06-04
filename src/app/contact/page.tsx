"use client";

import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumCard } from "@/components/ui/premium-card";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">Kontakt</h1>
        <p className="mt-3 max-w-xl text-muted">
          Imate pitanje ili predlog? Javite nam se — odgovaramo u roku od 48 sati.
        </p>
      </FadeIn>
      <FadeIn delay={0.1} className="mt-12 max-w-xl">
        <PremiumCard className="p-8">
          <form
            className="space-y-5"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <label className="text-sm font-medium">Ime</label>
              <Input className="mt-2 h-12 rounded-xl" required />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" className="mt-2 h-12 rounded-xl" required />
            </div>
            <div>
              <label className="text-sm font-medium">Poruka</label>
              <Textarea className="mt-2 min-h-32 rounded-xl" required />
            </div>
            <Button
              type="submit"
              className="h-12 w-full rounded-full bg-accent hover:bg-accent-hover"
            >
              Pošalji poruku
            </Button>
          </form>
        </PremiumCard>
      </FadeIn>
    </Container>
  );
}
