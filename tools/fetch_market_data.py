#!/usr/bin/env python3
"""Fetch the market backdrop for Felix/August: Treasury yields and ticker quotes.

Sources (both keyless):
  - U.S. Treasury daily par yield curve CSV (home.treasury.gov)
  - Stooq daily history CSV per ticker (stooq.com)

Writes data/market.json, which the site renders on markets.html and in the
signal band. Designed to run inside the scheduled GitHub Action
(.github/workflows/market-data.yml), where network egress is open.

Usage:
  python3 tools/fetch_market_data.py                    # refresh data/market.json
  python3 tools/fetch_market_data.py --output out.json --year 2026
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT = REPO_ROOT / "data" / "market.json"
DEFAULT_TICKERS = REPO_ROOT / "data" / "tickers.json"

TREASURY_URL = (
    "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/"
    "daily-treasury-rates.csv/{year}/all?type=daily_treasury_yield_curve"
    "&field_tdr_date_value={year}&page&_format=csv"
)
STOOQ_HISTORY_URL = "https://stooq.com/q/d/l/?s={symbol}&i=d"

USER_AGENT = "felix-august-market-data/1.0 (+https://github.com/justfetz/felix-august)"


class FetchError(RuntimeError):
    """Raised when a source cannot be fetched or parsed."""


def http_get(url: str, timeout: int = 30) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.read().decode("utf-8", errors="replace")
    except urllib.error.URLError as error:
        raise FetchError(f"could not fetch {url}: {error}") from error


def parse_treasury_csv(text: str) -> list[dict]:
    """Parse the Treasury daily par yield curve CSV into ascending-date rows.

    Returns rows like {"date": "2026-07-02", "y3m": 4.31, "y2": 3.9,
    "y10": 4.4, "y30": 4.8}; tenors missing from the file come back as None.
    """
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames or "Date" not in reader.fieldnames:
        raise FetchError("Treasury CSV is missing the 'Date' column; format may have changed")

    wanted = {"3 Mo": "y3m", "2 Yr": "y2", "10 Yr": "y10", "30 Yr": "y30"}
    rows = []
    for raw in reader:
        date_text = (raw.get("Date") or "").strip()
        if not date_text:
            continue
        try:
            date = datetime.strptime(date_text, "%m/%d/%Y").date().isoformat()
        except ValueError:
            continue
        row: dict = {"date": date}
        for column, key in wanted.items():
            value = (raw.get(column) or "").strip()
            try:
                row[key] = float(value)
            except ValueError:
                row[key] = None
        rows.append(row)

    if not rows:
        raise FetchError("Treasury CSV parsed to zero usable rows")
    rows.sort(key=lambda item: item["date"])
    return rows


def parse_stooq_history_csv(text: str) -> list[dict]:
    """Parse a Stooq daily history CSV into ascending {"date", "close"} rows."""
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames or "Close" not in reader.fieldnames:
        raise FetchError("Stooq CSV is missing the 'Close' column")
    rows = []
    for raw in reader:
        date_text = (raw.get("Date") or "").strip()
        close_text = (raw.get("Close") or "").strip()
        if not date_text or not close_text:
            continue
        try:
            rows.append({"date": date_text, "close": float(close_text)})
        except ValueError:
            continue
    if not rows:
        raise FetchError("Stooq CSV parsed to zero usable rows")
    rows.sort(key=lambda item: item["date"])
    return rows


def quote_from_history(symbol: str, label: str, history: list[dict]) -> dict:
    latest = history[-1]
    previous = history[-2] if len(history) > 1 else None
    change = None
    change_pct = None
    if previous and previous["close"]:
        change = round(latest["close"] - previous["close"], 4)
        change_pct = round(change / previous["close"] * 100, 2)
    return {
        "symbol": symbol,
        "label": label,
        "date": latest["date"],
        "close": latest["close"],
        "dayChange": change,
        "dayChangePct": change_pct,
    }


def fetch_treasury(year: int) -> list[dict]:
    rows = parse_treasury_csv(http_get(TREASURY_URL.format(year=year)))
    if len(rows) < 40:
        # Early in the year the file is short; pad with the prior year so the
        # chart always has enough history to read.
        try:
            prior = parse_treasury_csv(http_get(TREASURY_URL.format(year=year - 1)))
            rows = prior + rows
        except FetchError:
            pass
    return rows


def fetch_quotes(tickers: list[dict]) -> tuple[list[dict], list[str]]:
    quotes, errors = [], []
    for entry in tickers:
        symbol = entry["symbol"]
        stooq_symbol = entry.get("stooq", f"{symbol.lower()}.us")
        try:
            history = parse_stooq_history_csv(http_get(STOOQ_HISTORY_URL.format(symbol=stooq_symbol)))
            quotes.append(quote_from_history(symbol, entry.get("label", ""), history[-10:]))
        except FetchError as error:
            errors.append(f"{symbol}: {error}")
    return quotes, errors


def build_payload(treasury_rows: list[dict], quotes: list[dict], errors: list[str], now: datetime) -> dict:
    latest = treasury_rows[-1]
    spread_2s10s = None
    if latest.get("y10") is not None and latest.get("y2") is not None:
        spread_2s10s = round(latest["y10"] - latest["y2"], 2)
    return {
        "generatedAt": now.replace(microsecond=0).isoformat(),
        "sample": False,
        "sources": {
            "treasury": "U.S. Treasury daily par yield curve (home.treasury.gov)",
            "quotes": "Stooq end-of-day history (stooq.com)",
        },
        "treasury": {
            "latest": latest,
            "spread2s10s": spread_2s10s,
            "series": treasury_rows[-260:],
        },
        "quotes": quotes,
        "errors": errors,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="where to write market.json")
    parser.add_argument("--tickers-file", type=Path, default=DEFAULT_TICKERS, help="JSON list of tracked tickers")
    parser.add_argument("--year", type=int, default=None, help="treasury year to pull (defaults to current)")
    args = parser.parse_args(argv)

    now = datetime.now(timezone.utc)
    year = args.year or now.year

    try:
        tickers = json.loads(args.tickers_file.read_text())["tickers"]
    except (OSError, KeyError, json.JSONDecodeError) as error:
        print(f"error: could not read tickers from {args.tickers_file}: {error}", file=sys.stderr)
        return 2

    try:
        treasury_rows = fetch_treasury(year)
    except FetchError as error:
        print(f"error: treasury fetch failed: {error}", file=sys.stderr)
        return 1

    quotes, errors = fetch_quotes(tickers)
    if errors:
        print("warning: some quotes failed:", file=sys.stderr)
        for line in errors:
            print(f"  {line}", file=sys.stderr)
    if not quotes:
        print("error: every quote fetch failed; refusing to write an empty board", file=sys.stderr)
        return 1

    payload = build_payload(treasury_rows, quotes, errors, now)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {args.output} — 10-yr {payload['treasury']['latest'].get('y10')}%, {len(quotes)} quotes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
