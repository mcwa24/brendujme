import Link from "next/link";
import { cn } from "@/lib/utils";

export function tagListClassName(className?: string) {
  return cn("s-tags", className);
}

export function tagChipClassName(active?: boolean, className?: string) {
  return cn("s-tag", active && "is-active", className);
}

type TagChipProps = React.ComponentProps<"button"> & {
  active?: boolean;
};

export function TagChip({
  active,
  className,
  type = "button",
  ...props
}: TagChipProps) {
  return (
    <button type={type} className={tagChipClassName(active, className)} {...props} />
  );
}

type TagLinkProps = React.ComponentProps<typeof Link> & {
  active?: boolean;
};

export function TagLink({ active, className, ...props }: TagLinkProps) {
  return <Link className={tagChipClassName(active, className)} {...props} />;
}

type ExternalTagLinkProps = React.ComponentProps<"a">;

/** Ghost javni tag — link ka bilbord.rs/{slug}/ */
export function ExternalTagLink({ className, ...props }: ExternalTagLinkProps) {
  return (
    <a
      className={tagChipClassName(false, className)}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  );
}
