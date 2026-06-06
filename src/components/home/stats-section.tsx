import { Container } from "@/components/layout/container";
import { HOME_SECTION_PY } from "@/components/home/section-spacing";
import { FadeIn } from "@/components/motion/fade-in";
import type { HomeStats } from "@/lib/data/repository";

interface StatsSectionProps {
  stats: HomeStats;
}

export function StatsSection({ stats }: StatsSectionProps) {
  const items = [
    { value: String(stats.brandCount), label: "Modnih brendova" },
    { value: String(stats.storeCount), label: "Prodajnih lokacija" },
    { value: String(stats.cityCount), label: "Gradova" },
  ] as const;

  return (
    <section className={HOME_SECTION_PY}>
      <Container narrow>
        <div className="grid gap-12 sm:grid-cols-3">
          {items.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.08} className="text-center">
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
