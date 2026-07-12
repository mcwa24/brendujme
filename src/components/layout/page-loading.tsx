import { PageSection } from "@/components/layout/page-section";
import { Container } from "@/components/layout/container";
import { PAGE_TITLE } from "@/components/home/section-spacing";
import { cn } from "@/lib/utils";

export function PageLoading() {
  return (
    <PageSection>
      <Container className="animate-pulse">
        <div className={cn(PAGE_TITLE, "h-[1.12em] max-w-md rounded-[var(--radius)] bg-secondary text-transparent sm:max-w-lg md:max-w-xl")}>
          &nbsp;
        </div>
        <div className="mt-4 h-5 w-full max-w-xl rounded-[var(--radius)] bg-secondary/80" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-[var(--radius)] bg-card shadow-[var(--shadow-card)]"
            />
          ))}
        </div>
      </Container>
    </PageSection>
  );
}
