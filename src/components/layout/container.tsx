import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}

export function Container({ children, className, narrow }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        narrow ? "max-w-[1280px]" : "max-w-[1440px]",
        className
      )}
    >
      {children}
    </div>
  );
}
