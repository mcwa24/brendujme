import { ArrowRight, Mail } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";
import { HOME_SECTION_PY, HOME_SECTION_TITLE } from "@/components/home/section-spacing";
import { buttonVariants } from "@/components/ui/button";
import { BILBORD_SITE_URL } from "@/lib/bilbord-footer";
import { cn } from "@/lib/utils";

const BILBORD_NEWSLETTER_URL = `${BILBORD_SITE_URL}/newsletter/`;

export function NewsletterBanner() {
  return (
    <section className={HOME_SECTION_PY}>
      <Container>
        <FadeIn>
          <div className="border border-border bg-card px-6 py-10 shadow-[var(--shadow-card)] sm:px-10 sm:py-12 lg:px-12 lg:py-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 text-accent">
                  <Mail className="h-5 w-5 shrink-0" aria-hidden />
                  <p className="text-xs font-bold uppercase tracking-[0.14em]">
                    Newsletter
                  </p>
                </div>

                <h2 className={cn(HOME_SECTION_TITLE, "mt-4")}>
                  Budite u toku sa modom
                </h2>

                <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
                  Prijavite se na Bilbord newsletter — akcije, novi brendovi i
                  vesti iz sveta mode, direktno u vaš inbox.
                </p>

                <p className="mt-4 text-sm leading-relaxed text-muted">
                  Besplatno. Bez spama. Odjavite se u bilo kom trenutku.
                </p>
              </div>

              <div className="shrink-0 lg:text-right">
                <a
                  href={BILBORD_NEWSLETTER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "inline-flex w-full sm:w-auto"
                  )}
                >
                  Prijavi se
                  <ArrowRight data-icon="inline-end" />
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
