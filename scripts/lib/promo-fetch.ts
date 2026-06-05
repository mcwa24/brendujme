/**
 * Fetch stranica — HTTP, pa Playwright (Đak / Cloudflare).
 */

import { chromium, type Browser, type Page } from "playwright";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const BROWSER_RETAILERS = new Set(["djak-sport"]);

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      channel: process.env.PW_CHROME_CHANNEL || "chromium",
      headless: process.env.PW_HEADED !== "1",
      args: ["--disable-blink-features=AutomationControlled"],
    });
  }
  return browser;
}

export async function closePromoBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export function retailerNeedsBrowser(retailerSlug: string): boolean {
  return BROWSER_RETAILERS.has(retailerSlug);
}

async function fetchWithHttp(url: string): Promise<{ html: string | null; status: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "sr,en;q=0.9",
      },
      redirect: "follow",
    });
    if (!res.ok) return { html: null, status: res.status };
    return { html: await res.text(), status: res.status };
  } catch {
    return { html: null, status: 0 };
  } finally {
    clearTimeout(timer);
  }
}

async function newBrowserPage(): Promise<Page> {
  const b = await getBrowser();
  const context = await b.newContext({
    locale: "sr-Latn-RS",
    userAgent: USER_AGENT,
    viewport: { width: 1440, height: 900 },
  });
  return context.newPage();
}

async function fetchWithPlaywright(url: string): Promise<string | null> {
  try {
    const page = await newBrowserPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.waitForTimeout(4000);
    const html = await page.content();
    await page.close();
    return html;
  } catch (err) {
    console.warn(`  Playwright failed ${url}:`, (err as Error).message);
    return null;
  }
}

export async function fetchPromoPage(
  url: string,
  retailerSlug?: string
): Promise<string | null> {
  const preferBrowser = retailerSlug && retailerNeedsBrowser(retailerSlug);

  if (preferBrowser) {
    const html = await fetchWithPlaywright(url);
    if (html && !html.includes("Attention Required")) return html;
  }

  const { html, status } = await fetchWithHttp(url);
  if (html && !html.includes("Attention Required")) return html;

  if (preferBrowser || status === 403 || status === 401 || status === 0) {
    console.warn(`  HTTP ${status || "blocked"} → Playwright`);
    const pw = await fetchWithPlaywright(url);
    if (pw && !pw.includes("Attention Required")) return pw;
  }

  if (status && status !== 200) console.warn(`  HTTP ${status} ${url}`);
  return null;
}

/** Playwright stranica za interaktivno čitanje karusela (Đak). */
export async function openPromoBrowserPage(): Promise<Page> {
  return newBrowserPage();
}
