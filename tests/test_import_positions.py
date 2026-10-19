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


def test_round_trip_preserves_real_holdings_file(tmp_path):
    real = imp.load_existing_holdings(imp.HOLDINGS_JS)
    dates = imp.load_import_dates(imp.HOLDINGS_JS)
    assert len(real) >= 80
    out = tmp_path / "holdings-data.js"
    out.write_text(imp.render_holdings_js(real, dates))
    assert imp.load_existing_holdings(out) == real
    assert imp.load_import_dates(out) == dates


def test_export_date_comes_from_the_file_name():
    assert imp.export_date_from_name(Path("Portfolio_Positions_Oct-18-2026.csv")) == "2026-10-18"
    assert imp.export_date_from_name(Path("Individual-Positions-2026-10-18-115328.csv")) == "2026-10-18"
    assert imp.export_date_from_name(Path("thinkorswim_2026-07-06.tsv")) == "2026-07-06"
    assert imp.export_date_from_name(Path("positions.csv")) is None


def test_import_records_the_export_date(tmp_path):
    holdings_js = tmp_path / "holdings-data.js"
    holdings_js.write_text(imp.render_holdings_js([{"brokerage": "Fidelity", "symbol": "KEEP", "marketValueNumber": 2.0}],
                                                  {"Fidelity": "2026-01-02"}))
    assert imp.main(["--csv", str(FIXTURES / "canonical_sample.csv"), "--format", "canonical",
                     "--brokerage", "thinkorswim", "--holdings-js", str(holdings_js), "--as-of", "2026-10-18"]) == 0
    assert imp.load_import_dates(holdings_js) == {"Fidelity": "2026-01-02", "thinkorswim": "2026-10-18"}
    assert {row["symbol"] for row in imp.load_existing_holdings(holdings_js)} == {"KEEP", "NVDA", "CHAT"}


def test_missing_file_is_a_clean_error(tmp_path):
    with pytest.raises(imp.ImportError_, match="could not read"):
        imp.parse_fidelity(tmp_path / "nope.csv", "Fidelity")


def test_parse_fidelity_accepts_recapitalized_headers():
    """Fidelity changed 'Last Price' to 'Last price' (etc.) in late 2026; columns match case-insensitively."""
    holdings, _ = imp.parse_fidelity(FIXTURES / "fidelity_sample_2026_10.csv", "Fidelity")
    mu = next(row for row in holdings if row["symbol"] == "MU")
    assert mu["marketValueNumber"] == pytest.approx(724.66)
    assert mu["price"] == "$118.72"
    assert mu["costBasis"] == "$391.31"


def test_parse_schwab_skips_banner_cash_and_total():
    holdings, skipped = imp.parse_schwab(FIXTURES / "schwab_sample.csv", "thinkorswim")
    assert [row["symbol"] for row in holdings] == ["AMD", "SLV"]
    amd = holdings[0]
    assert amd["marketValueNumber"] == pytest.approx(1057.50)
    assert amd["gainNumber"] == pytest.approx(482.67)
    assert amd["dayChange"] == "-$66.96"
    assert amd["gainPct"] == "+83.97%"
    assert amd["assetType"] == "Equity"
    assert amd["brokerage"] == "thinkorswim"
    # positions + cash reconcile to the export's own total
    assert sum(r["marketValueNumber"] for r in holdings) + 359.14 == pytest.approx(1519.66)
    assert any("Cash" in note for note in skipped) and any("Positions Total" in note for note in skipped)


def test_parse_schwab_rejects_wrong_format(tmp_path):
    bad = tmp_path / "bad.csv"
    bad.write_text("Symbol,Foo\nAMD,1\n")
    with pytest.raises(imp.ImportError_, match="missing columns"):
        imp.parse_schwab(bad, "thinkorswim")
    nohdr = tmp_path / "nohdr.csv"
    nohdr.write_text("just a banner\n\nno header here\n")
    with pytest.raises(imp.ImportError_, match="no 'Symbol' header"):
        imp.parse_schwab(nohdr, "thinkorswim")
