import { Container } from "@/components/layout/container";
import { FadeIn } from "@/components/motion/fade-in";

const stats = [
  { value: "1,200+", label: "Brendova" },
  { value: "350+", label: "Prodajnih lokacija" },
  { value: "25+", label: "Gradova" },
  { value: "50+", label: "Tržnih centara" },
];

export function StatsSection() {
  return (
    <section className="border-y border-border bg-card py-20">
      <Container narrow>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.08} className="text-center lg:text-left">
              <p className="font-display text-5xl font-semibold tracking-tight text-accent md:text-6xl">
                {stat.value}
              </p>
              <p className="mt-2 text-muted">{stat.label}</p>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
