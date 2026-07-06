"""Static-site integrity checks: every referenced asset exists, JS parses,
data files are valid, and the shared chrome is consistent across pages."""

import json
import re
import shutil
import subprocess
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parent.parent
HTML_PAGES = sorted(REPO.glob("*.html"))
JS_FILES = sorted(REPO.glob("*.js"))
NAV_PAGES = ["index.html", "about.html", "services.html", "data.html",
             "markets.html", "reading.html", "contact.html"]

LOCAL_REF = re.compile(r'(?:href|src)="(?!https?://|#|mailto:|data:)([^"?#]+)')


def test_pages_exist():
    names = {page.name for page in HTML_PAGES}
    for expected in NAV_PAGES:
        assert expected in names, f"{expected} is missing"


@pytest.mark.parametrize("page", HTML_PAGES, ids=lambda p: p.name)
def test_local_references_resolve(page):
    text = page.read_text()
    for ref in LOCAL_REF.findall(text):
        target = REPO / ref
        assert target.exists(), f"{page.name} references missing file: {ref}"


@pytest.mark.skipif(shutil.which("node") is None, reason="node not installed")
@pytest.mark.parametrize("js", JS_FILES, ids=lambda p: p.name)
def test_js_parses(js):
    subprocess.run(["node", "--check", str(js)], check=True)


def test_market_json_schema():
    market = json.loads((REPO / "data" / "market.json").read_text())
    for key in ("generatedAt", "sample", "treasury", "quotes"):
        assert key in market, f"market.json missing {key}"
    assert isinstance(market["treasury"]["series"], list) and market["treasury"]["series"]
    latest = market["treasury"]["latest"]
    assert "y10" in latest and "date" in latest
    for quote in market["quotes"]:
        assert quote.get("symbol") and "close" in quote


def test_holdings_data_parses_as_json_array():
    text = (REPO / "holdings-data.js").read_text()
    match = re.search(r"window\.allHoldingsDetail\s*=\s*(\[.*\])\s*;", text, re.DOTALL)
    assert match, "holdings-data.js must assign window.allHoldingsDetail"
    holdings = json.loads(match.group(1))
    assert len(holdings) >= 2
    brokerages = {row["brokerage"] for row in holdings}
    assert brokerages >= {"Fidelity", "thinkorswim"}


@pytest.mark.parametrize("page", [REPO / name for name in NAV_PAGES], ids=lambda p: p.name)
def test_nav_is_consistent(page):
    text = page.read_text()
    for target in NAV_PAGES:
        assert f'href="{target}"' in text, f"{page.name} nav is missing a link to {target}"
    assert 'class="nav-toggle"' in text, f"{page.name} is missing the mobile nav toggle"


def test_workflows_are_valid_yaml():
    yaml = pytest.importorskip("yaml")
    for workflow in (REPO / ".github" / "workflows").glob("*.yml"):
        loaded = yaml.safe_load(workflow.read_text())
        assert "jobs" in loaded, f"{workflow.name} has no jobs"
