const BASE_URL = 'https://stock.indianapi.in';
const API_KEY = import.meta.env.VITE_STOCK_API_KEY;

export const StockAPI = {
  async getIndices() {
    // In a real scenario, this would fetch Nifty/Sensex. 
    // Mocking for now to match Stitch Market Dashboard until actual endpoints are verified.
    return [
      { symbol: 'NIFTY 50', price: '22,147.20', change: '+124.50', change_p: '+0.56%', trend: 'up' },
      { symbol: 'BSE SENSEX', price: '73,088.33', change: '+450.12', change_p: '+0.62%', trend: 'up' }
    ];
  },

  async getWatchlist() {
    // Default watchlist as seen in Stitch
    const symbols = ['RELIANCE', 'TATAMOTORS', 'HDFCBANK', 'INFY'];
    try {
      // Mock data for demo if API_KEY is missing
      if (!API_KEY) {
        return [
          { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: '2,987.40', change: '+36.50', change_p: '+1.24%', trend: 'up' },
          { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', price: '984.15', change: '-4.45', change_p: '-0.45%', trend: 'down' },
          { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: '1,446.00', change: '+11.80', change_p: '+0.82%', trend: 'up' },
          { symbol: 'INFY', name: 'Infosys Limited', price: '1,624.95', change: '+34.20', change_p: '+2.15%', trend: 'up' }
        ];
      }

      // Real fetch if API is configured
      const response = await fetch(`${BASE_URL}/trending`, {
        headers: { 'x-api-key': API_KEY }
      });
      const data = await response.json();
      return data.slice(0, 4).map((s) => ({
        symbol: s.symbol,
        name: s.name,
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
      const response = await fetch(`${BASE_URL}/search?name=${query}`, {
        headers: { 'x-api-key': API_KEY }
      });
      return await response.json();
    } catch (error) {
      return [];
    }
  }
};
