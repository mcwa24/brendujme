import { cn } from "@/lib/utils";

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function PremiumCard({ children, className, hover = true }: PremiumCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] bg-card shadow-[var(--shadow-card)]",
        hover &&
          "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgb(0_0_0/0.06)]",
        className
      )}
    >
      {children}
    </div>
  );
}
