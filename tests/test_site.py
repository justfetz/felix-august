"""Static-site integrity checks: every referenced asset exists, JS parses,
data files are valid, and the shared chrome is consistent across pages."""

import json
import re
import shutil
import subprocess
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parent.parent
HTML_PAGES = sorted(REPO.glob("*.html")) + sorted((REPO / "letters").glob("*.html"))
JS_FILES = sorted(REPO.glob("*.js"))
NAV_PAGES = ["index.html", "markets.html", "tools.html", "letters.html", "reading.html", "about.html"]
# Old URLs that now redirect; they carry no nav on purpose.
REDIRECT_PAGES = {"data.html", "services.html", "contact.html"}
CHROME_PAGES = [p for p in HTML_PAGES if p.name not in REDIRECT_PAGES]

LOCAL_REF = re.compile(r'(?:href|src)="(?!https?://|#|mailto:|data:)([^"?#]+)')


def test_pages_exist():
    names = {page.name for page in HTML_PAGES}
    for expected in NAV_PAGES:
        assert expected in names, f"{expected} is missing"


@pytest.mark.parametrize("page", HTML_PAGES, ids=lambda p: p.name)
def test_local_references_resolve(page):
    text = page.read_text()
    for ref in LOCAL_REF.findall(text):
        target = (page.parent / ref).resolve()
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


@pytest.mark.parametrize("page", CHROME_PAGES, ids=lambda p: p.name)
def test_nav_is_consistent(page):
    """Every page carries the same six-link nav (relative to its own folder) and the same footer."""
    text = page.read_text()
    up = "../" if page.parent.name == "letters" else ""
    for target in NAV_PAGES:
        assert f'href="{up}{target}"' in text, f"{page.name} nav is missing a link to {target}"
    assert 'id="primary-nav"' in text, f"{page.name} is missing the nav"
    assert 'class="site-footer"' in text, f"{page.name} is missing the footer"


@pytest.mark.parametrize("page", CHROME_PAGES, ids=lambda p: p.name)
def test_cache_bust_is_uniform(page):
    versions = set(re.findall(r'\?v=([0-9a-z]+)"', page.read_text()))
    assert len(versions) == 1, f"{page.name} mixes asset versions: {versions}"


def test_redirect_pages_point_somewhere_real():
    for name in REDIRECT_PAGES:
        text = (REPO / name).read_text()
        match = re.search(r'url=([^"]+)"', text)
        assert match, f"{name} has no meta refresh"
        assert (REPO / match.group(1)).exists(), f"{name} redirects to a missing page"


def test_letters_index_matches_the_files():
    text = (REPO / "letters.js").read_text()
    hrefs = re.findall(r'href:\s*"([^"]+)"', text)
    assert hrefs, "letters.js lists no letters"
    for href in hrefs:
        assert (REPO / href).exists(), f"letters.js points at a missing letter: {href}"
    dates = re.findall(r'date:\s*"([^"]+)"', text)
    assert all(re.fullmatch(r"20\d\d-\d\d(-\d\d)?", d) for d in dates), dates
    assert dates == sorted(dates, reverse=True), "letters.js must be newest first"
    on_disk = {f"letters/{p.name}" for p in (REPO / "letters").glob("*.html") if not p.name.startswith("_")}
    assert on_disk == set(hrefs), f"letters on disk and in letters.js differ: {on_disk ^ set(hrefs)}"


def test_workflows_are_valid_yaml():
    yaml = pytest.importorskip("yaml")
    for workflow in (REPO / ".github" / "workflows").glob("*.yml"):
        loaded = yaml.safe_load(workflow.read_text())
        assert "jobs" in loaded, f"{workflow.name} has no jobs"
