import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Zadržano radi kompatibilnosti — ista širina kao Ghost .s-container */
  narrow?: boolean;
}

export function Container({ children, className }: ContainerProps) {
  return <div className={cn("s-container", className)}>{children}</div>;
}
