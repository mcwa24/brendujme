/**
 * Heurističko i opciono AI (OpenAI) izvlačenje akcija iz HTML teksta.
 */

export type DetectedCampaignType =
  | "sale"
  | "seasonal"
  | "black_friday"
  | "clearance"
  | "new_collection"
  | "collaboration"
  | "other";

export interface ExtractedPromotion {
  hasPromotion: boolean;
  title: string;
  description: string;
  shortDescription: string;
  campaignType: DetectedCampaignType;
  startDate: string | null;
  endDate: string | null;
  discountPercent: number | null;
  scope: string | null;
  confidence: "high" | "medium" | "low";
}

const PROMO_SIGNALS =
  /\b(akcij[aeiou]?|popust|sniženj[ae]|sniženo|rasprodaj[ae]|sale|outlet|black\s*friday|cyber\s*monday|flajer|extra\s*popust|do\s*-?\s*\d+\s*%|%\s*popust)\b/i;

const STRONG_PROMO_TITLE =
  /\b(akcij[aeiou]?|popust|sniženj[ae]|rasprodaj[ae]|black\s*friday|outlet|flajer|likvidacij)\b/i;

const GENERIC_HOME_TITLES =
  /\b(dobro\s+do[sš]l|welcome|home|online\s+shop|web\s+shop|prodavnica)\b/i;

const SR_MONTHS: Record<string, number> = {
  januar: 1,
  januara: 1,
  februar: 2,
  februara: 2,
  mart: 3,
  marta: 3,
  april: 4,
  aprila: 4,
  maj: 5,
  maja: 5,
  jun: 6,
  juna: 6,
  jul: 7,
  jula: 7,
  avgust: 8,
  avgusta: 8,
  septembar: 9,
  septembra: 9,
  oktobar: 10,
  oktobra: 10,
  novembar: 11,
  novembra: 11,
  decembar: 12,
  decembra: 12,
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toIsoDate(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCMonth() !== month - 1) return null;
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function parseDottedDate(raw: string, refYear?: number): string | null {
  const m = raw.trim().match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  let year = refYear ?? new Date().getFullYear();
  if (m[3]) {
    year = Number(m[3]);
    if (year < 100) year += 2000;
  }
  return toIsoDate(year, month, day);
}

function parseSerbianMonthDate(
  day: number,
  monthWord: string,
  year?: number
): string | null {
  const month = SR_MONTHS[monthWord.toLowerCase()];
  if (!month) return null;
  const y = year ?? new Date().getFullYear();
  return toIsoDate(y, month, day);
}

export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractMetaTitle(html: string): string | null {
  const og = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
  );
  if (og?.[1]) return decodeEntities(og[1].trim());

  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (title?.[1]) return decodeEntities(title[1].trim());
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function extractH1(html: string): string | null {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1?.[1]) return null;
  return htmlToText(h1[1]).slice(0, 200);
}

export function extractDiscountPercent(text: string): number | null {
  const bannerCap = text.match(/\bdo\s*-?\s*(\d{1,2})\s*%/i);
  if (bannerCap) {
    const n = Number(bannerCap[1]);
    if (n > 0 && n <= 90) return n;
  }
  const promoLine = text.match(
    /\b(?:akcij[ae]|online\s+akcij[ae]|popust)[^.]{0,80}?(\d{1,2})\s*%/i
  );
  if (promoLine) {
    const n = Number(promoLine[1]);
    if (n > 0 && n <= 90) return n;
  }
  return null;
}

