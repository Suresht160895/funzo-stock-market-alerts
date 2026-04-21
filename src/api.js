const BASE_URL = 'https://analyst.indianapi.in';
const API_KEY = import.meta.env.VITE_STOCK_API_KEY;

export const StockAPI = {
  async getIndices() {
    try {
      const response = await fetch(`${BASE_URL}/indices?exchange=NSE&index_type=POPULAR`, {
        headers: { 'X-API-Key': API_KEY }
      });
      const data = await response.json();
      const results = data.indices || [];
      return results.filter(i => i.name === 'NIFTY 50' || i.name === 'SENSEX').map(i => ({
        symbol: i.name,
        price: i.price,
        change: i.netChange,
        change_p: i.percentChange + '%',
        trend: parseFloat(i.netChange) >= 0 ? 'up' : 'down'
      }));
    } catch (error) {
      console.error('Error fetching indices:', error);
      return [
        { symbol: 'NIFTY 50', price: '22,147.20', change: '+124.50', change_p: '+0.56%', trend: 'up' },
        { symbol: 'BSE SENSEX', price: '73,088.33', change: '+450.12', change_p: '+0.62%', trend: 'up' }
      ];
    }
  },

  async getWatchlist() {
    if (!API_KEY) {
      return [
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: '2,987.40', change: '+36.50', change_p: '+1.24%', trend: 'up' },
        { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', price: '984.15', change: '-4.45', change_p: '-0.45%', trend: 'down' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: '1,446.00', change: '+11.80', change_p: '+0.82%', trend: 'up' },
        { symbol: 'INFY', name: 'Infosys Limited', price: '1,624.95', change: '+34.20', change_p: '+2.15%', trend: 'up' }
      ];
    }

    try {
      // Using trending as a proxy for watchlist details if specific IDs aren't provided
      const response = await fetch(`${BASE_URL}/trending`, {
        headers: { 'X-API-Key': API_KEY }
      });
      const data = await response.json();
      return (data.trending || []).slice(0, 4).map((s) => ({
        symbol: s.exchangeCodeNsi || s.symbol,
        name: s.commonName || s.name,
        price: s.lastPrice || '0.00',
        change: s.change || '0.00',
        change_p: s.pChange || '0.00%',
        trend: parseFloat(s.change) >= 0 ? 'up' : 'down'
      }));
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      return [];
    }
  },

  async searchStocks(query) {
    if (!query) return [];
    try {
      const response = await fetch(`${BASE_URL}/industry_search?query=${query}`, {
        headers: { 'X-API-Key': API_KEY }
      });
      const results = await response.json();
      // Map Analyst API search results (commonName, exchangeCodeNsi) to our format
      return (results || []).map(r => ({
        symbol: r.exchangeCodeNsi || r.exchangeCodeBse || 'N/A',
        name: r.commonName || 'Unknown'
      }));
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }
};
