# AGENTS.md — Felix/August

Standing rules for coding agents (and future me) working in this repo.
Judgment calls — tone of the letters, what belongs on the site — get
discussed first; the invariants below just get followed.

## What this is

A static GitHub Pages site (CNAME: custom domain) — a long-horizon
investment journal written for my sons. No build step, no framework,
no bundler. Plain HTML + one CSS file + vanilla JS. Keep it that way
unless explicitly asked otherwise.

## Invariants

- **Generated files are never edited by hand.** `holdings-data.js`
  (from `tools/import_positions.py`), `books-data.js` and `books/books.md`
  (from `tools/build_books.py`), and `data/market.json` (from
  `tools/fetch_market_data.py` via the scheduled Action). Edit the
  source (CSV / script), rerun the tool, commit both.
- **No API keys in the browser, ever.** Market data flows through the
  scheduled GitHub Action into `data/market.json`. If a new data source
  needs a key, it belongs in an Action secret, not in client JS.
- **Every page shares the same chrome**: brand, nav (7 links: Home, Why
  This Exists, Themes, All Holdings, Markets, Reading, Notes), nav-toggle
  button, footer. `tests/test_site.py::test_nav_is_consistent` enforces it.
- **Asset URLs carry a `?v=` cache-bust version.** Bump the version on
  every CSS/JS change (currently `20260706a`) across all pages at once.
- **Raw brokerage CSVs stay out of git by default** (`data/imports/*.csv`
  is gitignored — they carry account names). Committing one is a
  deliberate act, not a side effect.
- **Tone**: the writing is a father talking to his sons — plain,
  unhurried, no finance-bro voice. Don't add copy that sounds like a
  brokerage marketing page.
- **thinkorswim + Fidelity are separate sleeves.** The import tool
  replaces one brokerage's rows at a time; never regenerate one sleeve
  from the other's export.

## Before pushing

```bash
pytest tests/            # 39+ checks: data integrity, nav, JS syntax, tooling
python3 tools/build_books.py   # if books.csv changed (CI diffs the artifacts)
```

CI (`.github/workflows/ci.yml`) runs the same suite on every push.

## Related work

The operations-research repos (transportation/transshipment etc.) are
**separate repositories** with their own AGENTS.md files — nothing here
applies there, and nothing about this repo's data pipelines should be
copied into them without asking.