export function extractDateRange(text: string): {
  startDate: string | null;
  endDate: string | null;
} {
  const refYear = new Date().getFullYear();
  let startDate: string | null = null;
  let endDate: string | null = null;

  const compactRange = text.match(
    /(\d{1,2})\s*-\s*(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?/
  );
  if (compactRange) {
    const y = compactRange[4]
      ? Number(compactRange[4]) < 100
        ? 2000 + Number(compactRange[4])
        : Number(compactRange[4])
      : refYear;
    const month = Number(compactRange[3]);
    startDate = toIsoDate(y, month, Number(compactRange[1]));
    endDate = toIsoDate(y, month, Number(compactRange[2]));
    if (startDate && endDate) return { startDate, endDate };
  }

  const rangeNumeric = text.match(
    /od\s+(\d{1,2}\.\d{1,2}(?:\.\d{2,4})?)\s+do\s+(\d{1,2}\.\d{1,2}(?:\.\d{2,4})?)/i
  );
  if (rangeNumeric) {
    startDate = parseDottedDate(rangeNumeric[1], refYear);
    endDate = parseDottedDate(rangeNumeric[2], refYear);
    if (startDate && endDate) return { startDate, endDate };
  }

  const untilNumeric = text.match(
    /do\s+(\d{1,2}\.\s*\d{1,2}(?:\.\s*\d{2,4})?)/i
  );
  if (untilNumeric) {
    endDate = parseDottedDate(untilNumeric[1].replace(/\s+/g, ""), refYear);
  }

  const untilMonth = text.match(
    /do\s+(\d{1,2})\.\s*([a-zčćžšđ]+)(?:\s+(\d{4}))?/i
  );
  if (untilMonth) {
    endDate = parseSerbianMonthDate(
      Number(untilMonth[1]),
      untilMonth[2],
      untilMonth[3] ? Number(untilMonth[3]) : refYear
    );
  }

  const fromMonth = text.match(
    /od\s+(\d{1,2})\.\s*([a-zčćžšđ]+)(?:\s+(\d{4}))?/i
  );
  if (fromMonth) {
    startDate = parseSerbianMonthDate(
      Number(fromMonth[1]),
      fromMonth[2],
      fromMonth[3] ? Number(fromMonth[3]) : refYear
    );
  }

  return { startDate, endDate };
}

function inferCampaignType(text: string): DetectedCampaignType {
  const lower = text.toLowerCase();
  if (/black\s*friday|cyber\s*monday/.test(lower)) return "black_friday";
  if (/rasprodaj|outlet|clearance|likvidacij/.test(lower)) return "clearance";
  if (/nova\s+kolekcij|new\s+collection|novo\s+u\s+ponudi/.test(lower))
    return "new_collection";
  if (/letnj|zimsk|prolećn|jesenj|sezonsk/.test(lower)) return "seasonal";
  if (/akcij|popust|sniženj|sale|%/.test(lower)) return "sale";
  return "other";
}

function inferScope(text: string): string | null {
  const scopes = [
    "patike",
    "obuća",
    "odeća",
    "garderoba",
    "sportska oprema",
    "cela ponuda",
    "sve artikle",
    "izabrane artikle",
    "izdvojena ponuda",
    "izdvojenu ponudu",
    "izdvojeni proizvodi",
  ];
  const lower = text.toLowerCase();
  for (const s of scopes) {
    if (lower.includes(s)) return s;
  }
  return null;
}

function defaultDateRange(): { startDate: string; endDate: string } {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 14);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { startDate: fmt(start), endDate: fmt(end) };
}

