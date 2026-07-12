"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { PAGE_LEAD, PAGE_TITLE } from "@/components/home/section-spacing";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  /** Bez mount animacije (npr. unutar drugog FadeIn bloka). */
  static?: boolean;
}

function PageHeaderContent({
  title,
  description,
  titleClassName,
}: Pick<PageHeaderProps, "title" | "description" | "titleClassName">) {
  return (
    <>
      <h1 className={cn(PAGE_TITLE, titleClassName)}>{title}</h1>
      {description ? (
        typeof description === "string" ? (
          <p className={PAGE_LEAD}>{description}</p>
        ) : (
          description
        )
      ) : null}
    </>
  );
}

/** Ghost page title — ista pozicija i tipografija na svim stranicama. */
export function PageHeader({
  title,
  description,
  className,
  titleClassName,
  static: isStatic = false,
}: PageHeaderProps) {
  if (isStatic) {
    return (
      <div className={className}>
        <PageHeaderContent
          title={title}
          description={description}
          titleClassName={titleClassName}
        />
      </div>
    );
  }

  return (
    <FadeIn when="mount" direction="none" className={className}>
      <PageHeaderContent
        title={title}
        description={description}
        titleClassName={titleClassName}
      />
    </FadeIn>
  );
}
