import { unstable_cache } from "next/cache";
import { brandSlugsFromGhostTags } from "@/lib/ghost/brand-tags";
import { ghostAdminRequest } from "@/lib/ghost/client";
import {
  GHOST_MODA_STIL_CATEGORY,
  getGhostNewsTagSlug,
  isGhostConfigured,
} from "@/lib/ghost/env";
import { mapGhostPublicTags } from "@/lib/news/tags";
import { NEWS_PAGE_SIZE } from "@/lib/news/constants";
import type { NewsPageResult } from "@/lib/news/types";
import type { NewsArticle } from "@/types";

type GhostTag = {
  slug: string;
  name: string;
  visibility?: string;
  url?: string | null;
};

type GhostPost = {
  slug: string;
  title: string;
  excerpt?: string | null;
  custom_excerpt?: string | null;
  html?: string | null;
  feature_image?: string | null;
  published_at?: string | null;
  url?: string | null;
  featured?: boolean;
  tags?: GhostTag[];
};

type GhostPagination = {
  page: number;
  limit: number;
  pages: number;
  total: number;
  next: number | null;
  prev: number | null;
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isHiddenPost(tags: GhostTag[] | undefined): boolean {
  return (tags ?? []).some(
    (tag) =>
      tag.slug === "hash-hide" || tag.name.trim().toLowerCase() === "#hide"
  );
}

function publicCategory(tags: GhostTag[] | undefined): string {
  const tagSlug = getGhostNewsTagSlug();
  const match = (tags ?? []).find((tag) => tag.slug === tagSlug);
  return match?.name?.trim() || GHOST_MODA_STIL_CATEGORY;
}

function mapGhostPost(
  post: GhostPost,
  page: number,
  index: number
): NewsArticle {
  const excerptSource =
    post.custom_excerpt?.trim() ||
    post.excerpt?.trim() ||
    (post.html ? stripHtml(post.html).slice(0, 280) : "");

  const publishedAt = post.published_at?.slice(0, 10) ?? "";

  return {
    slug: post.slug,
    title: post.title.trim(),
    excerpt: excerptSource,
    content: excerptSource,
    contentHtml: post.html?.trim() || undefined,
    publishedAt,
    category: publicCategory(post.tags),
    featured: post.featured === true || (page === 1 && index === 0),
    brandSlugs: (() => {
      const slugs = brandSlugsFromGhostTags(post.tags);
      return slugs.length ? slugs : undefined;
    })(),
    tags: mapGhostPublicTags(post.tags),
    imageLabel: post.title.trim(),
    imageUrl: post.feature_image?.trim() || undefined,
    sourceUrl: post.url?.trim() || undefined,
  };
}

async function fetchGhostPostsPageUncached(
  page: number,
  pageSize: number,
  slug?: string
): Promise<NewsPageResult> {
  if (!isGhostConfigured()) {
    return { articles: [], page, pageSize, hasMore: false };
  }

  const tagSlug = getGhostNewsTagSlug();
  const filters = [`status:published`, `tag:${tagSlug}`];
  if (slug) filters.push(`slug:${slug}`);

  const query = new URLSearchParams({
    filter: filters.join("+"),
    limit: String(slug ? 1 : pageSize),
    page: String(slug ? 1 : page),
    include: "tags",
    order: "published_at desc",
    fields:
      "slug,title,excerpt,custom_excerpt,html,feature_image,published_at,url,featured",
  });

  const response = await ghostAdminRequest(`posts/?${query.toString()}`);
  const posts = Array.isArray(response.posts)
    ? (response.posts as GhostPost[])
    : [];
  const pagination = (response.meta as { pagination?: GhostPagination } | undefined)
    ?.pagination;

  const articles = posts
    .filter((post) => !isHiddenPost(post.tags))
    .map((post, index) => mapGhostPost(post, page, index));

  if (slug) {
    return {
      articles,
      page: 1,
      pageSize: 1,
      hasMore: false,
      total: articles.length,
    };
  }

  const hasMore =
    pagination?.next != null ||
    (pagination ? pagination.page < pagination.pages : articles.length === pageSize);

  return {
    articles,
    page,
    pageSize,
    hasMore,
    total: pagination?.total,
  };
}

function fetchGhostPostsPageCached(page: number, pageSize: number) {
  return unstable_cache(
    async () => fetchGhostPostsPageUncached(page, pageSize),
    ["ghost-moda-stil-posts", String(page), String(pageSize)],
    { revalidate: 300, tags: ["ghost-news"] }
  )();
}

async function fetchGhostPostBySlugCached(
  slug: string
): Promise<NewsArticle | undefined> {
  const result = await unstable_cache(
    async () => fetchGhostPostsPageUncached(1, 1, slug),
    ["ghost-moda-stil-post", slug],
    { revalidate: 300, tags: ["ghost-news", `ghost-news-${slug}`] }
  )();
  return result.articles[0];
}

export async function fetchGhostModaStilNewsPage(
  page = 1,
  pageSize = NEWS_PAGE_SIZE
): Promise<NewsPageResult> {
  return fetchGhostPostsPageCached(page, pageSize);
}

async function fetchAllGhostModaStilNewsUncached(): Promise<NewsArticle[]> {
  const all: NewsArticle[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await fetchGhostPostsPageUncached(page, 100);
    all.push(...result.articles);
    hasMore = result.hasMore;
    page += 1;
    if (!result.articles.length) break;
  }

  return all;
}

function fetchAllGhostModaStilNewsCached(): Promise<NewsArticle[]> {
  return unstable_cache(
    fetchAllGhostModaStilNewsUncached,
    ["ghost-moda-stil-all-posts"],
    { revalidate: 600, tags: ["ghost-news"] }
  )();
}

export async function fetchAllGhostModaStilNews(): Promise<NewsArticle[]> {
  if (!isGhostConfigured()) return [];
  return fetchAllGhostModaStilNewsCached();
}

/** @deprecated Koristi fetchGhostModaStilNewsPage ili fetchAllGhostModaStilNews */
export async function fetchGhostModaStilNews(
  limit = 24
): Promise<NewsArticle[]> {
  const result = await fetchGhostModaStilNewsPage(1, limit);
  return result.articles;
}

export async function fetchGhostNewsBySlug(
  slug: string
): Promise<NewsArticle | undefined> {
  return fetchGhostPostBySlugCached(slug);
}
