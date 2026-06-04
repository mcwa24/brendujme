# Logoi brenda

## Prioritet (runtime — bez mrežnih zahteva)

1. **Upload** — `public/logos/{slug}.png` + `hasCustomLogo: true` u podacima
2. **logoUrl** — polje u podacima / budućoj bazi
3. **Keš** — `public/logos/cache/{slug}.png` + `logo-manifest.json`
4. **Placeholder** — tipografija (prvo slovo + naziv)

## Otkrivanje logoa (offline)

```bash
npm run logos:cache
```

Skripta parsira sajt brenda (favicon, apple-touch-icon, OpenGraph, SVG), čuva lokalno i ažurira `src/lib/data/logo-manifest.json`.

## Ručna zamena

Stavite PNG u `public/logos/zara.png`, zatim pokrenite `npm run logos:cache`.

## Logoi prodavaca

```bash
npm run logos:retailers
```

Preuzima logotipe u `public/logos/retailers/` (Buzz, Office Shoes, Sport Time). Fashion Company koristi `assets/fashion-company/` (FCO ikona + pun logo), ne Kloe sa sajta.
