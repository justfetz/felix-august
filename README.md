# Felix/August

[![CI](https://github.com/justfetz/felix-august/actions/workflows/ci.yml/badge.svg)](https://github.com/justfetz/felix-august/actions/workflows/ci.yml)
[![Market data](https://github.com/justfetz/felix-august/actions/workflows/market-data.yml/badge.svg)](https://github.com/justfetz/felix-august/actions/workflows/market-data.yml)

Felix/August is a long-term investment journal built for my sons — a durable
record of what the household owns, why, and what I was reading and thinking
while it was built.

It is a static site (GitHub Pages, no framework, no build step) with a small
amount of honest plumbing behind it.

## Pages

| Page | What it holds |
| --- | --- |
| `index.html` | Household snapshot: stats, account breakdown, charts, theme allocation |
| `data.html` | The complete imported holdings archive, filterable by brokerage |
| `markets.html` | The backdrop: 10-yr Treasury yield chart, curve stats, tracked-ticker quote board |
| `reading.html` | The reading lens — books with one takeaway each, generated from CSV |
| `contact.html` | Letters to Felix and August, including "The order of money" |
| `about.html`, `services.html` | The why and the research themes |

## Plumbing

### Market data (keyless, no secrets in the browser)

A scheduled GitHub Action (`.github/workflows/market-data.yml`, weekday
evenings) runs `tools/fetch_market_data.py`, which pulls:

- the **daily Treasury par yield curve** from home.treasury.gov (3-mo, 2-yr,
  10-yr, 30-yr), and
- **end-of-day quotes** from Stooq for the tickers in `data/tickers.json`,

then commits `data/market.json`. The site fetches that file client-side —
no API keys anywhere. Until the first scheduled run lands, the committed
file is flagged `"sample": true` and the Markets page says so.

### Holdings imports

Fresh brokerage exports drop into `data/imports/` (gitignored by default)
and regenerate `holdings-data.js`:

```bash
python3 tools/import_positions.py \
    --csv data/imports/Portfolio_Positions_Jul-06-2026.csv \
    --format fidelity --brokerage Fidelity
```

The importer validates the export, skips pending-activity rows and footer
disclaimers, and replaces only that brokerage's rows — the other sleeve is
untouched. A documented canonical CSV schema (`data/imports/README.md`)
covers thinkorswim or anything else. `--dry-run` previews.

### The reading lens

`books/books.csv` is the source of truth — one row per book. Then:

```bash
python3 tools/build_books.py
```

regenerates `books/books.md` (the markdown lens) and `books-data.js`
(rendered by `reading.html`). CI fails if the generated files drift from
the CSV.

## Tests

```bash
pip install pytest pyyaml
pytest tests/
```

The suite covers the import/fetch/books tooling (including malformed-input
errors), data-file schemas, JS syntax (`node --check`), nav consistency
across pages, and that every locally referenced asset exists. CI runs it
on every push (`.github/workflows/ci.yml`).

## Conventions

See `AGENTS.md` for the repo's standing rules (generated files, cache-bust
versions, tone, what stays out of git).

## Relationship to my other work

Felix/August is separate from my operations-research and industrial-AI
work, which lives in its own repositories under **Talk to My Machine**.
This is the personal side of the same systems mindset: durable businesses,
critical infrastructure, long-term value.
