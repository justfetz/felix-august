import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))

import import_positions as imp

FIXTURES = Path(__file__).parent / "fixtures"


def test_to_number_handles_brokerage_formats():
    assert imp.to_number("$1,234.56") == 1234.56
    assert imp.to_number("-$3.36") == -3.36
    assert imp.to_number("+4.5%") == 4.5
    assert imp.to_number("(12.50)") == -12.50
    assert imp.to_number("--") is None
    assert imp.to_number("") is None
    assert imp.to_number(None) is None


def test_parse_fidelity_skips_pending_and_footer():
    holdings, skipped = imp.parse_fidelity(FIXTURES / "fidelity_sample.csv", "Fidelity")
    symbols = [row["symbol"] for row in holdings]
    assert "MU" in symbols and "SPAXX**" in symbols
    assert all(not symbol.lower().startswith("pending") for symbol in symbols)
    mu = next(row for row in holdings if row["symbol"] == "MU")
    assert mu["marketValueNumber"] == pytest.approx(724.66)
    assert mu["gainNumber"] == pytest.approx(333.35)
    assert mu["brokerage"] == "Fidelity"
    assert mu["dayChange"] == "-$6.90"
    assert any("Pending" in note or "no symbol" in note for note in skipped)


def test_parse_fidelity_rejects_wrong_format(tmp_path):
    bad = tmp_path / "bad.csv"
    bad.write_text("a,b,c\n1,2,3\n")
    with pytest.raises(imp.ImportError_, match="missing columns"):
        imp.parse_fidelity(bad, "Fidelity")


def test_parse_canonical():
    holdings, skipped = imp.parse_canonical(FIXTURES / "canonical_sample.csv", "thinkorswim")
    assert len(holdings) == 2
    chat = next(row for row in holdings if row["symbol"] == "CHAT")
    assert chat["marketValueNumber"] == pytest.approx(1709.80)
    assert chat["brokerage"] == "thinkorswim"
    assert skipped == []


def test_merge_replaces_only_target_brokerage(tmp_path):
    holdings_js = tmp_path / "holdings-data.js"
    existing = [
        {"brokerage": "thinkorswim", "symbol": "OLD1", "marketValueNumber": 1.0},
        {"brokerage": "Fidelity", "symbol": "KEEP", "marketValueNumber": 2.0},
    ]
    holdings_js.write_text(imp.render_holdings_js(existing))

    result = imp.main([
        "--csv", str(FIXTURES / "canonical_sample.csv"),
        "--format", "canonical",
        "--brokerage", "thinkorswim",
        "--holdings-js", str(holdings_js),
    ])
    assert result == 0

    merged = imp.load_existing_holdings(holdings_js)
    symbols = {row["symbol"] for row in merged}
    assert symbols == {"KEEP", "NVDA", "CHAT"}


def test_round_trip_preserves_real_holdings_file():
    real = imp.load_existing_holdings(imp.HOLDINGS_JS)
    assert len(real) >= 80
    rendered = imp.render_holdings_js(real)
    assert json.loads(rendered.split("=", 1)[1].rstrip().rstrip(";")) == real


def test_missing_file_is_a_clean_error(tmp_path):
    with pytest.raises(imp.ImportError_, match="could not read"):
        imp.parse_fidelity(tmp_path / "nope.csv", "Fidelity")
