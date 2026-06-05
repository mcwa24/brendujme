/**
 * OpenAI Vision — čita tekst sa promo banera (datumi, %, opis).
 */

import type { ExtractedPromotion } from "./promo-extract";

async function fetchImageAsDataUrl(imageUrl: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BrendujmePromoBot/1.0)" },
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    return `data:${contentType};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function extractPromotionFromBannerImage(
  imageUrl: string,
  retailerName: string,
  landingUrl: string
): Promise<ExtractedPromotion | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const dataUrl = await fetchImageAsDataUrl(imageUrl);
  if (!dataUrl) return null;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Čitaš promotivne banere srpskih fashion/sport prodavnica. Vraćaš samo JSON sa poljima iz prompta. Datumi u formatu YYYY-MM-DD.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Prodavac: ${retailerName}. Landing: ${landingUrl}.
Na slici je hero baner sa akcijom. Izdvoji:
{
  "hasPromotion": boolean,
  "title": string (kratak naslov, npr. "Letnji mix" ili "Online akcija — do 20%"),
  "description": string (1-2 rečenice, uključi uslove ako ima više nivoa popusta),
  "shortDescription": string (max 120 znakova, srpski),
  "campaignType": "sale"|"seasonal"|"black_friday"|"clearance"|"new_collection"|"other",
  "startDate": "YYYY-MM-DD"|null,
  "endDate": "YYYY-MM-DD"|null,
  "discountPercent": number|null (najveći popust ako ima više, npr. 20 za "3+ artikla"),
  "scope": string|null (npr. "majice, papuče, šortsevi" ili "izdvojena ponuda")
}
Datumi tipa "5-22.6.2026." → startDate 2026-06-05, endDate 2026-06-22.
Ako je samo brend / kolekcija bez popusta i datuma, hasPromotion=false.`,
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    console.warn(`  Vision ${res.status}: ${(await res.text()).slice(0, 200)}`);
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
    return {
      hasPromotion: true,
      title: String(parsed.title ?? "Akcija").slice(0, 200),
      description: String(parsed.description ?? "").slice(0, 800),
      shortDescription: String(parsed.shortDescription ?? "").slice(0, 300),
      campaignType: parsed.campaignType ?? "sale",
      startDate: parsed.startDate ?? null,
      endDate: parsed.endDate ?? null,
      discountPercent:
        typeof parsed.discountPercent === "number"
          ? parsed.discountPercent
          : null,
      scope: parsed.scope ?? null,
      confidence:
        parsed.startDate && parsed.endDate && parsed.discountPercent
          ? "high"
          : "medium",
    };
  } catch {
    return null;
  }
}
