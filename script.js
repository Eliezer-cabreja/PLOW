let tokenomicsChartInstance = null;


function renderEmptyChart() {
    const canvas = document.getElementById('tokenomicsChart');
    if (!canvas) return;

    if (tokenomicsChartInstance) {
        tokenomicsChartInstance.destroy();
    }

    tokenomicsChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Sin datos verificables'],
            datasets: [{
                data: [1],
                backgroundColor: ['rgba(63, 63, 70, 0.6)'],
                borderColor: '#09090b',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#a1a1aa',
                        font: { family: 'Outfit', size: 12, weight: '600' },
                        padding: 14,
                        boxWidth: 12,
                        boxHeight: 12
                    }
                },
                tooltip: { enabled: false }
            }
        }
    });
}

async function loadRealDistribution(wallets) {
    const MINT = "EpvKSsJNfEH24Pt5BQQQhYBrbHXbhdE5hXXbxhGKRpLT";
    const RPC = "https://api.mainnet-beta.solana.com";

    async function getBalance(wallet) {
        const res = await fetch(RPC, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0", id: 1,
                method: "getTokenAccountsByOwner",
                params: [
                    wallet,
                    { mint: MINT },
                    { encoding: "jsonParsed" }
                ]
            })
        });
        const data = await res.json();
        return data.result.value.reduce(
            (s, a) => s + a.account.data.parsed.info.tokenAmount.uiAmount, 0
        );
    }

    const [liq, mkt, com] = await Promise.all([
        getBalance(wallets.liquidity),
        getBalance(wallets.marketing),
        getBalance(wallets.community)
    ]);

    const total = liq + mkt + com || 1;
    const data = [
        +(liq / total * 100).toFixed(2),
        +(mkt / total * 100).toFixed(2),
        +(com / total * 100).toFixed(2)
    ];

    const canvas = document.getElementById('tokenomicsChart');
    if (tokenomicsChartInstance) tokenomicsChartInstance.destroy();

    tokenomicsChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Pool de Liquidez', 'Marketing', 'Comunidad'],
            datasets: [{
                data,
                backgroundColor: ['#fbbf24', '#d97706', '#fde68a'],
                borderColor: '#09090b',
                borderWidth: 3,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#f4f4f5',
                        font: { family: 'Outfit', size: 12, weight: '600' },
                        padding: 14,
                        boxWidth: 12,
                        boxHeight: 12
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(9,9,11,0.95)',
                    borderColor: 'rgba(251,191,36,0.5)',
                    borderWidth: 1,
                    titleFont: { family: 'Outfit', weight: '700' },
                    bodyFont: { family: 'Outfit' },
                    callbacks: { label: (ctx) => ` ${ctx.parsed}%` }
                }
            }
        }
    });
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const content = document.getElementById('content-' + tabId);
    const btn = document.getElementById('tab-' + tabId);

    if (content) content.classList.remove('hidden');
    if (btn) btn.classList.add('active');

    if (tabId === 'tokenomics') {
        setTimeout(() => {
            if (!tokenomicsChartInstance) renderEmptyChart();
        }, 30);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copyContract() {
    const address = "EpvKSsJNfEH24Pt5BQQQhYBrbHXbhdE5hXXbxhGKRpLT";
    navigator.clipboard.writeText(address);
    const alertBox = document.getElementById('copyAlert');
    alertBox.classList.remove('hidden');
    setTimeout(() => alertBox.classList.add('hidden'), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    renderEmptyChart();
});