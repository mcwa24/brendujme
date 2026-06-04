import Link from "next/link";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <Container narrow className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-muted">404</p>
      <h1 className="font-display mt-4 text-4xl font-semibold">Stranica nije pronađena</h1>
      <p className="mt-4 max-w-md text-muted">
        Tražena stranica ne postoji ili je uklonjena.
      </p>
      <Link
        href="/"
        className={cn(
          buttonVariants({ size: "lg" }),
          "mt-8 rounded-full bg-accent hover:bg-accent-hover"
        )}
      >
        Nazad na početnu
      </Link>
    </Container>
  );
}
