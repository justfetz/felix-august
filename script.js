// ---------------------------------------------------------------------------------
// Live numbers come from holdings-data.js, which tools/import_positions.py regenerates
// from the brokerage exports. Nothing below is typed in by hand except the ledger of
// what the household put in, which no export carries.
// ---------------------------------------------------------------------------------

// Hand-maintained: contributions and documented transfers (from account history,
// which the positions export does not include). Update when you add money.
const CONTRIBUTION_LEDGER = {
    accounts: {
        thinkorswim: { accountType: "AI + tactical sleeve", contributed: 4700.21, weeklyCadence: 50 },
        Fidelity: { accountType: "Core accumulation sleeve", contributed: 2707.89, weeklyCadence: 100 }
    },
    documentedTransferTotal: 4000,
    monthly: [
        { label: "Nov 2025", amount: 250 },
        { label: "Dec 2025", amount: 750 },
        { label: "Jan 2026", amount: 600 },
        { label: "Feb 2026", amount: 600 },
        { label: "Mar 2026", amount: 750 },
        { label: "Apr 2026", amount: 600 },
        { label: "May 2026", amount: 450 }
    ]
};

const CASH_SYMBOLS = new Set(["SPAXX**", "FDRXX**", "CASH", "CASH & CASH INVESTMENTS"]);

function parseMoney(value) {
    if (typeof value === "number") return value;
    if (!value) return 0;
    const cleaned = String(value).replace(/[$,%+\s]/g, "").replace(/\((.*)\)/, "-$1");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
}

function shortLabel(row) {
    const d = (row.description || "").toLowerCase().replace(/\b(inc|corp|co|plc|ltd|nv|sa|com|class|cl|a|shs|usd[\d.]*|ny registry|spon adr|each rep.*)\b/g, "").replace(/\s+/g, " ").trim();
    return d ? d.split(" ").slice(0, 3).join(" ") : row.symbol;
}

function buildAccountsFromHoldings(rows) {
    const byBrokerage = new Map();
    for (const row of rows) {
        const symbol = (row.symbol || "").trim();
        if (!symbol) continue;
        // Fidelity's "Type" column is the ACCOUNT type ("Cash" = cash account, "Margin"), not the asset;
        // cash positions are identified by symbol (SPAXX**) or by Schwab's "Cash and Money Market" asset type.
        const isCash = CASH_SYMBOLS.has(symbol.toUpperCase()) || /money market/i.test(row.assetType || "") || /held in money market/i.test(row.description || "");
        const name = row.brokerage;
        if (!byBrokerage.has(name)) byBrokerage.set(name, { name, holdings: [], cash: 0 });
        const acct = byBrokerage.get(name);
        const marketValue = typeof row.marketValueNumber === "number" ? row.marketValueNumber : parseMoney(row.marketValue);
        if (isCash) { acct.cash += marketValue; continue; }
        const totalGain = typeof row.gainNumber === "number" ? row.gainNumber : parseMoney(row.gain);
        acct.holdings.push({
            ticker: symbol,
            label: shortLabel(row),
            account: name,
            marketValue,
            totalGain,
            gainPct: parseMoney(row.gainPct)
        });
    }
    return [...byBrokerage.values()].map((acct) => {
        const ledger = CONTRIBUTION_LEDGER.accounts[acct.name] || { accountType: "", contributed: 0, weeklyCadence: 0 };
        const positionsValue = acct.holdings.reduce((sum, h) => sum + h.marketValue, 0);
        const gain = acct.holdings.reduce((sum, h) => sum + h.totalGain, 0);
        acct.holdings.sort((a, b) => b.marketValue - a.marketValue);
        return {
            ...acct,
            accountType: ledger.accountType,
            contributed: ledger.contributed,
            weeklyCadence: ledger.weeklyCadence,
            currentValue: positionsValue + acct.cash,
            positionsValue,
            gain,
            positions: acct.holdings.length
        };
    }).sort((a, b) => b.currentValue - a.currentValue);
}

const allAccounts = buildAccountsFromHoldings(window.allHoldingsDetail || []);

