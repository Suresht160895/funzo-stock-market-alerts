import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const STOCK_API_KEY = process.env.VITE_STOCK_API_KEY;

// Base configuration
const CF_BASE_URL = 'https://api.cashfree.com/pg/orders';
const STOCK_BASE_URL = 'https://analyst.indianapi.in';

// Health check and heartbeat (Place before static)
app.get('/health', (req, res) => res.send('OK'));
app.get('/api/ping', (req, res) => res.json({ status: 'active', timestamp: new Date() }));

// Proxy for Market Indices (NSE + BSE)
app.get('/api/indices', async (req, res) => {
  console.log('Incoming request: /api/indices');
  try {
    const headers = { 'X-API-Key': STOCK_API_KEY };
    const nseReq = axios.get(`${STOCK_BASE_URL}/indices?exchange=NSE&index_type=POPULAR`, { headers });
    const bseReq = axios.get(`${STOCK_BASE_URL}/indices?exchange=BSE&index_type=POPULAR`, { headers });
    const [nseRes, bseRes] = await Promise.allSettled([nseReq, bseReq]);
    const combinedIndices = [];
    if (nseRes.status === 'fulfilled') combinedIndices.push(...(nseRes.value.data.indices || []));
    if (bseRes.status === 'fulfilled') combinedIndices.push(...(bseRes.value.data.indices || []));
    res.json({ indices: combinedIndices });
  } catch (error) {
    console.error('Indices Proxy Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch indices' });
  }
});

// Proxy for Search
app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  console.log(`Incoming request: /api/search?query=${query}`);
  try {
    const response = await axios.get(`${STOCK_BASE_URL}/industry_search?query=${query}`, {
      headers: { 'X-API-Key': STOCK_API_KEY }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Search Proxy Error:', error.message);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

app.post('/create-order', async (req, res) => {
  // ... existing order logic
});

// Serve static files AFTER API routes
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all to serve index.html for SPA routing
app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Funzo Stock Alerts Backend Active`);
  console.log(`Port: ${PORT}`);
  console.log(`Static Directory: ${path.join(__dirname, 'dist')}`);
});
