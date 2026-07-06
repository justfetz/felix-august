#!/usr/bin/env python3
"""Build the reading-lens assets from books/books.csv.

Converts the CSV shelf into two artifacts:
  - books/books.md   — a markdown rendering of the shelf (the "markitdown" lens)
  - books-data.js    — window.readingShelf, rendered by reading.html

The CSV can come from anywhere (Goodreads export massaged down, a hand-kept
sheet, etc.) as long as it has: title, author, year, theme, status, takeaway.
Status must be one of: reading, finished, queued.

Usage:
  python3 tools/build_books.py
  python3 tools/build_books.py --csv books/books.csv --check   # validate only
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CSV = REPO_ROOT / "books" / "books.csv"
DEFAULT_MD = REPO_ROOT / "books" / "books.md"
DEFAULT_JS = REPO_ROOT / "books-data.js"

REQUIRED = ["title", "author", "year", "theme", "status", "takeaway"]
STATUSES = ["reading", "finished", "queued"]
STATUS_HEADINGS = {
    "reading": "Currently reading",
    "finished": "Finished",
    "queued": "On the shelf",
}


def load_books(csv_path: Path) -> list[dict]:
    try:
        text = csv_path.read_text(encoding="utf-8-sig")
    except OSError as error:
        raise ValueError(f"could not read {csv_path}: {error}") from error

    reader = csv.DictReader(text.splitlines())
    header = reader.fieldnames or []
    missing = [column for column in REQUIRED if column not in header]
    if missing:
        raise ValueError(
            f"{csv_path} is missing columns: {', '.join(missing)} "
            f"(required: {', '.join(REQUIRED)})"
        )

    books, problems = [], []
    for index, row in enumerate(reader, start=2):
        title = (row.get("title") or "").strip()
        if not title:
            continue
        status = (row.get("status") or "").strip().lower()
        if status not in STATUSES:
            problems.append(f"line {index}: status {status!r} is not one of {STATUSES}")
            continue
        books.append({
            "title": title,
            "author": (row.get("author") or "").strip(),
            "year": (row.get("year") or "").strip(),
            "theme": (row.get("theme") or "").strip(),
            "status": status,
            "takeaway": (row.get("takeaway") or "").strip(),
        })

    if problems:
        raise ValueError(f"{csv_path} has invalid rows:\n  " + "\n  ".join(problems))
    if not books:
        raise ValueError(f"{csv_path} contains no books")
    return books


def render_markdown(books: list[dict]) -> str:
    lines = [
        "# The reading lens",
        "",
        "What I'm reading to understand what I own. Generated from `books.csv`",
        "by `tools/build_books.py` — edit the CSV, not this file.",
        "",
    ]
    for status in STATUSES:
        group = [book for book in books if book["status"] == status]
        if not group:
            continue
        lines.append(f"## {STATUS_HEADINGS[status]}")
        lines.append("")
        for book in group:
            year = f", {book['year']}" if book["year"] else ""
            lines.append(f"### {book['title']} — {book['author']}{year}")
            lines.append("")
            if book["theme"]:
                lines.append(f"*Theme: {book['theme']}*")
                lines.append("")
            if book["takeaway"]:
                lines.append(f"> {book['takeaway']}")
                lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def render_js(books: list[dict]) -> str:
    return f"window.readingShelf = {json.dumps(books, indent=4)};\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--csv", type=Path, default=DEFAULT_CSV)
    parser.add_argument("--md-out", type=Path, default=DEFAULT_MD)
    parser.add_argument("--js-out", type=Path, default=DEFAULT_JS)
    parser.add_argument("--check", action="store_true", help="validate the CSV without writing")
    args = parser.parse_args(argv)

    try:
        books = load_books(args.csv)
    except ValueError as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    if args.check:
        print(f"{args.csv} OK — {len(books)} books")
        return 0

    args.md_out.write_text(render_markdown(books))
    args.js_out.write_text(render_js(books))
    print(f"wrote {args.md_out} and {args.js_out} ({len(books)} books)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
