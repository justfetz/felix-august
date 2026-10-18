#!/usr/bin/env python3
"""Regenerate holdings-data.js from brokerage CSV exports.

Drop a fresh export into data/imports/ and run this tool. It replaces the rows
for that brokerage inside holdings-data.js while leaving the other brokerage's
rows untouched, so the two sleeves can be refreshed independently.

Supported inputs:
  - Fidelity "Portfolio_Positions_MMM-DD-YYYY.csv" exports (--format fidelity);
    header capitalization changed in late 2026, so columns match case-insensitively
  - Schwab / thinkorswim "Individual-Positions-YYYY-MM-DD-HHMMSS.csv" exports
    (--format schwab): the account banner line, the Cash row and the Positions
    Total row are skipped
  - The canonical Felix/August schema documented in data/imports/README.md
    (--format canonical), for anything else you massage by hand

Usage:
  python3 tools/import_positions.py --csv data/imports/Portfolio_Positions_Jul-06-2026.csv \
      --format fidelity --brokerage Fidelity
  python3 tools/import_positions.py --csv data/imports/Individual-Positions-2026-10-18-115328.csv \
      --format schwab --brokerage thinkorswim
  python3 tools/import_positions.py --csv file.csv --format fidelity --brokerage Fidelity --dry-run
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
HOLDINGS_JS = REPO_ROOT / "holdings-data.js"

CANONICAL_FIELDS = [
    "brokerage", "accountName", "symbol", "description", "quantity", "price",
    "priceChange", "marketValue", "marketValueNumber", "dayChange",
    "dayChangePct", "costBasis", "gain", "gainNumber", "gainPct",
    "accountWeight", "averageCostBasis", "assetType", "reinvest",
    "reinvestCapitalGains",
]

FIDELITY_REQUIRED = ["symbol", "description", "quantity", "last price", "current value"]
SCHWAB_REQUIRED = ["symbol", "description", "qty (quantity)", "price", "mkt val (market value)"]
SCHWAB_SKIP_SYMBOLS = {"cash & cash investments", "positions total", "account total"}


def fold(row: dict) -> dict:
    """Lower-case and trim a CSV row's keys so header capitalization changes don't break imports."""
    return {(key or "").strip().lower(): value for key, value in row.items()}


class ImportError_(ValueError):
    """Raised with a human-readable message when an export cannot be parsed."""


def to_number(value: str | None) -> float | None:
    """'$1,234.56' / '-$3.36' / '+4.5%' / '--' -> float or None."""
    if value is None:
        return None
    cleaned = str(value).strip().replace("$", "").replace(",", "").replace("%", "")
    cleaned = cleaned.replace("(", "-").replace(")", "")
    if cleaned in ("", "--", "-", "N/A", "n/a"):
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def signed_currency(value: float | None) -> str:
    if value is None:
        return ""
    sign = "+" if value >= 0 else "-"
    return f"{sign}${abs(value):,.2f}"


def currency(value: float | None) -> str:
    if value is None:
        return ""
    if value < 0:
        return f"-${abs(value):,.2f}"
    return f"${value:,.2f}"


def signed_percent(value: float | None) -> str:
    if value is None:
        return ""
    sign = "+" if value >= 0 else ""
    return f"{sign}{value:.2f}%"


def read_csv_rows(path: Path) -> list[dict]:
    """Read a CSV while skipping Fidelity's blank lines and footer disclaimers."""
    try:
        text = path.read_text(encoding="utf-8-sig")
    except OSError as error:
        raise ImportError_(f"could not read {path}: {error}") from error
    except UnicodeDecodeError:
        text = path.read_text(encoding="latin-1")

    lines = [line for line in text.splitlines() if line.strip()]
    if not lines:
        raise ImportError_(f"{path} is empty")

    # Fidelity appends prose disclaimers after the data. Keep only lines that
    # look like CSV rows (contain a comma) once the header is found.
    reader = csv.DictReader(io_lines(lines))
    if reader.fieldnames is None:
        raise ImportError_(f"{path} has no header row")
    return [row for row in reader if any((v or "").strip() for v in row.values())]


def io_lines(lines: list[str]):
    import io
    return io.StringIO("\n".join(lines))


