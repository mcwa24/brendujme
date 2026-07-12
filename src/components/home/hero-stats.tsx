import { FadeIn } from "@/components/motion/fade-in";
import type { HomeStats } from "@/lib/data/repository";

interface HeroStatsProps {
  stats: HomeStats;
}

function StatBlock({
  value,
  label,
  align = "center",
  size = "base",
}: {
  value: number;
  label: string;
  align?: "left" | "center" | "right";
  size?: "apex" | "base";
}) {
  const alignClass =
    align === "left"
      ? "text-left"
      : align === "right"
        ? "text-right"
        : "text-center";

  const valueClass =
    size === "apex"
      ? "text-4xl font-semibold sm:text-5xl md:text-[4.25rem]"
      : "text-3xl font-semibold sm:text-4xl md:text-5xl";

  return (
    <div className={`${alignClass} w-full`}>
      <p
        className={`font-display tabular-nums leading-none text-foreground max-md:tracking-normal ${valueClass}`}
      >
        {value}
      </p>
      <p
        className={`mt-2 text-[0.8125rem] leading-snug text-muted-foreground sm:mt-1.5 sm:text-sm ${
          align === "center"
            ? "mx-auto max-w-[7.5rem] text-center sm:max-w-[8.5rem]"
            : align === "right"
              ? "ml-auto max-w-[7.5rem] text-right"
              : "max-w-[7.5rem] text-left"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

export function HeroStats({ stats }: HeroStatsProps) {
  return (
    <FadeIn delay={0.15}>
      <div className="flex flex-col items-start">
        <StatBlock
          value={stats.storeCount}
          label="Prodajnih lokacija"
          align="left"
          size="apex"
        />

        <div className="mt-6 grid w-full min-w-[14rem] max-w-[18rem] grid-cols-2 gap-x-4 sm:mt-8 sm:gap-x-6">
          <StatBlock
            value={stats.brandCount}
            label="Modnih brendova"
            align="left"
          />
          <StatBlock value={stats.cityCount} label="Gradova" align="left" />
        </div>
      </div>
    </FadeIn>
  );
}
