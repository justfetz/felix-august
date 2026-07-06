import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))

import build_books as bb

REPO = Path(__file__).resolve().parent.parent


def test_repo_books_csv_is_valid():
    books = bb.load_books(REPO / "books" / "books.csv")
    assert books
    for book in books:
        assert book["status"] in bb.STATUSES


def test_generated_artifacts_are_current():
    """books.md and books-data.js must match the CSV — regenerate if this fails."""
    books = bb.load_books(REPO / "books" / "books.csv")
    assert (REPO / "books" / "books.md").read_text() == bb.render_markdown(books)
    assert (REPO / "books-data.js").read_text() == bb.render_js(books)


def test_invalid_status_is_rejected(tmp_path):
    bad = tmp_path / "books.csv"
    bad.write_text("title,author,year,theme,status,takeaway\nX,Y,2020,Z,abandoned,meh\n")
    with pytest.raises(ValueError, match="abandoned"):
        bb.load_books(bad)


def test_missing_columns_rejected(tmp_path):
    bad = tmp_path / "books.csv"
    bad.write_text("title,author\nX,Y\n")
    with pytest.raises(ValueError, match="missing columns"):
        bb.load_books(bad)


def test_markdown_groups_by_status(tmp_path):
    csv_file = tmp_path / "books.csv"
    csv_file.write_text(
        "title,author,year,theme,status,takeaway\n"
        "A,AA,2020,T,finished,done\n"
        "B,BB,2021,T,reading,now\n"
        "C,CC,2022,T,queued,later\n"
    )
    markdown = bb.render_markdown(bb.load_books(csv_file))
    assert markdown.index("Currently reading") < markdown.index("## Finished") < markdown.index("On the shelf")
