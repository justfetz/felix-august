const portfolioData = {
    summary: {
        totalContributed: 18450,
        currentValue: 24380,
        totalGain: 5930,
        weeklyCadence: "$25-$50"
    },
    holdings: [
        {
            ticker: "NVDA",
            label: "AI compute",
            account: "Fidelity",
            weight: 28,
            gainPct: 31.4
        },
        {
            ticker: "MSFT",
            label: "platform + cloud",
            account: "Fidelity",
            weight: 19,
            gainPct: 18.2
        },
        {
            ticker: "TSM",
            label: "semiconductor manufacturing",
            account: "Fidelity",
            weight: 14,
            gainPct: 12.6
        },
        {
            ticker: "VOO",
            label: "core index",
            account: "Long-term core",
            weight: 24,
            gainPct: 16.1
        },
        {
            ticker: "Options",
            label: "small risk sleeve",
            account: "thinkorswim",
            weight: 6,
            gainPct: 8.4
        },
        {
            ticker: "Cash",
            label: "dry powder",
            account: "Reserve",
            weight: 9,
            gainPct: 0
        }
    ],
    contributions: [
        { label: "Month 1", amount: 125 },
        { label: "Month 2", amount: 175 },
        { label: "Month 3", amount: 150 },
        { label: "Month 4", amount: 200 },
        { label: "Month 5", amount: 175 },
        { label: "Month 6", amount: 225 }
    ]
};

function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    }).format(value);
}

function renderStats() {
    const stats = [
        ["Total contributed", formatCurrency(portfolioData.summary.totalContributed)],
        ["Current value", formatCurrency(portfolioData.summary.currentValue)],
        ["Total gain", formatCurrency(portfolioData.summary.totalGain)],
        ["Weekly cadence", portfolioData.summary.weeklyCadence]
    ];

    const container = document.getElementById("portfolio-stats");
    if (!container) return;

    container.innerHTML = stats
        .map(([label, value]) => `
            <article class="stat-card">
                <span class="small-label">${label}</span>
                <strong>${value}</strong>
            </article>
        `)
        .join("");
}

function renderHoldings() {
    const container = document.getElementById("holdings-list");
    if (!container) return;

    container.innerHTML = portfolioData.holdings
        .map((holding) => `
            <article class="holding-item">
                <div>
                    <div class="row-labels">
                        <strong>${holding.ticker}</strong>
                        <span>${holding.weight}% weight</span>
                    </div>
                    <div class="holding-meta">
                        <span>${holding.label}</span>
                        <span>•</span>
                        <span>${holding.account}</span>
                    </div>
                </div>
                <div class="holding-gain">${holding.gainPct >= 0 ? "+" : ""}${holding.gainPct}%</div>
            </article>
        `)
        .join("");
}

function renderContributionChart() {
    const container = document.getElementById("contribution-chart");
    if (!container) return;

    const max = Math.max(...portfolioData.contributions.map((item) => item.amount));
    container.innerHTML = portfolioData.contributions
        .map((item) => {
            const width = Math.round((item.amount / max) * 100);
            return `
                <div>
                    <div class="row-labels">
                        <span>${item.label}</span>
                        <span>${formatCurrency(item.amount)}</span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${width}%"></div>
                    </div>
                </div>
            `;
        })
        .join("");
}

renderStats();
renderHoldings();
renderContributionChart();