def parse_fidelity(path: Path, brokerage: str) -> tuple[list[dict], list[str]]:
    rows = read_csv_rows(path)
    if not rows:
        raise ImportError_(f"{path}: no data rows found")

    rows = [fold(row) for row in rows]
    header = list(rows[0].keys())
    missing = [column for column in FIDELITY_REQUIRED if column not in header]
    if missing:
        raise ImportError_(
            f"{path} does not look like a Fidelity positions export; "
            f"missing columns: {', '.join(missing)}. Found: {', '.join(h for h in header if h)}"
        )

    holdings = []
    skipped = []
    for index, row in enumerate(rows, start=2):
        symbol = (row.get("symbol") or "").strip()
        if not symbol or symbol.lower().startswith("pending"):
            skipped.append(f"line {index}: no symbol ({row.get('description', '')!r})")
            continue

        value_number = to_number(row.get("current value"))
        gain_number = to_number(row.get("total gain/loss dollar"))
        day_change = to_number(row.get("today's gain/loss dollar"))
        day_pct = to_number(row.get("today's gain/loss percent"))
        gain_pct = to_number(row.get("total gain/loss percent"))
        price_change = to_number(row.get("last price change"))

        holdings.append({
            "brokerage": brokerage,
            "accountName": (row.get("account name") or "Individual").strip(),
            "symbol": symbol,
            "description": (row.get("description") or "").strip(),
            "quantity": (row.get("quantity") or "").strip(),
            "price": (row.get("last price") or "").strip(),
            "priceChange": signed_currency(price_change) if price_change is not None else "",
            "marketValue": currency(value_number),
            "marketValueNumber": value_number,
            "dayChange": signed_currency(day_change) if day_change is not None else "",
            "dayChangePct": signed_percent(day_pct),
            "costBasis": (row.get("cost basis total") or "").strip(),
            "gain": signed_currency(gain_number) if gain_number is not None else "",
            "gainNumber": gain_number,
            "gainPct": signed_percent(gain_pct),
            "accountWeight": (row.get("percent of account") or "").strip(),
            "averageCostBasis": (row.get("average cost basis") or "").strip(),
            "assetType": (row.get("type") or "").strip(),
            "reinvest": "",
            "reinvestCapitalGains": "",
        })

    if not holdings:
        raise ImportError_(f"{path}: every row was skipped — is this the right export?")
    return holdings, skipped


def read_schwab_rows(path: Path) -> list[dict]:
    """Schwab's export opens with a one-cell banner ('Positions for account ... as of ...')
    and a blank line before the header. Drop everything up to the header row."""
    try:
        text = path.read_text(encoding="utf-8-sig")
    except OSError as error:
        raise ImportError_(f"could not read {path}: {error}") from error
    except UnicodeDecodeError:
        text = path.read_text(encoding="latin-1")
    lines = [line for line in text.splitlines() if line.strip()]
    start = next((i for i, line in enumerate(lines) if line.lower().startswith('"symbol"') or line.lower().startswith("symbol,")), None)
    if start is None:
        raise ImportError_(f"{path} has no 'Symbol' header row; is this a Schwab/thinkorswim positions export?")
    reader = csv.DictReader(io_lines(lines[start:]))
    return [fold(row) for row in reader if any((v or "").strip() for v in row.values())]


def parse_schwab(path: Path, brokerage: str) -> tuple[list[dict], list[str]]:
    rows = read_schwab_rows(path)
    if not rows:
        raise ImportError_(f"{path}: no data rows found")
    header = list(rows[0].keys())
    missing = [column for column in SCHWAB_REQUIRED if column not in header]
    if missing:
        raise ImportError_(
            f"{path} does not look like a Schwab/thinkorswim positions export; "
            f"missing columns: {', '.join(missing)}. Found: {', '.join(h for h in header if h)}"
        )
    holdings, skipped = [], []
    for index, row in enumerate(rows, start=2):
        symbol = (row.get("symbol") or "").strip()
        if not symbol or symbol.lower() in SCHWAB_SKIP_SYMBOLS:
            skipped.append(f"line {index}: {symbol or 'no symbol'} ({row.get('mkt val (market value)', '')})")
            continue
        value_number = to_number(row.get("mkt val (market value)"))
        gain_number = to_number(row.get("gain $ (gain/loss $)"))
        day_change = to_number(row.get("day chng $ (day change $)"))
        day_pct = to_number(row.get("day chng % (day change %)"))
        gain_pct = to_number(row.get("gain % (gain/loss %)"))
        price_change = to_number(row.get("price chng $ (price change $)"))
        holdings.append({
            "brokerage": brokerage,
            "accountName": "Individual",
            "symbol": symbol,
            "description": (row.get("description") or "").strip(),
            "quantity": (row.get("qty (quantity)") or "").strip(),
            "price": (row.get("price") or "").strip(),
            "priceChange": signed_currency(price_change) if price_change is not None else "",
            "marketValue": currency(value_number),
            "marketValueNumber": value_number,
            "dayChange": signed_currency(day_change) if day_change is not None else "",
            "dayChangePct": signed_percent(day_pct),
            "costBasis": (row.get("cost basis") or "").strip(),
            "gain": signed_currency(gain_number) if gain_number is not None else "",
            "gainNumber": gain_number,
            "gainPct": signed_percent(gain_pct),
            "accountWeight": "",
            "averageCostBasis": "",
            "assetType": (row.get("asset type") or "").strip(),
            "reinvest": (row.get("reinvest?") or "").strip(),
            "reinvestCapitalGains": (row.get("reinvest capital gains?") or "").strip(),
        })
    if not holdings:
        raise ImportError_(f"{path}: every row was skipped — is this the right export?")
    return holdings, skipped


