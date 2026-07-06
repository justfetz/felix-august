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
