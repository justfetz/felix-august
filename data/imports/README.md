# Brokerage imports

Drop fresh brokerage exports in this folder, then regenerate `holdings-data.js`:

```bash
# Fidelity: use the Positions page's "Download" button, no editing needed
python3 tools/import_positions.py \
    --csv data/imports/Portfolio_Positions_Jul-06-2026.csv \
    --format fidelity --brokerage Fidelity

# thinkorswim (or anything else): convert to the canonical schema below first
python3 tools/import_positions.py \
    --csv data/imports/tos-positions.csv \
    --format canonical --brokerage thinkorswim
```

The import replaces only the named brokerage's rows, so refreshing one sleeve
never disturbs the other. Add `--dry-run` to preview without writing.

## Canonical schema

A CSV with a header row containing at least:

```
symbol,description,quantity,price,marketValue
```

Optional columns (matching the fields in `holdings-data.js`):
`accountName, priceChange, marketValueNumber, dayChange, dayChangePct,
costBasis, gain, gainNumber, gainPct, accountWeight, averageCostBasis,
assetType, reinvest, reinvestCapitalGains`

Currency-ish values can keep their `$`, `,`, `%`, and `()` formatting — the
importer normalizes numbers itself.

CSV exports in this folder are gitignored by default (they contain account
names); commit them deliberately if you want them in history.
