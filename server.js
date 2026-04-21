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

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

const PORT = process.env.PORT || 3000;
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const STOCK_API_KEY = process.env.VITE_STOCK_API_KEY;

// Base configuration
const CF_BASE_URL = 'https://api.cashfree.com/pg/orders';
const STOCK_BASE_URL = 'https://analyst.indianapi.in';

app.post('/create-order', async (req, res) => {
  const { order_amount, customer_details } = req.body;

  try {
    const response = await axios.post(
      CF_BASE_URL,
      {
        order_amount: order_amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customer_details.customer_id,
          customer_email: customer_details.customer_email,
          customer_phone: customer_details.customer_phone,
        },
        order_meta: {
          return_url: 'https://funzo-stock-alerts.onrender.com/verify?order_id={order_id}',
          notify_url: 'https://funzo-stock-alerts.onrender.com/webhook',
        }
      },
      {
        headers: {
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json',
        }
      }
    );

    res.json({
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id
    });
  } catch (error) {
    console.error('Cashfree Order Creation Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to create Cashfree order' });
  }
});

// Proxy for Market Indices (NSE + BSE)
app.get('/api/indices', async (req, res) => {
  try {
    const headers = { 'X-API-Key': STOCK_API_KEY };
    
    // Fetch NSE Popular
    const nseReq = axios.get(`${STOCK_BASE_URL}/indices?exchange=NSE&index_type=POPULAR`, { headers });
    // Fetch BSE Popular
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

// Health check
app.get('/health', (req, res) => res.send('OK'));

// Catch-all to serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