export function extractPromotionWithHeuristics(
  html: string,
  pageUrl: string
): ExtractedPromotion {
  const text = htmlToText(html);
  const rawTitle =
    extractH1(html) ??
    extractMetaTitle(html) ??
    "Akcija";
  const title = decodeEntities(rawTitle);
  const { startDate: parsedStart, endDate: parsedEnd } = extractDateRange(text);
  const discountPercent = extractDiscountPercent(text);
  const strongTitle = STRONG_PROMO_TITLE.test(title);
  const homePath =
    new URL(pageUrl).pathname.replace(/\/$/, "").length <= 12;
  const genericHome =
    homePath &&
    GENERIC_HOME_TITLES.test(title) &&
    !strongTitle;
  const hasRealDates = Boolean(parsedStart || parsedEnd);
  const hasPromotion =
    !genericHome &&
    PROMO_SIGNALS.test(text) &&
    (strongTitle || hasRealDates || (!homePath && discountPercent));

  if (!hasPromotion) {
    return {
      hasPromotion: false,
      title: "",
      description: "",
      shortDescription: "",
      campaignType: "other",
      startDate: null,
      endDate: null,
      discountPercent: null,
      scope: null,
      confidence: "low",
    };
  }

  const snippet = text.slice(0, 1200);
  const scope = inferScope(text);
  const campaignType = inferCampaignType(`${title} ${snippet}`);

  const hasParsedDates = Boolean(parsedStart || parsedEnd);
  if (!hasParsedDates && !discountPercent && !strongTitle) {
    return {
      hasPromotion: false,
      title: "",
      description: "",
      shortDescription: "",
      campaignType: "other",
      startDate: null,
      endDate: null,
      discountPercent: null,
      scope: null,
      confidence: "low",
    };
  }

  const fallback = defaultDateRange();
  const resolvedStart = parsedStart ?? fallback.startDate;
  const resolvedEnd = parsedEnd ?? fallback.endDate;
  const confidence: ExtractedPromotion["confidence"] =
    parsedStart && parsedEnd
      ? "high"
      : parsedEnd || discountPercent || strongTitle
        ? "medium"
        : "low";

  const shortDescription =
    [
      discountPercent ? `Do ${discountPercent}% popusta` : null,
      scope ? `Važi za: ${scope}` : null,
      parsedEnd ? `Do ${formatSrDate(parsedEnd)}` : null,
    ]
      .filter(Boolean)
      .join(" · ") || snippet.slice(0, 160);

  return {
    hasPromotion: true,
    title: title.slice(0, 200),
    description: snippet.slice(0, 800),
    shortDescription: shortDescription.slice(0, 300),
    campaignType,
    startDate: resolvedStart,
    endDate: resolvedEnd,
    discountPercent,
    scope,
    confidence,
  };
}

function formatSrDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}.${m}.${y}.`;
}

export async function extractPromotionWithOpenAI(
  html: string,
  pageUrl: string,
  retailerName: string
): Promise<ExtractedPromotion | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const text = htmlToText(html).slice(0, 6000);
  const prompt = `Analiziraj tekst sa sajta prodavca "${retailerName}" (${pageUrl}).
Da li postoji aktivna akcija, popust, sale ili promocija?
Odgovori SAMO validnim JSON objektom:
{
  "hasPromotion": boolean,
  "title": string,
  "description": string (max 400 znakova),
  "shortDescription": string (max 120 znakova, srpski),
  "campaignType": "sale"|"seasonal"|"black_friday"|"clearance"|"new_collection"|"other",
  "startDate": "YYYY-MM-DD"|null,
  "endDate": "YYYY-MM-DD"|null,
  "discountPercent": number|null,
  "scope": string|null
}

Tekst stranice:
${text}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Ti si asistent za retail u Srbiji. Izdvajaš samo stvarne akcije sa datuma ili popusta.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    console.warn(`  OpenAI ${res.status}: ${await res.text()}`);
    return null;
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = body.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content) as Partial<ExtractedPromotion>;
    if (!parsed.hasPromotion) {
      return {
        hasPromotion: false,
        title: "",
        description: "",
        shortDescription: "",
        campaignType: "other",
        startDate: null,
        endDate: null,
        discountPercent: null,
        scope: null,
        confidence: "low",
      };
    }
    const fallback = defaultDateRange();
    return {
      hasPromotion: true,
      title: String(parsed.title ?? "Akcija").slice(0, 200),
      description: String(parsed.description ?? "").slice(0, 800),
      shortDescription: String(parsed.shortDescription ?? "").slice(0, 300),
      campaignType: (parsed.campaignType as DetectedCampaignType) ?? "sale",
      startDate: parsed.startDate ?? fallback.startDate,
      endDate: parsed.endDate ?? fallback.endDate,
      discountPercent:
        typeof parsed.discountPercent === "number"
          ? parsed.discountPercent
          : null,
      scope: parsed.scope ?? null,
      confidence: parsed.startDate && parsed.endDate ? "high" : "medium",
    };
  } catch {
    return null;
  }
}

export function mergeExtractions(
  heuristic: ExtractedPromotion,
  ai: ExtractedPromotion | null
): ExtractedPromotion {
  if (!ai?.hasPromotion) return heuristic;
  if (!heuristic.hasPromotion) return ai;
  if (ai.confidence === "high" && heuristic.confidence !== "high") return ai;
  if (heuristic.confidence === "high") return heuristic;
  return ai.confidence === "medium" ? ai : heuristic;
}