function inferTheme(holding) {
    const text = `${holding.ticker} ${holding.label}`.toLowerCase();
    if (text.includes("ai") || text.includes("robot") || text.includes("automation") || text.includes("voice")) return "AI";
    if (text.includes("semi") || text.includes("chip") || text.includes("memory") || ["NVDA", "AMD", "MU", "INTC", "MXL", "TSM", "AVGO", "ASML", "MRVL", "SMCI", "LITE"].includes(holding.ticker)) return "Semis";
    if (text.includes("energy") || ["XLE", "DUK", "D", "SO", "NEE", "EQNR", "HLX", "LNG", "KMI", "XEL"].includes(holding.ticker)) return "Energy";
    if (text.includes("market etf") || text.includes("index") || ["VTI", "XLF", "SLV"].includes(holding.ticker)) return "Index / Macro";
    if (text.includes("bitcoin") || ["IBIT", "BITC"].includes(holding.ticker)) return "Alternative";
    return "Platform / Other";
}

const combinedHoldings = allAccounts
    .flatMap((account) => account.holdings)
    .map((holding) => ({ ...holding, theme: inferTheme(holding) }))
    .sort((a, b) => b.marketValue - a.marketValue);

const householdValue = allAccounts.reduce((sum, a) => sum + a.currentValue, 0);
const householdCash = allAccounts.reduce((sum, a) => sum + a.cash, 0);
const householdGain = allAccounts.reduce((sum, a) => sum + a.gain, 0);
const householdContributed = allAccounts.reduce((sum, a) => sum + a.contributed, 0);

const portfolioData = {
    summary: {
        householdContributed,
        householdValue,
        householdCash,
        householdGain,
        weeklyCadence: allAccounts.reduce((sum, a) => sum + a.weeklyCadence, 0),
        documentedTransferTotal: CONTRIBUTION_LEDGER.documentedTransferTotal,
        accounts: allAccounts.length,
        importedPositions: allAccounts.reduce((sum, a) => sum + a.positions, 0)
    },
    accounts: allAccounts,
    holdings: combinedHoldings.slice(0, 18),
    allHoldings: combinedHoldings,
    contributions: CONTRIBUTION_LEDGER.monthly
};

const THEME_COLORS = {
    "AI": "#4c2f18",
    "Semis": "#8a5a2b",
    "Energy": "#b78953",
    "Index / Macro": "#7b8c6f",
    "Alternative": "#566a7f",
    "Platform / Other": "#9a6b5f"
};

/* ---------------------------------------------------------------------------
 * Formatting
 * ------------------------------------------------------------------------ */

function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatSignedCurrency(value) {
    return `${value < 0 ? "−" : "+"}${formatCurrency(Math.abs(value))}`;
}

function formatSignedPercent(value) {
    return `${value < 0 ? "−" : "+"}${Math.abs(value).toFixed(2)}%`;
}

function valueClass(value) {
    return value < 0 ? "loss-text" : "gain-text";
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/** "2026-10-18" -> "18 October 2026"; "2026-05" -> "May 2026". Dates are written, not formatted like a dashboard. */
function longDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (!m) return String(y);
    return d ? `${d} ${months[m - 1]} ${y}` : `${months[m - 1]} ${y}`;
}

function normalizeMaybeNumber(value) {
    if (typeof value === "number") return value;
    if (value === null || value === undefined || value === "") return null;
    const cleaned = String(value).replace(/[$,%+\s]/g, "").replace(/\((.*)\)/, "-$1");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : null;
}

/* ---------------------------------------------------------------------------
 * The ledger (home page)
 * ------------------------------------------------------------------------ */

function renderEntryHeadline() {
    const el = document.getElementById("entry-headline");
    if (!el) return;
    const n = portfolioData.accounts.length;
    el.textContent = `${formatCurrency(portfolioData.summary.householdValue)} across ${n === 2 ? "two" : n} account${n === 1 ? "" : "s"}.`;
}

