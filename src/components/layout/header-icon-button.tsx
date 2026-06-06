import { cn } from "@/lib/utils";

/** Ghost .gh-icon-button + .gh-search — 32×32, SVG 20×20 */
export function HeaderIconButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-foreground outline-none [&_svg]:transition-opacity hover:[&_svg]:opacity-80",
        className
      )}
      {...props}
    />
  );
}

export function HeaderSearchButton({
  className,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <HeaderIconButton
      className={cn("-mx-0.5", className)}
      aria-label="Pretražite brendove"
      {...props}
    >
      <HeaderSearchIcon />
    </HeaderIconButton>
  );
}

/** Ghost partials/icons/search.hbs — 20×20, stroke-width 2 */
export function HeaderSearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      width={20}
      height={20}
      aria-hidden
      className="block"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}
