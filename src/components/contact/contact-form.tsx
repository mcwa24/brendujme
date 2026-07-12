"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { TagChip, tagListClassName } from "@/components/ui/tag-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumCard } from "@/components/ui/premium-card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { PAGE_CONTENT_MT } from "@/components/home/section-spacing";
import { cn } from "@/lib/utils";

type ContactTopic = "general" | "brand";
type FormStatus = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const searchParams = useSearchParams();
  const initialTopic: ContactTopic =
    searchParams.get("topic") === "brand" ? "brand" : "general";

  const [topic, setTopic] = useState<ContactTopic>(initialTopic);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [brandName, setBrandName] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("");
  const [availability, setAvailability] = useState("");

  const isBrand = topic === "brand";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          name,
          email,
          message,
          brandName: isBrand ? brandName : undefined,
          website: isBrand ? website : undefined,
          country: isBrand ? country : undefined,
          availability: isBrand ? availability : undefined,
          _honeypot: (
            event.currentTarget.elements.namedItem("_honeypot") as HTMLInputElement
          )?.value,
        }),
      });

      const data = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(data.error || "Slanje nije uspelo.");
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      setBrandName("");
      setWebsite("");
      setCountry("");
      setAvailability("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Slanje nije uspelo.");
    }
  }

  const title = isBrand ? "Prijavite brend" : "Kontakt";
  const description = isBrand
    ? "Predložite brend za uključivanje u Bilbord Shop. Naš tim pregleda svaku prijavu i ažurira gde se brend može kupiti u roku od 5 radnih dana."
    : "Imate pitanje ili predlog? Javite nam se — odgovaramo u roku od 48 sati.";

  if (status === "success") {
    return (
      <>
        <PageHeader title={title} />
        <PremiumCard className={cn(PAGE_CONTENT_MT, "p-8 text-center")}>
        <p className="font-display text-2xl font-semibold text-foreground">
          Poruka je poslata
        </p>
        <p className="mt-3 text-muted">
          Hvala — javićemo vam se uskoro na unetu email adresu.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6 rounded-full"
          onClick={() => setStatus("idle")}
        >
          Pošalji novu poruku
        </Button>
        </PremiumCard>
      </>
    );
  }

  return (
    <>
      <PageHeader title={title} description={description} />
      <PremiumCard className={cn(PAGE_CONTENT_MT, "p-8 md:p-10")}>
      <div className={tagListClassName("mb-8")}>
        <TagChip active={topic === "general"} onClick={() => setTopic("general")}>
          Opšti kontakt
        </TagChip>
        <TagChip active={topic === "brand"} onClick={() => setTopic("brand")}>
          Prijava brenda
        </TagChip>
      </div>

      <form
        className={cn("space-y-5", isBrand && "grid gap-5 sm:grid-cols-2")}
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          name="_honeypot"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden
        />

        {isBrand ? (
          <>
            <div className="sm:col-span-2">
              <label htmlFor="brandName" className="text-sm font-medium">
                Naziv brenda
              </label>
              <Input
                id="brandName"
                className="mt-2 h-12 rounded-xl"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="website" className="text-sm font-medium">
                Veb sajt
              </label>
              <Input
                id="website"
                type="url"
                className="mt-2 h-12 rounded-xl"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="country" className="text-sm font-medium">
                Zemlja porekla
              </label>
              <Input
                id="country"
                className="mt-2 h-12 rounded-xl"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="availability" className="text-sm font-medium">
                Gde je dostupan u Srbiji?
              </label>
              <Textarea
                id="availability"
                className="mt-2 min-h-28 rounded-xl"
                placeholder="Tržni centri, prodavnice, gradovi..."
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                required
              />
            </div>
          </>
        ) : null}

        <div className={cn(isBrand && "sm:col-span-2")}>
          <label htmlFor="name" className="text-sm font-medium">
            Ime
          </label>
          <Input
            id="name"
            className="mt-2 h-12 rounded-xl"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={cn(isBrand && "sm:col-span-2")}>
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            className="mt-2 h-12 rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={cn(isBrand && "sm:col-span-2")}>
          <label htmlFor="message" className="text-sm font-medium">
            {isBrand ? "Dodatne napomene" : "Poruka"}
          </label>
          <Textarea
            id="message"
            className="mt-2 min-h-32 rounded-xl"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder={
              isBrand
                ? "Linkovi, kategorija, logo, ili bilo šta što pomaže prijavi..."
                : undefined
            }
          />
        </div>

        {error ? (
          <p className={cn("text-sm text-destructive", isBrand && "sm:col-span-2")}>
            {error}
          </p>
        ) : null}

        <div className={cn(isBrand && "sm:col-span-2")}>
          <Button
            type="submit"
            disabled={status === "loading"}
            className="h-12 w-full rounded-full bg-accent hover:bg-accent-hover sm:w-auto sm:px-10"
          >
            {status === "loading"
              ? "Slanje..."
              : isBrand
                ? "Pošalji prijavu"
                : "Pošalji poruku"}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-sm text-muted">
        Slanjem forme prihvatate{" "}
        <Link href="/privacy" className="text-accent hover:underline">
          politiku privatnosti
        </Link>
        .
      </p>
      </PremiumCard>
    </>
  );
}