function renderLedgerTable() {
    const body = document.querySelector("#ledger-table tbody");
    if (!body) return;
    const s = portfolioData.summary;
    const cls = (v) => (v < 0 ? ' class="num-neg"' : "");
    const rows = portfolioData.accounts.map((a) => `
        <tr>
            <td>${escapeHtml(a.name)}<span class="sub">${escapeHtml(a.accountType)}${a.cash ? ` · ${formatCurrency(a.cash)} cash` : ""}<span class="show-sm"> · ${formatCurrency(a.weeklyCadence)}/week</span></span></td>
            <td>${formatCurrency(a.currentValue)}</td>
            <td>${formatCurrency(a.contributed)}</td>
            <td${cls(a.gain)}>${formatSignedCurrency(a.gain)}</td>
            <td class="hide-sm">${a.positions}</td>
            <td class="hide-sm">${formatCurrency(a.weeklyCadence)}</td>
        </tr>`).join("");
    body.innerHTML = rows + `
        <tr class="total">
            <td>Household</td>
            <td>${formatCurrency(s.householdValue)}</td>
            <td>${formatCurrency(s.householdContributed)}</td>
            <td${cls(s.householdGain)}>${formatSignedCurrency(s.householdGain)}</td>
            <td class="hide-sm">${s.importedPositions}</td>
            <td class="hide-sm">${formatCurrency(s.weeklyCadence)}</td>
        </tr>`;
}

/** Provenance under the ledger. Export dates come from holdings-data.js (written by the import tool);
 *  quote and Treasury dates from data/market.json. Nothing here is typed. */
function renderLedgerNote(market) {
    const note = document.getElementById("ledger-note");
    if (!note) return;
    const imports = window.holdingsImports || {};
    const dates = [...new Set(Object.values(imports))].sort();
    const parts = [];
    if (dates.length === 1) parts.push(`Positions from the exports of ${longDate(dates[0])}`);
    else if (dates.length > 1) parts.push(`Positions from exports of ${Object.entries(imports).map(([b, d]) => `${b} ${longDate(d)}`).join(" and ")}`);
    if (market && !market.sample) {
        const q = market.quotes && market.quotes.find((row) => row.date);
        if (q) parts.push(`quotes as of ${longDate(q.date)}`);
        const t = market.treasury && market.treasury.latest;
        if (t && t.y10 !== null && t.y10 !== undefined) parts.push(`ten-year ${t.y10.toFixed(2)}% on ${longDate(t.date)}`);
    }
    note.textContent = parts.length ? parts.join("; ") + "." : "";
}

function renderTopHoldingsBars() {
    const el = document.getElementById("top-holdings");
    if (!el) return;
    const top = portfolioData.holdings.slice(0, 8);
    const max = Math.max(...top.map((h) => h.marketValue), 1);
    el.innerHTML = top.map((h) => `
        <span class="t">${escapeHtml(h.ticker)}</span>
        <span class="b"><i style="width:${(100 * h.marketValue / max).toFixed(1)}%"></i></span>
        <span class="v">${formatCurrency(h.marketValue)}</span>`).join("");
}

function renderThemeAllocationChart() {
    const container = document.getElementById("theme-allocation-chart");
    if (!container) return;
    const totals = portfolioData.allHoldings.reduce((acc, h) => { acc[h.theme] = (acc[h.theme] || 0) + h.marketValue; return acc; }, {});
    const data = Object.entries(totals).map(([theme, value]) => ({ theme, value })).sort((a, b) => b.value - a.value);
    const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
    const color = (theme) => THEME_COLORS[theme] || "#8a5a2b";
    container.innerHTML = `
        <div class="theme-stack" aria-hidden="true">
            ${data.map((item) => `<div class="theme-segment" style="width:${(100 * item.value / total).toFixed(2)}%;background:${color(item.theme)}" title="${escapeHtml(item.theme)}"></div>`).join("")}
        </div>
        <div class="theme-legend">
            ${data.map((item) => `
                <div class="theme-row">
                    <span class="theme-swatch" style="background:${color(item.theme)}"></span>
                    <span>${escapeHtml(item.theme)}</span>
                    <strong>${escapeHtml(formatCurrency(item.value))}</strong>
                    <span>${(100 * item.value / total).toFixed(1)}%</span>
                </div>`).join("")}
        </div>`;
}

