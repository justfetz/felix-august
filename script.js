const thinkorswimAccount = {
    name: "thinkorswim",
    accountType: "AI + tactical sleeve",
    contributed: 4700.21,
    currentValue: 6927.09,
    gain: 2226.88,
    weeklyCadence: 50,
    positions: 34,
    cash: 81.64,
    holdings: [
        { ticker: "CHAT", label: "AI basket", account: "thinkorswim", marketValue: 1709.8, totalGain: 580.27, gainPct: 51.37 },
        { ticker: "NVDA", label: "AI compute", account: "thinkorswim", marketValue: 448.9, totalGain: 200.38, gainPct: 80.63 },
        { ticker: "MSFT", label: "platform + cloud", account: "thinkorswim", marketValue: 419.89, totalGain: 11.87, gainPct: 2.91 },
        { ticker: "AMD", label: "semis", account: "thinkorswim", marketValue: 420.62, totalGain: 299.09, gainPct: 246.1 },
        { ticker: "GOOGL", label: "AI + search", account: "thinkorswim", marketValue: 395.3, totalGain: 231.97, gainPct: 142.03 },
        { ticker: "MXL", label: "chip infrastructure", account: "thinkorswim", marketValue: 369.36, totalGain: 194.85, gainPct: 111.66 },
        { ticker: "INTC", label: "domestic chip exposure", account: "thinkorswim", marketValue: 320.73, totalGain: 219.3, gainPct: 216.21 },
        { ticker: "ROBT", label: "robotics ETF", account: "thinkorswim", marketValue: 268.4, totalGain: 17.57, gainPct: 7.0 },
        { ticker: "AMZN", label: "cloud + commerce", account: "thinkorswim", marketValue: 262.7, totalGain: 85.96, gainPct: 48.64 },
        { ticker: "XLE", label: "energy ETF", account: "thinkorswim", marketValue: 237.76, totalGain: 55.94, gainPct: 30.77 },
        { ticker: "XT", label: "exponential tech ETF", account: "thinkorswim", marketValue: 158.24, totalGain: 49.06, gainPct: 44.93 },
        { ticker: "SLV", label: "silver exposure", account: "thinkorswim", marketValue: 137.54, totalGain: 47.09, gainPct: 52.06 },
        { ticker: "AIO", label: "AI + infrastructure fund", account: "thinkorswim", marketValue: 131.05, totalGain: 8.49, gainPct: 6.93 },
        { ticker: "ARTY", label: "AI ETF", account: "thinkorswim", marketValue: 131.6, totalGain: 65.41, gainPct: 98.82 },
        { ticker: "DUK", label: "utility", account: "thinkorswim", marketValue: 120.95, totalGain: 9.4, gainPct: 8.43 },
        { ticker: "WTAI", label: "AI ETF", account: "thinkorswim", marketValue: 121.11, totalGain: 52.73, gainPct: 77.11 },
        { ticker: "LRNZ", label: "AI + innovation ETF", account: "thinkorswim", marketValue: 100.97, totalGain: 32.29, gainPct: 47.02 },
        { ticker: "EXEL", label: "healthcare growth", account: "thinkorswim", marketValue: 100.26, totalGain: 56.53, gainPct: 129.27 },
        { ticker: "SPRX", label: "biotech", account: "thinkorswim", marketValue: 96.3, totalGain: 48.44, gainPct: 101.21 },
        { ticker: "SYM", label: "automation", account: "thinkorswim", marketValue: 94.64, totalGain: 14.66, gainPct: 18.33 },
        { ticker: "TEM", label: "speculative AI health", account: "thinkorswim", marketValue: 87.5, totalGain: -55.04, gainPct: -38.61 },
        { ticker: "SOUN", label: "voice AI", account: "thinkorswim", marketValue: 83.7, totalGain: 62.35, gainPct: 292.04 },
        { ticker: "D", label: "utility", account: "thinkorswim", marketValue: 61.73, totalGain: 6.01, gainPct: 10.79 },
        { ticker: "U", label: "interactive software", account: "thinkorswim", marketValue: 54.32, totalGain: 3.4, gainPct: 6.68 },
        { ticker: "XLF", label: "financials ETF", account: "thinkorswim", marketValue: 51.05, totalGain: 1.88, gainPct: 3.82 },
        { ticker: "DRAM", label: "memory ETF", account: "thinkorswim", marketValue: 50.35, totalGain: -3.59, gainPct: -6.66 },
        { ticker: "IBIT", label: "bitcoin ETF", account: "thinkorswim", marketValue: 44.81, totalGain: 4.28, gainPct: 10.56 },
        { ticker: "BITC", label: "bitcoin income", account: "thinkorswim", marketValue: 40.14, totalGain: -32.73, gainPct: -44.92 },
        { ticker: "HLX", label: "energy services", account: "thinkorswim", marketValue: 40.2, totalGain: -1.32, gainPct: -3.18 },
        { ticker: "LTRX", label: "network hardware", account: "thinkorswim", marketValue: 37.62, totalGain: 8.27, gainPct: 28.18 },
        { ticker: "UPST", label: "AI lending", account: "thinkorswim", marketValue: 29.5, totalGain: 4.98, gainPct: 20.31 },
        { ticker: "AI", label: "software AI", account: "thinkorswim", marketValue: 25.95, totalGain: -55.4, gainPct: -68.1 },
        { ticker: "PATH", label: "automation software", account: "thinkorswim", marketValue: 20.66, totalGain: -21.01, gainPct: -50.42 }
    ]
};

