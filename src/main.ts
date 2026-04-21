import './style.css'
import { StockAPI } from './api.js'

// --- Types & State ---
type Page = 'dashboard' | 'alerts' | 'billing' | 'profile';

interface AppState {
  currentPage: Page;
  watchlist: any[];
  indices: any[];
  isSearching: boolean;
}

const state: AppState = {
  currentPage: 'dashboard',
  watchlist: [],
  indices: [],
  isSearching: false
};

// --- Core Logic ---

const init = async () => {
  setupEventListeners();
  loadPage(state.currentPage);
  startAutoRefresh();
};

const setupEventListeners = () => {
  // Bottom Nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = (e.currentTarget as HTMLElement).dataset.page as Page;
      loadPage(page);
    });
  });

  // Search Toggle
  const searchTrigger = document.querySelector('#search-trigger');
  const searchDropdown = document.querySelector('#search-dropdown') as HTMLElement;
  
  searchTrigger?.addEventListener('click', () => {
    state.isSearching = !state.isSearching;
    searchDropdown.style.display = state.isSearching ? 'block' : 'none';
    if (state.isSearching) {
      (document.querySelector('#stock-search') as HTMLInputElement).focus();
    }
  });

  // Search Logic
  const searchInput = document.querySelector('#stock-search') as HTMLInputElement;
  searchInput?.addEventListener('input', async (e) => {
    const query = (e.target as HTMLInputElement).value;
    if (query.length > 2) {
      const results = await StockAPI.searchStocks(query);
      renderSearchResults(results);
    }
  });
};

const loadPage = async (page: Page) => {
  state.currentPage = page;
  
  // UI Updates
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', (item as HTMLElement).dataset.page === page);
  });
  
  const title = document.querySelector('#header-title');
  if (title) title.textContent = page.charAt(0).toUpperCase() + page.slice(1);

  renderPage();
};

const renderPage = async () => {
  const mount = document.querySelector('#page-mount');
  if (!mount) return;

  if (state.currentPage === 'dashboard') {
    mount.innerHTML = `<div class="flex-col" style="padding: 20px 20px 100px 20px;"><div class="loading">Syncing Terminal...</div></div>`;
    await refreshData();
    mount.innerHTML = renderDashboard();
  } else {
    mount.innerHTML = `<div class="flex-col" style="padding: 80px 20px; text-align: center; opacity: 0.5;">
      <i class="material-symbols-outlined" style="font-size: 48px;">construction</i>
      <h2 class="headline-md">${state.currentPage.toUpperCase()}</h2>
      <p>Component under construction in The Sovereign Terminal.</p>
    </div>`;
  }
};

const refreshData = async () => {
  state.indices = await StockAPI.getIndices();
  state.watchlist = await StockAPI.getWatchlist();
};

const startAutoRefresh = () => {
  setInterval(async () => {
    if (state.currentPage === 'dashboard') {
      await refreshData();
      const mount = document.querySelector('#page-mount');
      if (mount) mount.innerHTML = renderDashboard();
    }
  }, 30000);
};

// --- Components ---

const renderDashboard = () => {
  return `
    <div class="flex-col" style="padding: 20px 20px 100px 20px;">
      <!-- Indices -->
      <section class="flex-row" style="gap: 12px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 8px;">
        ${state.indices.map(idx => `
          <div class="surface-low ghost-border" style="padding: 16px; border-radius: var(--radius-lg); flex: 1; min-width: 160px;">
            <span class="label-sm">${idx.symbol}</span>
            <div class="tabular" style="font-size: 1.25rem; font-weight: 700; margin: 4px 0;">${idx.price}</div>
            <span class="label-sm ${idx.trend === 'up' ? 'gain' : 'loss'}" style="font-weight: 600;">
              ${idx.change} (${idx.change_p})
            </span>
          </div>
        `).join('')}
      </section>

      <!-- Sentiment -->
      <section class="surface-high shadow-premium" style="padding: 20px; border-radius: var(--radius-xl); margin-bottom: 12px;">
        <span class="label-sm">Indian Market Sentiment</span>
        <h3 class="headline-md" style="margin: 8px 0; color: var(--color-secondary);">Strong Bullish</h3>
        <p style="font-size: 0.875rem; color: var(--color-on-surface-variant);">
          Overall sentiment remains driven by strong IT and Banking sectors. Nifty 50 is testing critical resistance.
        </p>
        <div style="margin-top: 16px; height: 4px; background: var(--color-surface-low); border-radius: 2px;">
          <div style="width: 72%; height: 100%; background: var(--color-secondary); border-radius: 2px; box-shadow: 0 0 10px var(--color-secondary);"></div>
        </div>
        <div class="flex-row" style="margin-top: 8px;">
          <span class="label-sm">Fear</span>
          <span class="label-sm" style="color: var(--color-secondary);">Greed (72)</span>
        </div>
      </section>

      <!-- Watchlist -->
      <section>
        <div class="flex-row" style="margin-bottom: 16px;">
          <h2 class="headline-md">Watchlist</h2>
          <span class="label-sm">India Market</span>
        </div>
        <div class="flex-col">
          ${state.watchlist.map(stock => `
            <div class="surface-low card ghost-border flex-row">
              <div style="flex: 1;">
                <div style="font-weight: 700; font-family: var(--font-editorial);">${stock.symbol}</div>
                <div class="label-sm" style="text-transform: none;">${stock.name}</div>
              </div>
              <div style="text-align: right;">
                <div class="tabular" style="font-weight: 700; font-size: 1.1rem;">₹${stock.price}</div>
                <div class="tabular label-sm ${stock.trend === 'up' ? 'gain' : 'loss'}" style="font-weight: 600;">
                  ${stock.change_p}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    </div>
  `;
};

const renderSearchResults = (results: any[]) => {
  const container = document.querySelector('#search-results');
  if (!container) return;
  
  if (results.length === 0) {
    container.innerHTML = `<div class="label-sm" style="padding: 8px;">No stocks found.</div>`;
    return;
  }

  container.innerHTML = results.map(r => `
    <div class="surface-highest" style="padding: 12px; border-radius: var(--radius-md); margin-bottom: 4px; cursor: pointer;">
      <div style="font-weight: 600;">${r.symbol}</div>
      <div class="label-sm" style="text-transform: none;">${r.name}</div>
    </div>
  `).join('');
};

// --- Fire it up ---
init();