function renderContributionChart() {
    const el = document.getElementById("contribution-chart");
    if (!el) return;
    const max = Math.max(...portfolioData.contributions.map((item) => item.amount), 1);
    el.innerHTML = portfolioData.contributions.map((item) => `
        <span class="t">${escapeHtml(item.label)}</span>
        <span class="b"><i style="width:${(100 * item.amount / max).toFixed(1)}%"></i></span>
        <span class="v">${formatCurrency(item.amount)}</span>`).join("");
}

/* ---------------------------------------------------------------------------
 * Letters: letters.js is the hand-kept index (newest first). Each letter is its own page.
 * ------------------------------------------------------------------------ */

function renderLetters() {
    const letters = window.letters || [];
    const item = (l) => `
        <li>
            <a href="${escapeHtml(l.href)}">${escapeHtml(l.title)}</a><span class="when">${escapeHtml(longDate(l.date))}</span>
            ${l.summary ? `<p>${escapeHtml(l.summary)}</p>` : ""}
        </li>`;
    const all = document.getElementById("letters-list");
    if (all) all.innerHTML = letters.map(item).join("") || "<li>No letters yet.</li>";
    const latest = document.getElementById("letters-latest");
    if (latest) latest.innerHTML = letters.slice(0, 3).map(item).join("");
}

/* ---------------------------------------------------------------------------
 * All holdings: the full imported record, one ruled table, a text filter by brokerage
 * ------------------------------------------------------------------------ */

function sortByMarketValue(items) {
    return items.slice().sort((a, b) => (b.marketValueNumber || 0) - (a.marketValueNumber || 0));
}

function renderAllHoldingsArchive() {
    const tableBody = document.getElementById("all-holdings-table-body");
    const summary = document.getElementById("holdings-summary");
    const filter = document.getElementById("holdings-filter");
    if (!tableBody || !summary || !filter) return;

    const allRows = sortByMarketValue((window.allHoldingsDetail || []).map((row) => ({
        ...row,
        marketValueNumber: normalizeMaybeNumber(row.marketValueNumber ?? row.marketValue),
        gainNumber: normalizeMaybeNumber(row.gainNumber ?? row.gain)
    })));
    const brokerages = ["All", ...new Set(allRows.map((row) => row.brokerage))];
    let active = "All";

    const cell = (value, numeric) => {
        const n = numeric ? normalizeMaybeNumber(value) : null;
        return `<td${n !== null && n < 0 ? ' class="num-neg"' : ""}>${escapeHtml(value || "")}</td>`;
    };

    const draw = () => {
        const rows = active === "All" ? allRows : allRows.filter((row) => row.brokerage === active);
        const value = rows.reduce((sum, row) => sum + (row.marketValueNumber || 0), 0);
        const gain = rows.reduce((sum, row) => sum + (row.gainNumber || 0), 0);
        summary.textContent = `${rows.length} rows${active === "All" ? " across both accounts" : ` in ${active}`}, ${formatCurrency(value)} market value, ${formatSignedCurrency(gain)} total gain.`;
        filter.innerHTML = brokerages.map((b) => `<button type="button" class="${b === active ? "is-active" : ""}" data-brokerage="${escapeHtml(b)}">${escapeHtml(b)}</button>`).join("");
        filter.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => { active = button.dataset.brokerage; draw(); }));
        tableBody.innerHTML = rows.map((row) => `
            <tr>
                <td>${escapeHtml(row.brokerage || "")}</td>
                <td class="text"><strong>${escapeHtml(row.symbol || "")}</strong></td>
                <td class="text">${escapeHtml(row.description || "")}</td>
                ${cell(row.quantity)}${cell(row.price)}${cell(row.marketValue)}
                ${cell(row.dayChange, true)}${cell(row.dayChangePct, true)}
                ${cell(row.costBasis)}${cell(row.gain, true)}${cell(row.gainPct, true)}
                ${cell(row.accountWeight)}${cell(row.averageCostBasis)}
                <td class="text">${escapeHtml(row.assetType || "")}</td>
            </tr>`).join("");
    };
    draw();
}

/* ---------------------------------------------------------------------------
 * Markets: data/market.json, written by the scheduled Action (tools/fetch_market_data.py)
 * ------------------------------------------------------------------------ */

function formatYield(value) {
    return value === null || value === undefined ? "—" : `${value.toFixed(2)}%`;
}

