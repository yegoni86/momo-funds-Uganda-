const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;
const AUTOPAY_SECRET = process.env.AUTOPAY_SECRET;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/**
 * Uganda STK Push
 * POST /api/uganda/stk-push
 */
app.post("/api/uganda/stk-push", async (req, res) => {
  try {
    let { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({
        success: false,
        message: "Phone and amount are required."
      });
    }

    // Convert 07xxxxxxxx -> 2567xxxxxxxx
    phone = phone.toString().replace(/\s+/g, "");

    if (phone.startsWith("0")) {
      phone = "256" + phone.substring(1);
    }

    if (!phone.startsWith("256")) {
      return res.status(400).json({
        success: false,
        message: "Use a valid Uganda phone number."
      });
    }

    const response = await axios.post(
      "https://autopay.co.ke/api/global/uganda/stk-push",
      {
        phone,
        amount: Number(amount)
      },
      {
        headers: {
          Authorization: `Bearer ${AUTOPAY_SECRET}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.response?.data?.message || "Failed to send STK Push."
    });
  }
});

/**
 * Check payment status
 * GET /api/uganda/status/:id
 */
app.get("/api/uganda/status/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `https://autopay.co.ke/api/global/uganda/status/${req.params.id}`,
      {
        headers: {
          Authorization: `Bearer ${AUTOPAY_SECRET}`
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.response?.data?.message || "Status check failed."
    });
  }
});

/**
 * Exchange Rate
 */
app.get("/api/uganda/rate", async (req, res) => {
  try {
    const response = await axios.get(
      "https://autopay.co.ke/api/global/uganda/rate",
      {
        headers: {
          Authorization: `Bearer ${AUTOPAY_SECRET}`
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch exchange rate."
    });
  }
});

/**
 * Merchant Uganda Wallet
 */
app.get("/api/uganda/account", async (req, res) => {
  try {
    const response = await axios.get(
      "https://autopay.co.ke/api/global/uganda/account",
      {
        headers: {
          Authorization: `Bearer ${AUTOPAY_SECRET}`
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch account."
    });
  }
});

/**
 * Merchant Uganda Transactions
 */
app.get("/api/uganda/transactions", async (req, res) => {
  try {
    const response = await axios.get(
      "https://autopay.co.ke/api/global/uganda/transactions",
      {
        headers: {
          Authorization: `Bearer ${AUTOPAY_SECRET}`
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions."
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
