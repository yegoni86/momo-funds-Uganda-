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

// Uganda STK Push
app.post("/api/uganda/stk-push", async (req, res) => {
  try {
    let { phone, amount } = req.body;

    if (!phone || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Phone and amount are required."
      });
    }

    // Keep digits only
    phone = String(phone).replace(/\D/g, "");

    // Convert 07XXXXXXXX -> 2567XXXXXXXX
    if (phone.startsWith("0")) {
      phone = "256" + phone.slice(1);
    }

    // Validate Uganda number (256 + 9 digits)
    if (!/^256\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Use a valid Uganda phone number."
      });
    }

    amount = parseInt(amount, 10);

    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount."
      });
    }

    const payload = { phone, amount };

    console.log("AUTOPAY REQUEST:", payload);

    const response = await axios.post(
      "https://autopay.co.ke/api/global/uganda/stk-push",
      payload,
      {
        headers: {
          Authorization: `Bearer ${AUTOPAY_SECRET}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    console.log("AUTOPAY RESPONSE:", response.data);

    res.json({
      success: response.data.success,
      message: response.data.message,
      transactionId: response.data.data?.transaction_id,
      data: response.data.data
    });

  } catch (error) {
    console.log("AUTOPAY STATUS:", error.response?.status);
    console.log("AUTOPAY ERROR:", error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "AUTOPAY did not respond."
    });
  }
});

// Check payment status
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

    console.log("STATUS RESPONSE:", response.data);

    res.json(response.data);

  } catch (error) {
    console.log("STATUS ERROR:", error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Status check failed."
    });
  }
});

// Uganda Exchange Rate
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

// Uganda Wallet
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

// Uganda Transactions
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
