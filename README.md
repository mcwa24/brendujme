# Bilbord Brands

Premium platforma za otkrivanje brenda dostupnih u Srbiji — retail inteligencija, ne e-commerce.

## Tech stack

- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Framer Motion
- Lucide icons

## Pokretanje

```bash
npm install
npm run dev
```

Otvorite [http://localhost:3000](http://localhost:3000).

## Struktura

- `/` — Početna (hero, brendovi, kategorije, TC, vesti, statistika, newsletter)
- `/brands` — Direktorijum brenda sa filterima
- `/brands/[slug]` — Profil brenda
- `/categories/[slug]` — Brendovi po kategoriji
- `/retailers` — Prodavci
- `/shopping-centers/[slug]` — Tržni centri
- `/news` — Retail vesti

Globalna pretraga: `⌘K` / `Ctrl+K`

## Logoi brenda

Prioritet: upload → `logoUrl` → keš (`npm run logos:cache`) → typography placeholder.

Logoi se **ne učitavaju sa interneta pri svakom request-u** — samo iz `public/logos/` i `logo-manifest.json`.

## Mock podaci

- 20 brenda
- 10 tržnih centara
- 15 prodavaca
- 20 vesti

Jezik UI: srpski (latinica).
