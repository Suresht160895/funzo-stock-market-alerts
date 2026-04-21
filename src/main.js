import { createChart } from 'lightweight-charts';
import { StockAPI } from './api.js';

// State
const state = {
  activePage: 'dashboard',
  selectedStock: null,
  watchlist: [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2987.40, change: 1.24 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3954.10, change: -0.85 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1446.00, change: 0.82 },
    { symbol: 'INFY', name: 'Infosys Limited', price: 1624.95, change: 2.15 },
  ],
  alerts: []
};

// Renderer
const mountPoint = document.getElementById('page-mount');

async function render() {
  mountPoint.innerHTML = '<div class="flex-col" style="align-items: center; justify-content: center; height: 50vh;"><div class="spinner"></div></div>';
  
  if (state.activePage === 'dashboard') {
    renderDashboard();
  } else if (state.activePage === 'alerts') {
    renderAlerts();
  } else if (state.activePage === 'billing') {
    renderBilling();
  } else if (state.activePage === 'details') {
    renderDetails();
  }
}

async function renderDashboard() {
  const trending = await StockAPI.getTrending();
  
  mountPoint.innerHTML = `
    <div class="flex-col">
      <section>
        <span class="label-sm">Market Status</span>
        <div class="flex-row" style="margin-top: 8px;">
          <h2 class="headline-md">India Indices</h2>
          <span class="btn btn-ghost glass" style="padding: 4px 12px; font-size: 0.75rem; color: #4edea3;">
            <i class="material-symbols-outlined" style="font-size: 14px;">circle</i> OPEN
          </span>
        </div>
      </section>

      <section class="flex-row" style="gap: 16px; overflow-x: auto; padding-bottom: 8px;">
        <div class="card" style="min-width: 160px; padding: 16px;">
          <span class="label-sm">NIFTY 50</span>
          <div class="tabular" style="font-size: 1.25rem; font-weight: 700; margin-top: 4px;">22,147.80</div>
          <div class="tabular gain" style="font-size: 0.875rem;">+152.10 (0.69%)</div>
        </div>
        <div class="card" style="min-width: 160px; padding: 16px;">
          <span class="label-sm">SENSEX</span>
          <div class="tabular" style="font-size: 1.25rem; font-weight: 700; margin-top: 4px;">72,943.15</div>
          <div class="tabular gain" style="font-size: 0.875rem;">+482.35 (0.67%)</div>
        </div>
      </section>

      <section>
        <div class="flex-row" style="margin-bottom: 12px;">
          <h3 class="headline-md" style="font-size: 1.25rem;">Watchlist</h3>
          <span class="btn btn-ghost" style="font-size: 0.875rem;">Edit</span>
        </div>
        <div class="flex-col" style="gap: 12px;">
          ${state.watchlist.map((stock, index) => `
            <div class="card flex-row stock-item" style="padding: 16px; cursor: pointer;" data-index="${index}">
              <div>
                <div style="font-weight: 700;">${stock.symbol}</div>
                <div class="label-sm" style="text-transform: none;">${stock.name}</div>
              </div>
              <div style="text-align: right;">
                <div class="tabular" style="font-weight: 700;">₹${stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                <div class="tabular ${stock.change >= 0 ? 'gain' : 'loss'}">
                  ${stock.change >= 0 ? '+' : ''}${stock.change}%
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="card" style="background: linear-gradient(135deg, var(--color-surface-high), var(--color-surface-low));">
        <h3 class="headline-md" style="font-size: 1rem; margin-bottom: 8px;">Market Sentiment</h3>
        <p style="font-size: 0.875rem; color: var(--color-on-surface-variant);">
          Overall sentiment remains <span class="gain" style="font-weight: 700;">BULLISH</span> driven by strong IT and Banking sectors.
        </p>
        <div class="flex-row" style="margin-top: 16px;">
          <div>
            <span class="label-sm">Fear & Greed</span>
            <div class="display-lg" style="font-size: 2rem;">72</div>
          </div>
          <div class="btn btn-alert">Greed Index</div>
        </div>
      </section>
    </div>
  `;

  document.querySelectorAll('.stock-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = item.getAttribute('data-index');
      state.selectedStock = state.watchlist[index];
      state.activePage = 'details';
      render();
    });
  });
}

function renderAlerts() {
  mountPoint.innerHTML = `
    <div class="flex-col">
      <h2 class="headline-md">Active Alerts</h2>
      <div class="card flex-col" style="align-items: center; padding: 48px 24px; text-align: center;">
        <i class="material-symbols-outlined" style="font-size: 48px; color: var(--color-on-surface-variant);">notifications_off</i>
        <p style="margin-top: 16px; color: var(--color-on-surface-variant);">No active alerts. Set price targets to stay ahead of the market.</p>
        <button class="btn btn-primary" style="margin-top: 24px;">Create New Alert</button>
      </div>
    </div>
  `;
}

function renderBilling() {
  mountPoint.innerHTML = `
    <div class="flex-col">
      <h2 class="headline-md">Subscription Plans</h2>
      
      <div class="card flex-col" style="border: 2px solid var(--color-primary);">
        <div class="flex-row">
          <h3 style="font-size: 1.25rem;">Pro Terminal</h3>
          <span class="gain label-sm" style="background: rgba(78, 222, 163, 0.1); padding: 4px 8px; border-radius: 4px;">Active</span>
        </div>
        <p style="font-size: 0.875rem; color: var(--color-on-surface-variant);">Unlock real-time data, advanced charts, and unlimited push alerts.</p>
        <div class="display-lg" style="font-size: 2.5rem; margin: 16px 0;">₹299<span style="font-size: 1rem; color: var(--color-on-surface-variant);">/month</span></div>
        <ul style="font-size: 0.875rem; list-style: none; display: flex; flex-direction: column; gap: 8px;">
          <li><i class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">check_circle</i> Real-time NSE/BSE Feeds</li>
          <li><i class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">check_circle</i> Advanced TradingView Charts</li>
          <li><i class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">check_circle</i> Custom Price Notifications</li>
        </ul>
        <button id="pay-pro" class="btn btn-primary" style="margin-top: 24px;">Manage Billing</button>
      </div>

      <div class="card flex-col" style="opacity: 0.8;">
        <h3 style="font-size: 1.25rem;">Free Terminal</h3>
        <p style="font-size: 0.875rem; color: var(--color-on-surface-variant);">Standard market data with 15-min delay.</p>
        <div class="display-lg" style="font-size: 2.5rem; margin: 16px 0;">₹0<span style="font-size: 1rem; color: var(--color-on-surface-variant);">/forever</span></div>
        <button class="btn btn-ghost" disabled>Current Plan</button>
      </div>
    </div>
  `;
  
  document.getElementById('pay-pro')?.addEventListener('click', handlePayment);
}

async function handlePayment() {
  try {
    // Note: You must deploy the server to Render and update this URL
    const response = await fetch('https://funzo-stock-alerts.onrender.com/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_amount: 299.00,
        customer_details: {
          customer_id: 'user_123',
          customer_email: 'user@example.com',
          customer_phone: '9999999999'
        }
      })
    });
    
    const data = await response.json();
    
    if (data.payment_session_id) {
      const cashfree = new Cashfree({ mode: "production" });
      cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
      });
    }
  } catch (error) {
    console.error('Payment Error:', error);
    alert('Payment initialization failed. Please try again.');
  }
}

function renderDetails() {
  mountPoint.innerHTML = `
    <div class="flex-col">
      <div class="flex-row">
        <div>
          <span class="label-sm">${state.selectedStock.symbol}</span>
          <h2 class="headline-md">${state.selectedStock.name}</h2>
        </div>
        <div class="tabular gain" style="font-size: 1.5rem; font-weight: 700;">₹${state.selectedStock.price}</div>
      </div>
      
      <div id="chart-container" style="height: 300px; width: 100%; margin-top: 24px;"></div>
      
      <div class="flex-col" style="margin-top: 16px;">
        <button class="btn btn-alert" style="width: 100%;">Set Price Alert</button>
        <button class="btn btn-ghost" onclick="state.activePage = 'dashboard'; render();">Back to Markets</button>
      </div>
    </div>
  `;
  
  initChart();
}

function initChart() {
  const container = document.getElementById('chart-container');
  const chart = createChart(container, {
    layout: {
      backgroundColor: 'transparent',
      textColor: '#dae2fd',
    },
    grid: {
      vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
      horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
    },
    width: container.clientWidth,
    height: 300,
  });

  const lineSeries = chart.addLineSeries({
    color: '#4edea3',
    lineWidth: 2,
  });

  lineSeries.setData([
    { time: '2024-04-01', value: 2950 },
    { time: '2024-04-02', value: 2970 },
    { time: '2024-04-03', value: 2960 },
    { time: '2024-04-04', value: 2987.40 },
  ]);

  chart.timeScale().fitContent();
}

// Navigation logic
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    state.activePage = item.getAttribute('data-page');
    render();
  });
});

// Initial Render
render();
