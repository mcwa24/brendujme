import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { PageSection } from "@/components/layout/page-section";
import { FadeIn } from "@/components/motion/fade-in";
import { ContactForm } from "@/components/contact/contact-form";

export default function ContactPage() {
  return (
    <PageSection>
      <Container>
        <FadeIn className="max-w-2xl">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-[20px] bg-secondary" />}>
            <ContactForm />
          </Suspense>
        </FadeIn>
      </Container>
    </PageSection>
  );
}
