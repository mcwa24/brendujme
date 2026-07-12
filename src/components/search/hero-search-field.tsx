"use client";

import { Search, X } from "lucide-react";
import { useSearch } from "@/components/search/search-provider";
import { cn } from "@/lib/utils";

export const HERO_SEARCH_PLACEHOLDER =
  "Pretražite modne brendove ili prodavce...";

const heroSearchShellClassName =
  "bilbord-field flex w-full items-center gap-3 px-4 py-3.5 text-left shadow-[var(--shadow-card)] transition-shadow hover:shadow-[0_4px_24px_rgb(0_0_0/0.06)] focus-within:shadow-[0_4px_24px_rgb(0_0_0/0.06)]";

interface HeroSearchTriggerProps {
  className?: string;
}

/** Home hero — otvara globalnu pretragu. */
export function HeroSearchTrigger({ className }: HeroSearchTriggerProps) {
  const { setOpen } = useSearch();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(heroSearchShellClassName, className)}
    >
      <Search className="h-5 w-5 shrink-0 text-muted" />
      <span className="text-muted-foreground">{HERO_SEARCH_PLACEHOLDER}</span>
      <kbd className="ml-auto hidden rounded-full bg-[var(--color-chip-bg)] px-2 py-0.5 text-[11px] text-muted md:inline">
        ⌘K
      </kbd>
    </button>
  );
}

interface HeroSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

/** Isti izgled kao hero pretraga — inline filter (npr. /brands). */
export function HeroSearchInput({
  value,
  onChange,
  onClear,
  className,
}: HeroSearchInputProps) {
  const hasValue = value.trim().length > 0;

  return (
    <div className={cn(heroSearchShellClassName, "relative", className)}>
      <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={HERO_SEARCH_PLACEHOLDER}
        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-base text-foreground outline-none placeholder:text-muted-foreground"
        aria-label={HERO_SEARCH_PLACEHOLDER}
      />
      {hasValue && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded-full p-1 text-muted transition-colors hover:text-foreground"
          aria-label="Obriši pretragu"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
