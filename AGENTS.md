# AGENTS.md — Felix/August

Standing rules for coding agents (and future me) working in this repo.
Judgment calls — tone of the letters, what belongs on the site — get
discussed first; the invariants below just get followed.

## What this is

A static GitHub Pages site (CNAME: custom domain) — a journal kept for my
sons, with the finance tools used to keep it. No build step, no framework,
no bundler. Plain HTML + one CSS file + one script. Keep it that way
unless explicitly asked otherwise.

## The shape of the site

It is a journal, not a landing page. One column at a reading measure, flat
paper, a serif for reading and a sans for numbers and labels, dated entries,
numbers in ruled tables, figures captioned like a book. No cards, kickers,
stat tiles, gradients, badges, or taglines. Headings are the size of the
text. If a change makes a page look like a product site, it is wrong.

Pages and what they are for:

- `index.html` — **the ledger**: a dated entry at the top (hand-written; the
  date and the paragraph are the one piece of prose edited when positions are
  refreshed), then the household table, figures, latest letters, tools.
- `holdings.html` — every imported row, one table.
- `markets.html` — the Treasury curve and the household's tickers.
- `tools.html` — the finance tools, one list.
- `letters.html` + `letters/*.html` — the letters, one page each.
- `reading.html` — the shelf, from `books/books.csv`.
- `about.html` — why, what it is not, how it is kept, who writes it.
- `data.html`, `services.html`, `contact.html` — old URLs; meta-refresh
  redirects only. Leave them.

### Adding a letter

1. Copy `letters/_template.html` to `letters/<slug>.html`; write it. Keep the
   `letter` article, the date line, the sign-off, and the `letter-nav`.
2. Add a row at the **top** of `letters.js` (newest first). `date` is
   `YYYY-MM-DD`, or `YYYY-MM` when only the month is certain; the site writes
   it out in words. `tests/test_site.py::test_letters_index_matches_the_files`
   checks that every letter on disk is listed and every listed file exists.

## Invariants

- **Generated files are never edited by hand.** `holdings-data.js`
  (from `tools/import_positions.py`; it also carries `window.holdingsImports`,
  the export date per brokerage that the ledger's provenance line reads),
  `books-data.js` and `books/books.md` (from `tools/build_books.py`), and
  `data/market.json` (from `tools/fetch_market_data.py` via the scheduled
  Action). Edit the source (CSV / script), rerun the tool, commit both.
  `letters.js` is hand-kept, not generated.
- **No number on a page is typed.** Everything derives from the generated
  files at load. The exceptions, and the only ones: `CONTRIBUTION_LEDGER` in
  `script.js` (what went in; no export carries it) and the prose of the
  entry at the top of the ledger.
- **No API keys in the browser, ever.** Market data flows through the
  scheduled GitHub Action into `data/market.json`. If a new data source
  needs a key, it belongs in an Action secret, not in client JS.
- **Every page shares the same chrome**: brand, the six-link nav (Ledger,
  Markets, Tools, Letters, Reading, About; `../`-prefixed inside `letters/`),
  footer. `tests/test_site.py::test_nav_is_consistent` enforces it.
- **Asset URLs carry a `?v=` cache-bust version.** Bump the version on
  every CSS/JS change (currently `20261019`) across all pages at once;
  `test_cache_bust_is_uniform` catches a page left behind.
- **Raw brokerage CSVs stay out of git by default** (`data/imports/*.csv`
  is gitignored — they carry account names). Committing one is a
  deliberate act, not a side effect.
- **Tone**: the writing is a father talking to his sons — plain,
  unhurried, no finance-bro voice, no marketing voice. No exclamation
  points. Don't add copy that sounds like a brokerage page.
- **thinkorswim + Fidelity are separate sleeves.** The import tool
  replaces one brokerage's rows at a time; never regenerate one sleeve
  from the other's export.

## Refreshing positions

```bash
python3 tools/import_positions.py --csv data/imports/Portfolio_Positions_Oct-18-2026.csv --format fidelity --brokerage Fidelity
python3 tools/import_positions.py --csv data/imports/Individual-Positions-2026-10-18-115328.csv --format schwab --brokerage thinkorswim
```

The export date is read from the file name (`--as-of YYYY-MM-DD` to override).
Then rewrite the dated entry at the top of `index.html` in your own words.

## Before pushing

```bash
pytest tests/                  # 80+ checks: data integrity, nav, cache-bust, letters index, JS syntax, tooling
python3 tools/build_books.py   # if books.csv changed (CI diffs the artifacts)
```

CI (`.github/workflows/ci.yml`) runs the same suite on every push.

## Related work

The operations-research repos (transportation/transshipment etc.) are
**separate repositories** with their own AGENTS.md files — nothing here
applies there, and nothing about this repo's data pipelines should be
copied into them without asking. Talk to My Machine is a separate business
and never appears here.
