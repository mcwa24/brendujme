import { cn } from "@/lib/utils";

export function HeaderIconButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn("s-header-icon-btn", className)}
      suppressHydrationWarning
      {...props}
    >
      {children}
    </button>
  );
}

export function HeaderSearchButton({
  className,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <HeaderIconButton
      className={cn("s-utils-search", className)}
      aria-label="Pretražite brendove"
      {...props}
    >
      <HeaderSearchIcon />
    </HeaderIconButton>
  );
}

export function HeaderBurgerButton({
  className,
  isOpen,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  isOpen?: boolean;
}) {
  return (
    <HeaderIconButton
      type="button"
      className={cn("s-utils-burger", isOpen && "is-open", className)}
      aria-label={isOpen ? "Zatvori meni" : "Meni"}
      aria-expanded={isOpen}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={20}
        height={20}
        fill="currentColor"
        viewBox="0 0 256 256"
        aria-hidden
        className="s-utils-burger-open"
      >
        <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={20}
        height={20}
        fill="currentColor"
        viewBox="0 0 256 256"
        aria-hidden
        className="s-utils-burger-close"
      >
        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
      </svg>
    </HeaderIconButton>
  );
}

export function HeaderCloseButton({
  className,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <HeaderIconButton
      className={cn("s-utils-close", className)}
      aria-label="Zatvori meni"
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={20}
        height={20}
        fill="currentColor"
        viewBox="0 0 256 256"
        aria-hidden
      >
        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
      </svg>
    </HeaderIconButton>
  );
}

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
