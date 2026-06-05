export function verifyCronRequest(request: Request): boolean {
  const secret =
    process.env.BRANDS_CRON_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get("authorization")?.trim();
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  const header =
    request.headers.get("x-cron-secret")?.trim() ||
    bearer ||
    null;

  return Boolean(header && header === secret);
}