function renderRatesTable(market) {
    const container = document.getElementById("rates-table");
    if (!container) return;
    const latest = market.treasury.latest;
    const spread = market.treasury.spread2s10s;
    const rows = [
        ["3-month", latest.y3m], ["2-year", latest.y2], ["10-year", latest.y10], ["30-year", latest.y30]
    ].map(([label, v]) => `<tr><td>${label}</td><td>${formatYield(v)}</td></tr>`).join("");
    const spreadRow = `<tr class="total"><td>2s10s spread</td><td>${spread === null || spread === undefined ? "—" : `${spread > 0 ? "+" : spread < 0 ? "−" : ""}${Math.abs(spread).toFixed(2)}%`}</td></tr>`;
    container.innerHTML = `<table><thead><tr><th>Treasury par yield, ${escapeHtml(longDate(latest.date))}</th><th></th></tr></thead><tbody>${rows}${spreadRow}</tbody></table>`;
}

function svgText(x, y, text, className, anchor = "start") {
    return `<text x="${x}" y="${y}" class="${className}" text-anchor="${anchor}">${escapeHtml(text)}</text>`;
}

function renderYieldChart(market) {
    const container = document.getElementById("yield-chart");
    if (!container) return;
    const series = market.treasury.series.filter((row) => row.y10 !== null && row.y10 !== undefined);
    if (series.length < 2) {
        container.innerHTML = "<p class=\"note\">Not enough yield history yet; the scheduled refresh fills this in.</p>";
        return;
    }
    const width = 720, height = 300;
    const margin = { top: 18, right: 20, bottom: 36, left: 52 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const values = series.map((row) => row.y10);
    const minY = Math.floor(Math.min(...values) * 10) / 10 - 0.1;
    const maxY = Math.ceil(Math.max(...values) * 10) / 10 + 0.1;
    const x = (i) => margin.left + (i / (series.length - 1)) * innerWidth;
    const y = (v) => margin.top + (1 - (v - minY) / (maxY - minY)) * innerHeight;
    const path = series.map((row, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(row.y10).toFixed(1)}`).join(" ");
    const area = `${path} L${x(series.length - 1).toFixed(1)},${(margin.top + innerHeight).toFixed(1)} L${margin.left},${(margin.top + innerHeight).toFixed(1)} Z`;
    const grid = [];
    for (let tick = 0; tick <= 4; tick += 1) {
        const v = minY + tick * (maxY - minY) / 4;
        grid.push(`<line x1="${margin.left}" y1="${y(v).toFixed(1)}" x2="${width - margin.right}" y2="${y(v).toFixed(1)}" class="chart-axis-line"></line>`);
        grid.push(svgText(margin.left - 10, y(v) + 4, `${v.toFixed(2)}%`, "chart-label", "end"));
    }
    const every = Math.max(1, Math.floor(series.length / 6));
    const dates = series.map((row, i) => {
        const last = i === series.length - 1;
        if (!last && (i % every !== 0 || series.length - 1 - i < every * 0.6)) return "";
        return svgText(x(i), height - 12, row.date.slice(5), "chart-label", "middle");
    }).join("");
    const last = series[series.length - 1];
    container.innerHTML = `
        <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="10-year Treasury yield over time">
            ${grid.join("")}
            <path d="${area}" class="yield-area"></path>
            <path d="${path}" class="yield-line" fill="none"></path>
            <circle cx="${x(series.length - 1).toFixed(1)}" cy="${y(last.y10).toFixed(1)}" r="3.5" class="yield-dot"></circle>
            ${svgText(x(series.length - 1) - 8, y(last.y10) - 10, formatYield(last.y10), "chart-value", "end")}
            ${dates}
        </svg>`;
}

function renderQuoteBoard(market) {
    const tableBody = document.getElementById("quotes-table-body");
    if (!tableBody) return;
    const quotes = market.quotes.slice().sort((a, b) => a.symbol.localeCompare(b.symbol));
    const num = (v, fmt) => (v === null || v === undefined) ? "<td>—</td>" : `<td${v < 0 ? ' class="num-neg"' : ""}>${escapeHtml(fmt(v))}</td>`;
    tableBody.innerHTML = quotes.map((q) => `
        <tr>
            <td><strong>${escapeHtml(q.symbol)}</strong></td>
            <td class="text">${escapeHtml(q.label || "")}</td>
            ${num(q.close, (v) => `$${v.toFixed(2)}`)}
            ${num(q.dayChange, (v) => `${v < 0 ? "−" : "+"}$${Math.abs(v).toFixed(2)}`)}
            ${num(q.dayChangePct, formatSignedPercent)}
            <td>${escapeHtml(longDate(q.date))}</td>
        </tr>`).join("");
}

function renderMarketFreshness(market) {
    const note = document.getElementById("market-freshness");
    if (!note) return;
    if (market.sample) {
        note.textContent = "Sample data; real Treasury and quote data arrives with the first scheduled refresh.";
        return;
    }
    const generated = market.generatedAt ? `${longDate(market.generatedAt.slice(0, 10))}, ${market.generatedAt.slice(11, 16)} UTC` : "unknown";
    const quoteSource = market.sources && market.sources.quotes ? market.sources.quotes : "end-of-day closes";
    const quotesNote = market.quotesStale
        ? ` Quotes are from ${longDate(market.quotesAsOf)} and have not refreshed since; the curve is current.`
        : (market.quotes && market.quotes.length ? ` Quotes: ${quoteSource}.` : " The quote board was unavailable this run.");
    note.textContent = `Refreshed ${generated}. Treasury par yield curve from the U.S. Treasury.${quotesNote}`;
}

function loadMarketData() {
    const wants = document.getElementById("rates-table") || document.getElementById("ledger-note") || document.getElementById("yield-chart");
    if (!wants) return;
    fetch("data/market.json", { cache: "no-store" })
        .then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
        .then((market) => {
            renderRatesTable(market);
            renderYieldChart(market);
            renderQuoteBoard(market);
            renderMarketFreshness(market);
            renderLedgerNote(market);
        })
        .catch(() => {
            renderLedgerNote(null);
            const note = document.getElementById("market-freshness");
            if (note) note.textContent = "Market data unavailable in this view; it loads when the site is served over HTTP.";
        });
}

/* ---------------------------------------------------------------------------
 * Reading: books-data.js (generated by tools/build_books.py from books/books.csv)
 * ------------------------------------------------------------------------ */

function renderReadingShelf() {
    const container = document.getElementById("reading-shelf");
    if (!container) return;
    const shelf = window.readingShelf || [];
    if (!shelf.length) {
        container.innerHTML = "<p class=\"note\">No books yet. Add rows to books/books.csv and run tools/build_books.py.</p>";
        return;
    }
    const groups = [["reading", "Reading now"], ["finished", "Finished"], ["queued", "On the shelf"]];
    container.innerHTML = groups.map(([status, heading]) => {
        const books = shelf.filter((book) => book.status === status);
        if (!books.length) return "";
        return `
            <section class="section">
                <h2>${escapeHtml(heading)}</h2>
                <ul class="list">
                    ${books.map((book) => `
                        <li>
                            <strong>${escapeHtml(book.title)}</strong><span class="by">${escapeHtml(book.author)}${book.year ? `, ${escapeHtml(book.year)}` : ""}</span>
                            ${book.takeaway ? `<blockquote>${escapeHtml(book.takeaway)}</blockquote>` : ""}
                        </li>`).join("")}
                </ul>
            </section>`;
    }).join("");
}

/* ---------------------------------------------------------------------------
 * Chrome
 * ------------------------------------------------------------------------ */

function initNav() {
    const nav = document.getElementById("primary-nav");
    if (!nav) return;
    const path = location.pathname.replace(/\/$/, "/index.html");
    const current = path.split("/").pop() || "index.html";
    const inLetters = /\/letters\//.test(path);
    nav.querySelectorAll("a").forEach((link) => {
        const target = link.getAttribute("href").split("/").pop();
        if (target === current || (inLetters && target === "letters.html")) link.setAttribute("aria-current", "page");
    });
}

renderEntryHeadline();
renderLedgerTable();
renderTopHoldingsBars();
renderThemeAllocationChart();
renderContributionChart();
renderLetters();
renderAllHoldingsArchive();
renderReadingShelf();
initNav();
loadMarketData();