def parse_canonical(path: Path, brokerage: str) -> tuple[list[dict], list[str]]:
    rows = read_csv_rows(path)
    required = ["symbol", "description", "quantity", "price", "marketValue"]
    header = list(rows[0].keys()) if rows else []
    missing = [column for column in required if column not in header]
    if missing:
        raise ImportError_(
            f"{path}: canonical schema requires columns {', '.join(required)}; "
            f"missing: {', '.join(missing)}. See data/imports/README.md."
        )
    holdings, skipped = [], []
    for index, row in enumerate(rows, start=2):
        symbol = (row.get("symbol") or "").strip()
        if not symbol:
            skipped.append(f"line {index}: no symbol")
            continue
        entry = {field: (row.get(field) or "").strip() for field in CANONICAL_FIELDS}
        entry["brokerage"] = brokerage
        entry["accountName"] = entry["accountName"] or "Individual"
        entry["marketValueNumber"] = to_number(row.get("marketValueNumber") or row.get("marketValue"))
        entry["gainNumber"] = to_number(row.get("gainNumber") or row.get("gain"))
        holdings.append(entry)
    if not holdings:
        raise ImportError_(f"{path}: every row was skipped — check the file contents")
    return holdings, skipped


def load_existing_holdings(js_path: Path) -> list[dict]:
    """Parse window.allHoldingsDetail = [...] out of holdings-data.js."""
    try:
        text = js_path.read_text()
    except OSError as error:
        raise ImportError_(f"could not read {js_path}: {error}") from error
    match = re.search(r"window\.allHoldingsDetail\s*=\s*(\[.*\])\s*;", text, re.DOTALL)
    if not match:
        raise ImportError_(f"{js_path} does not contain 'window.allHoldingsDetail = [...];'")
    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError as error:
        raise ImportError_(f"could not parse the holdings array in {js_path}: {error}") from error


def render_holdings_js(holdings: list[dict]) -> str:
    body = json.dumps(holdings, indent=4)
    return f"window.allHoldingsDetail = {body};\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--csv", type=Path, required=True, help="brokerage export to import")
    parser.add_argument("--format", choices=["fidelity", "schwab", "canonical"], required=True)
    parser.add_argument("--brokerage", required=True, help="brokerage label, e.g. Fidelity or thinkorswim")
    parser.add_argument("--holdings-js", type=Path, default=HOLDINGS_JS)
    parser.add_argument("--dry-run", action="store_true", help="report what would change without writing")
    args = parser.parse_args(argv)

    try:
        if args.format == "fidelity":
            new_rows, skipped = parse_fidelity(args.csv, args.brokerage)
        elif args.format == "schwab":
            new_rows, skipped = parse_schwab(args.csv, args.brokerage)
        else:
            new_rows, skipped = parse_canonical(args.csv, args.brokerage)
        existing = load_existing_holdings(args.holdings_js)
    except ImportError_ as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    kept = [row for row in existing if row.get("brokerage") != args.brokerage]
    replaced = len(existing) - len(kept)
    merged = kept + new_rows

    total_value = sum(row.get("marketValueNumber") or 0 for row in new_rows)
    print(f"{args.csv.name}: parsed {len(new_rows)} {args.brokerage} positions "
          f"(${total_value:,.2f} market value), replacing {replaced} existing rows")
    for line in skipped:
        print(f"  skipped {line}")

    if args.dry_run:
        print("dry run — holdings-data.js not modified")
        return 0

    args.holdings_js.write_text(render_holdings_js(merged))
    print(f"wrote {args.holdings_js} with {len(merged)} total rows")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
