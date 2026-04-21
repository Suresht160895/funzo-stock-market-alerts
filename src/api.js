const BASE_URL = 'https://analyst.indianapi.in';
const API_KEY = import.meta.env.VITE_STOCK_API_KEY;

export const StockAPI = {
  async getIndices() {
    try {
      // Use absolute URL for Capacitor/Mobile compatibility
      const response = await fetch('https://funzo-stock-alerts.onrender.com/api/indices');
      const data = await response.json();
      const results = data.indices || [];
      
      // Map and prioritize NIFTY 50 and SENSEX
      return results.filter(i => i.name === 'NIFTY 50' || i.name === 'SENSEX').map(i => ({
        symbol: i.name,
        price: i.price,
        change: i.netChange,
        change_p: i.percentChange + '%',
        trend: parseFloat(i.netChange) >= 0 ? 'up' : 'down'
      }));
    } catch (error) {
      console.error('Error fetching indices:', error);
      return [];
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
    return []; // State-based watchlist handling
  },

  async searchStocks(query) {
    if (!query) return [];
    try {
      // Use absolute URL for Capacitor/Mobile compatibility
      const response = await fetch(`https://funzo-stock-alerts.onrender.com/api/search?query=${query}`);
      const data = await response.json();
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
