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
  open = false,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  open?: boolean;
}) {
  return (
    <HeaderIconButton
      type="button"
      className={cn("s-utils-burger", open && "is-open", className)}
      aria-label={open ? "Zatvori meni" : "Otvori meni"}
      aria-expanded={open}
      {...props}
    >
      <svg
        width={16}
        height={12}
        viewBox="0 0 16 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M16 12H0V10H16V12ZM16 7H0V5H16V7ZM16 2H0V0H16V2Z"
          fill="currentColor"
        />
      </svg>
      <svg
        width={19}
        height={19}
        viewBox="0 0 19 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.5686 17.5078C17.2135 17.8628 16.6379 17.8628 16.2829 17.5078L0.854299 2.07922C0.499259 1.72418 0.499259 1.14854 0.854299 0.793503C1.20934 0.438463 1.78497 0.438463 2.14001 0.793503L17.5686 16.2221C17.9236 16.5771 17.9236 17.1527 17.5686 17.5078Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.5686 0.793667C17.9236 1.14871 17.9236 1.72434 17.5686 2.07938L2.14001 17.5079C1.78497 17.863 1.20933 17.863 0.854294 17.5079C0.499254 17.1529 0.499254 16.5773 0.854294 16.2222L16.2829 0.793667C16.6379 0.438627 17.2135 0.438627 17.5686 0.793667Z"
          fill="currentColor"
        />
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
        width={19}
        height={19}
        viewBox="0 0 19 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.5686 17.5078C17.2135 17.8628 16.6379 17.8628 16.2829 17.5078L0.854299 2.07922C0.499259 1.72418 0.499259 1.14854 0.854299 0.793503C1.20934 0.438463 1.78497 0.438463 2.14001 0.793503L17.5686 16.2221C17.9236 16.5771 17.9236 17.1527 17.5686 17.5078Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.5686 0.793667C17.9236 1.14871 17.9236 1.72434 17.5686 2.07938L2.14001 17.5079C1.78497 17.863 1.20933 17.863 0.854294 17.5079C0.499254 17.1529 0.499254 16.5773 0.854294 16.2222L16.2829 0.793667C16.6379 0.438627 17.2135 0.438627 17.5686 0.793667Z"
          fill="currentColor"
        />
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
