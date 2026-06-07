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

## Ručna zamena (preporučeno)

**Transparent PNG sa crnim logotipom je ispravan** — šahovska tabla u Preview-u znači providnost, ne crnu pozadinu.

Chat ponekad **pokvari binarni fajl** (ceo PNG postane crn kvadrat). Ako ti na Macu izgleda OK, a agent kaže da je pokvaren:

1. Kopiraj fajl u projekat (Finder), npr. `public/logos/incoming/`
2. Instaliraj:

```bash
python3 scripts/install-brand-logo.py replay ~/Downloads/replay-logo.png
python3 scripts/install-brand-logo.py --force slug fajl.png   # samo ako si siguran
```

Skripta uklanja **belu/svetlo sivu** pozadinu (ne crnu), crop, max ~512px, manifest.

Ili ručno: `public/logos/cache/{slug}.png` (binarni copy, bez konverzije).

## Logoi prodavaca

```bash
npm run logos:retailers
```

Preuzima logotipe u `public/logos/retailers/` (Buzz, Office Shoes, Sport Time). Fashion Company koristi `assets/fashion-company/` (FCO ikona + pun logo), ne Kloe sa sajta.