const fidelityAccount = {
    name: "Fidelity",
    accountType: "Core accumulation sleeve",
    contributed: 2707.89,
    currentValue: 3127.81,
    gain: 419.92,
    weeklyCadence: 100,
    positions: 53,
    cash: 3.33,
    pending: 100,
    holdings: [
        { ticker: "MU", label: "memory + semis", account: "Fidelity", marketValue: 724.66, totalGain: 333.35, gainPct: 85.18 },
        { ticker: "SMCI", label: "AI infrastructure", account: "Fidelity", marketValue: 531.21, totalGain: 31.22, gainPct: 6.24 },
        { ticker: "PLTR", label: "AI software", account: "Fidelity", marketValue: 401.97, totalGain: -54.74, gainPct: -11.99 },
        { ticker: "AAPL", label: "platform", account: "Fidelity", marketValue: 300.23, totalGain: 19.75, gainPct: 7.04 },
        { ticker: "DRAM", label: "memory ETF", account: "Fidelity", marketValue: 264.49, totalGain: -15.51, gainPct: -5.54 },
        { ticker: "GOOGL", label: "AI + search", account: "Fidelity", marketValue: 246.79, totalGain: 40.72, gainPct: 19.76 },
        { ticker: "VTI", label: "total market ETF", account: "Fidelity", marketValue: 197.69, totalGain: 17.74, gainPct: 9.86 },
        { ticker: "GOOG", label: "AI + search", account: "Fidelity", marketValue: 145.92, totalGain: 30.97, gainPct: 26.94 },
        { ticker: "UBER", label: "platform mobility", account: "Fidelity", marketValue: 75.09, totalGain: -9.67, gainPct: -11.41 },
        { ticker: "FIGR", label: "fintech", account: "Fidelity", marketValue: 21.64, totalGain: 4.53, gainPct: 26.47 },
        { ticker: "LITE", label: "optics + infrastructure", account: "Fidelity", marketValue: 7.76, totalGain: 5.82, gainPct: 300.28 },
        { ticker: "NVDA", label: "AI compute", account: "Fidelity", marketValue: 7.21, totalGain: 1.39, gainPct: 23.88 }
    ]
};

const allAccounts = [thinkorswimAccount, fidelityAccount];

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

const portfolioData = {
    summary: {
        householdContributed: 7408.1,
        householdValue: 10054.9,
        householdGain: 2646.8,
        weeklyCadence: 150,
        accounts: 2,
        importedPositions: thinkorswimAccount.positions + fidelityAccount.positions
    },
    accounts: allAccounts,
    holdings: combinedHoldings.slice(0, 18),
    allHoldings: combinedHoldings,
    contributions: [
        { label: "Week 1", amount: 150 },
        { label: "Week 2", amount: 150 },
        { label: "Week 3", amount: 150 },
        { label: "Week 4", amount: 150 },
        { label: "Week 5", amount: 150 },
        { label: "Week 6", amount: 150 }
    ],
    census: {
        cards: [
            { key: "populationValue", label: "U.S. population", value: "334.9M", numeric: 334.9, source: "Census Population Estimates, 2023" },
            { key: "medianAgeValue", label: "Median age", value: "39.2 years", numeric: 39.2, source: "ACS 1-year profile, 2023" },
            { key: "medianIncomeValue", label: "Median household income", value: "$80,610", numeric: 80.61, source: "ACS 1-year profile, 2023" }
        ],
        rows: [
            {
                label: "Population",
                displayValue: "334.9M",
                ratio: 0.84,
                note: "A larger country with more infrastructure, housing, and energy pressure."
            },
            {
                label: "Median age",
                displayValue: "39.2 years",
                ratio: 0.65,
                note: "An older population than past generations inherited at the same stage."
            },
            {
                label: "Median household income",
                displayValue: "$80.6k",
                ratio: 0.58,
                note: "Income matters, but purchasing power and housing costs matter just as much."
            }
        ]
    }
};

