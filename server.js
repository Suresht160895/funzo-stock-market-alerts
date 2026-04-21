import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

// Base configuration for Cashfree Production
const CF_BASE_URL = 'https://api.cashfree.com/pg/orders';

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

// Health check for Render
app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
