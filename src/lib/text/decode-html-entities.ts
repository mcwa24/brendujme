/** Dekodira HTML entitete u običan tekst (uključujući &#x20; i dvostruko &amp;). */
export function decodeHtmlEntities(text: string): string {
  if (!text) return text;

  let result = text;
  for (let i = 0; i < 2; i += 1) {
    result = result.replace(/&amp;/gi, "&");
  }

  return result
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) =>
      String.fromCodePoint(Number.parseInt(dec, 10))
    )
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}