const THEME_COLORS = {
    "AI": "#4c2f18",
    "Semis": "#8a5a2b",
    "Energy": "#b78953",
    "Index / Macro": "#7b8c6f",
    "Alternative": "#566a7f",
    "Platform / Other": "#9a6b5f"
};

function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    }).format(value);
}

function formatSignedCurrency(value) {
    const prefix = value >= 0 ? "+" : "-";
    return `${prefix}${formatCurrency(Math.abs(value))}`;
}

function formatSignedPercent(value) {
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}${value.toFixed(2)}%`;
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

function renderStats() {
    const stats = [
        ["Household contributed", formatCurrency(portfolioData.summary.householdContributed)],
        ["Household value", formatCurrency(portfolioData.summary.householdValue)],
        ["Household gain", formatSignedCurrency(portfolioData.summary.householdGain)],
        ["Weekly cadence", formatCurrency(portfolioData.summary.weeklyCadence)],
        ["Imported accounts", `${portfolioData.summary.accounts}`],
        ["Imported positions", `${portfolioData.summary.importedPositions}`]
    ];

    const container = document.getElementById("portfolio-stats");
    if (!container) return;

    container.innerHTML = stats.map(([label, value]) => `
        <article class="stat-card">
            <span class="small-label">${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
        </article>
    `).join("");
}

function renderAccountBreakdown() {
    const container = document.getElementById("account-breakdown");
    if (!container) return;

    container.innerHTML = portfolioData.accounts.map((account) => `
        <article class="holding-item">
            <div>
                <div class="row-labels">
                    <strong>${escapeHtml(account.name)}</strong>
                    <span>${escapeHtml(account.accountType)}</span>
                </div>
                <div class="holding-meta">
                    <span>${escapeHtml(formatCurrency(account.currentValue))} current value</span>
                    <span>&bull;</span>
                    <span>${escapeHtml(formatCurrency(account.contributed))} contributed</span>
                    <span>&bull;</span>
                    <span>${account.positions} imported positions</span>
                </div>
            </div>
            <div class="holding-gain">
                <span class="${valueClass(account.gain)}">${escapeHtml(formatSignedCurrency(account.gain))}</span><br>
                <span>${escapeHtml(formatCurrency(account.weeklyCadence))}/week</span>
            </div>
        </article>
    `).join("");
}

function renderHoldings() {
    const container = document.getElementById("holdings-list");
    if (!container) return;

    container.innerHTML = portfolioData.holdings.map((holding) => {
        const weight = ((holding.marketValue / portfolioData.summary.householdValue) * 100).toFixed(1);
        return `
            <article class="holding-item">
                <div>
                    <div class="row-labels">
                        <strong>${escapeHtml(holding.ticker)}</strong>
                        <span>${weight}% household weight</span>
                    </div>
                    <div class="holding-meta">
                        <span>${escapeHtml(holding.label)}</span>
                        <span>&bull;</span>
                        <span>${escapeHtml(holding.account)}</span>
                        <span>&bull;</span>
                        <span>${escapeHtml(holding.theme)}</span>
                        <span>&bull;</span>
                        <span>${escapeHtml(formatCurrency(holding.marketValue))}</span>
                    </div>
                </div>
                <div class="holding-gain">
                    <span class="${valueClass(holding.totalGain)}">${escapeHtml(formatSignedCurrency(holding.totalGain))}</span><br>
                    <span class="${valueClass(holding.gainPct)}">${escapeHtml(formatSignedPercent(holding.gainPct))}</span>
                </div>
            </article>
        `;
    }).join("");
}

function renderContributionChart() {
    const container = document.getElementById("contribution-chart");
    if (!container) return;

    const max = Math.max(...portfolioData.contributions.map((item) => item.amount));
    container.innerHTML = portfolioData.contributions.map((item) => {
        const width = Math.round((item.amount / max) * 100);
        return `
            <div>
                <div class="row-labels">
                    <span>${escapeHtml(item.label)}</span>
                    <span>${escapeHtml(formatCurrency(item.amount))}</span>
                </div>
                <div class="bar-track">
                    <div class="bar-fill" style="width: ${width}%"></div>
                </div>
            </div>
        `;
    }).join("");
}

function svgText(x, y, text, className, anchor = "start") {
    return `<text x="${x}" y="${y}" class="${className}" text-anchor="${anchor}">${escapeHtml(text)}</text>`;
}

function renderTopHoldingsChart() {
    const container = document.getElementById("top-holdings-chart");
    if (!container) return;

    const data = portfolioData.holdings.slice(0, 8);
    const width = 640;
    const margin = { top: 18, right: 90, bottom: 16, left: 84 };
    const rowHeight = 44;
    const innerWidth = width - margin.left - margin.right;
    const height = margin.top + margin.bottom + rowHeight * data.length;
    const maxValue = Math.max(...data.map((item) => item.marketValue), 1);

    const bars = data.map((item, index) => {
        const y = margin.top + index * rowHeight;
        const barWidth = (item.marketValue / maxValue) * innerWidth;
        const labelY = y + 24;
        return [
            `<rect x="${margin.left}" y="${y + 6}" width="${barWidth}" height="22" rx="8" class="bar-primary"></rect>`,
            svgText(margin.left - 12, labelY, item.ticker, "chart-label", "end"),
            svgText(margin.left + barWidth + 10, labelY, formatCurrency(item.marketValue), "chart-value")
        ].join("");
    }).join("");

    container.innerHTML = `
        <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Top holdings by market value">
            ${bars}
        </svg>
    `;
}

function renderAccountSplitChart() {
    const container = document.getElementById("account-split-chart");
    if (!container) return;

    const data = portfolioData.accounts;
    const width = 520;
    const height = 300;
    const margin = { top: 20, right: 24, bottom: 54, left: 54 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const maxValue = Math.max(...data.map((item) => item.currentValue), 1);
    const slotWidth = innerWidth / data.length;
    const barWidth = Math.min(120, slotWidth * 0.55);

    const bars = data.map((item, index) => {
        const x = margin.left + index * slotWidth + (slotWidth - barWidth) / 2;
        const barHeight = (item.currentValue / maxValue) * innerHeight;
        const y = margin.top + (innerHeight - barHeight);
        const fill = index === 0 ? "#4c2f18" : "#8a5a2b";
        return [
            `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="10" fill="${fill}"></rect>`,
            svgText(x + barWidth / 2, y - 8, formatCurrency(item.currentValue), "chart-value", "middle"),
            svgText(x + barWidth / 2, height - 22, item.name, "chart-label", "middle")
        ].join("");
    }).join("");

    container.innerHTML = `
        <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Account split by current value">
            <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" class="chart-axis-line"></line>
            ${bars}
        </svg>
    `;
}

function renderThemeAllocationChart() {
    const container = document.getElementById("theme-allocation-chart");
    if (!container) return;

    const themeTotals = portfolioData.allHoldings.reduce((accumulator, holding) => {
        accumulator[holding.theme] = (accumulator[holding.theme] || 0) + holding.marketValue;
        return accumulator;
    }, {});

    const data = Object.entries(themeTotals)
        .map(([theme, value]) => ({ theme, value }))
        .sort((a, b) => b.value - a.value);

    const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
    const legendItems = data.map((item) => {
        const pct = ((item.value / total) * 100).toFixed(1);
        const color = THEME_COLORS[item.theme] || "#8a5a2b";
        return `
            <div class="theme-row">
                <span class="theme-swatch" style="background:${color}"></span>
                <span>${escapeHtml(item.theme)}</span>
                <strong>${escapeHtml(formatCurrency(item.value))}</strong>
                <span>${pct}%</span>
            </div>
        `;
    }).join("");

    const stackedWidth = data.map((item) => {
        const pct = (item.value / total) * 100;
        const color = THEME_COLORS[item.theme] || "#8a5a2b";
        return `<div class="theme-segment" style="width:${pct}%;background:${color}" title="${escapeHtml(item.theme)}: ${escapeHtml(formatCurrency(item.value))}"></div>`;
    }).join("");

    container.innerHTML = `
        <div class="theme-stack" aria-label="Theme allocation stacked bar">
            ${stackedWidth}
        </div>
        <div class="theme-legend">
            ${legendItems}
        </div>
    `;
}

function renderCensusCards() {
    const container = document.getElementById("census-cards");
    if (!container) return;

    container.innerHTML = portfolioData.census.cards.map((card) => `
        <article class="census-card">
            <span class="small-label">${escapeHtml(card.label)}</span>
            <strong>${escapeHtml(card.value)}</strong>
            <p class="census-source">${escapeHtml(card.source)}</p>
        </article>
    `).join("");
}

function renderCensusChart() {
    const container = document.getElementById("census-chart");
    if (!container) return;

    container.innerHTML = `
        <div class="census-chart-grid" aria-label="National backdrop snapshot">
            ${portfolioData.census.rows.map((row) => `
                <div class="census-row">
                    <div class="census-row-head">
                        <span>${escapeHtml(row.label)}</span>
                        <strong>${escapeHtml(row.displayValue)}</strong>
                    </div>
                    <div class="census-row-scale">
                        <div class="census-row-fill" style="width:${Math.max(10, row.ratio * 100)}%"></div>
                    </div>
                    <div class="census-row-note">${escapeHtml(row.note)}</div>
                </div>
            `).join("")}
        </div>
    `;
}

renderStats();
renderAccountBreakdown();
renderHoldings();
renderContributionChart();
renderTopHoldingsChart();
renderAccountSplitChart();
renderThemeAllocationChart();
renderCensusCards();
renderCensusChart();
