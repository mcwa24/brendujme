import { Container } from "@/components/layout/container";

export function PageLoading() {
  return (
    <Container narrow className="animate-pulse py-16 md:py-24">
      <div className="h-10 w-2/3 max-w-md rounded-none bg-secondary" />
      <div className="mt-4 h-5 w-full max-w-xl rounded-none bg-secondary/80" />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-none border border-border bg-card"
          />
        ))}
      </div>
    </Container>
  );
}
