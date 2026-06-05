import Link from "next/link";
import { Calendar } from "lucide-react";
import { NewsCover } from "@/components/news/news-cover";
import { PremiumCard } from "@/components/ui/premium-card";
import type { NewsArticle } from "@/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface NewsCardProps {
  article: NewsArticle;
  showCategory?: boolean;
}

export function NewsCard({ article, showCategory = true }: NewsCardProps) {
  return (
    <Link href={`/news/${article.slug}`}>
      <PremiumCard className="group h-full overflow-hidden">
        <NewsCover
          title={article.title}
          imageLabel={article.imageLabel}
          imageUrl={article.imageUrl}
        />
        <div className="p-6">
          {showCategory ? (
            <span className="text-xs uppercase tracking-wider text-muted">
              {article.category}
            </span>
          ) : null}
          <h2
            className={`font-display text-lg font-semibold group-hover:text-accent ${showCategory ? "mt-2" : ""}`}
          >
            {article.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm text-muted">{article.excerpt}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(article.publishedAt)}
          </div>
        </div>
      </PremiumCard>
    </Link>
  );
}
