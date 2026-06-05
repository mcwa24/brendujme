"use client";

import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumCard } from "@/components/ui/premium-card";
import { Textarea } from "@/components/ui/textarea";

export default function SubmitBrandPage() {
  return (
    <Container narrow className="py-12 md:py-16">
      <FadeIn>
        <h1 className="font-display text-4xl font-semibold md:text-5xl">
          Prijavite brend
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Predložite brend za uključivanje u Bilbord Brands direktorijum. Naš tim
          pregleda svaku prijavu i ažurira dostupnost u roku od 5 radnih dana.
        </p>
      </FadeIn>
      <FadeIn delay={0.1} className="mt-12 max-w-2xl">
        <PremiumCard className="p-8 md:p-10">
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Naziv brenda</label>
              <Input className="mt-2 h-12 rounded-xl" required />
            </div>
            <div className="sm:col-span-1">
              <label className="text-sm font-medium">Veb sajt</label>
              <Input type="url" className="mt-2 h-12 rounded-xl" />
            </div>
            <div className="sm:col-span-1">
              <label className="text-sm font-medium">Zemlja porekla</label>
              <Input className="mt-2 h-12 rounded-xl" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Gde je dostupan u Srbiji?</label>
              <Textarea
                className="mt-2 min-h-28 rounded-xl"
                placeholder="Tržni centri, prodavnice, gradovi..."
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Vaš email</label>
              <Input type="email" className="mt-2 h-12 rounded-xl" required />
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                className="h-12 w-full rounded-full bg-accent hover:bg-accent-hover sm:w-auto sm:px-10"
              >
                Pošalji prijavu
              </Button>
            </div>
          </form>
        </PremiumCard>
      </FadeIn>
    </Container>
  );
}
