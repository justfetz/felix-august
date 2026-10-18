import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))

import fetch_market_data as fmd

FIXTURES = Path(__file__).parent / "fixtures"


def test_parse_treasury_csv_sorts_ascending_and_maps_tenors():
    rows = fmd.parse_treasury_csv((FIXTURES / "treasury_sample.csv").read_text())
    assert [row["date"] for row in rows] == ["2026-06-30", "2026-07-01", "2026-07-02"]
    latest = rows[-1]
    assert latest["y10"] == pytest.approx(4.28)
    assert latest["y2"] == pytest.approx(3.88)
    assert latest["y3m"] == pytest.approx(4.41)
    assert latest["y30"] == pytest.approx(4.72)


def test_parse_treasury_csv_rejects_wrong_format():
    with pytest.raises(fmd.FetchError, match="Date"):
        fmd.parse_treasury_csv("foo,bar\n1,2\n")


def test_parse_stooq_history_and_quote():
    history = fmd.parse_stooq_history_csv((FIXTURES / "stooq_sample.csv").read_text())
    assert history[-1]["close"] == pytest.approx(172.50)
    quote = fmd.quote_from_history("NVDA", "AI compute", history)
    assert quote["dayChange"] == pytest.approx(172.50 - 173.80)
    assert quote["dayChangePct"] == pytest.approx((172.50 - 173.80) / 173.80 * 100, abs=0.01)
    assert quote["date"] == "2026-07-02"


def test_parse_stooq_rejects_empty():
    with pytest.raises(fmd.FetchError):
        fmd.parse_stooq_history_csv("Date,Open,High,Low,Close,Volume\n")


def test_build_payload_shape():
    treasury = fmd.parse_treasury_csv((FIXTURES / "treasury_sample.csv").read_text())
    history = fmd.parse_stooq_history_csv((FIXTURES / "stooq_sample.csv").read_text())
    quotes = [fmd.quote_from_history("NVDA", "AI compute", history)]
    now = datetime(2026, 7, 6, 22, 30, tzinfo=timezone.utc)

    payload = fmd.build_payload(treasury, quotes, [], now)

    assert payload["sample"] is False
    assert payload["treasury"]["latest"]["y10"] == pytest.approx(4.28)
    assert payload["treasury"]["spread2s10s"] == pytest.approx(0.40)
    assert payload["quotes"][0]["symbol"] == "NVDA"
    json.dumps(payload)  # must be JSON-serializable


def test_tickers_config_is_valid():
    config = json.loads((Path(__file__).resolve().parent.parent / "data" / "tickers.json").read_text())
    assert isinstance(config["tickers"], list) and config["tickers"]
    for entry in config["tickers"]:
        assert entry.get("symbol"), f"ticker entry missing symbol: {entry}"


def test_parse_alphavantage_json():
    payload = {"Meta Data": {}, "Time Series (Daily)": {
        "2026-10-16": {"1. open": "1", "2. high": "1", "3. low": "1", "4. close": "655.10", "5. volume": "1"},
        "2026-10-15": {"1. open": "1", "2. high": "1", "3. low": "1", "4. close": "660.00", "5. volume": "1"},
    }}
    rows = fmd.parse_alphavantage_json(json.dumps(payload))
    assert [r["date"] for r in rows] == ["2026-10-15", "2026-10-16"]
    quote = fmd.quote_from_history("SPY", "benchmark", rows)
    assert quote["close"] == 655.10 and quote["dayChange"] == -4.9


def test_parse_alphavantage_reports_limit_message():
    with pytest.raises(fmd.FetchError, match="demo API key"):
        fmd.parse_alphavantage_json(json.dumps({"Information": "The demo API key is for demo purposes only."}))


def test_quotes_never_block_the_curve(tmp_path, monkeypatch):
    """Every quote source failing must still write the Treasury curve, carrying prior quotes as stale."""
    out = tmp_path / "market.json"
    out.write_text(json.dumps({"generatedAt": "2026-08-01T00:00:00+00:00", "sample": False,
                               "quotes": [{"symbol": "SPY", "close": 1.0}], "quotesAsOf": "2026-08-01"}))
    treasury = fmd.parse_treasury_csv((FIXTURES / "treasury_sample.csv").read_text())
    monkeypatch.setattr(fmd, "fetch_treasury", lambda year: treasury)
    monkeypatch.setattr(fmd, "fetch_quotes", lambda tickers, api_key=None: ([], ["SPY: could not fetch"]))
    tickers = tmp_path / "tickers.json"
    tickers.write_text(json.dumps({"tickers": [{"symbol": "SPY"}]}))
    assert fmd.main(["--output", str(out), "--tickers-file", str(tickers), "--year", "2026"]) == 0
    written = json.loads(out.read_text())
    assert written["sample"] is False
    assert written["treasury"]["latest"]["y10"] is not None
    assert written["quotesStale"] is True and written["quotesAsOf"] == "2026-08-01"
    assert written["quotes"][0]["symbol"] == "SPY"
