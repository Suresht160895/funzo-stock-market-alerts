const BASE_URL = 'https://stock.indianapi.in';
const API_KEY = import.meta.env.VITE_STOCK_API_KEY;

export const StockAPI = {
  async getTrending() {
    try {
      const response = await fetch(`${BASE_URL}/trending`, {
        headers: { 'x-api-key': API_KEY }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching trending stocks:', error);
      return [];
    }
  },

  async getStockDetails(symbol) {
    try {
      const response = await fetch(`${BASE_URL}/stock?name=${symbol}`, {
        headers: { 'x-api-key': API_KEY }
      });
      return await response.json();
    } catch (error) {
      console.error(`Error fetching details for ${symbol}:`, error);
      return null;
    }
  },

  async getNews() {
    try {
      const response = await fetch(`${BASE_URL}/news`, {
        headers: { 'x-api-key': API_KEY }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }
};
