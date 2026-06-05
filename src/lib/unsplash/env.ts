export function getUnsplashAccessKey(): string | undefined {
  return process.env.UNSPLASH_ACCESS_KEY?.replace(/^["']|["']$/g, "").trim();
}

export function isUnsplashConfigured(): boolean {
  return Boolean(getUnsplashAccessKey());
}
