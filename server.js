const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Temporary transaction store
const transactions = new Map();

/*
  STK Push placeholder endpoint.
  Replace this with your real MTN MoMo API integration later.
*/
app.post("/stk-push", (req, res) => {
  const { phone, amount } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({
      success: false,
      message: "Phone and amount are required."
    });
  }

  const transactionId = crypto.randomUUID();

  transactions.set(transactionId, {
    phone,
    amount,
    status: "PENDING",
    createdAt: Date.now()
  });

  res.json({
    success: true,
    message: "Payment request created.",
    transactionId
  });
});

/*
  Payment status endpoint.
  Replace this with real MTN MoMo status checking.
*/
app.post("/payment-status", (req, res) => {
  const { transactionId } = req.body;

  const tx = transactions.get(transactionId);

  if (!tx) {
    return res.status(404).json({
      success: false,
      message: "Transaction not found."
    });
  }

  res.json({
    success: true,
    data: {
      transactionId,
      status: tx.status,
      amount: tx.amount,
      phone: tx.phone
    }
  });
});

// Example endpoint to simulate success while testing
app.post("/simulate-success", (req, res) => {
  const { transactionId } = req.body;

  const tx = transactions.get(transactionId);

  if (!tx) {
    return res.status(404).json({
      success: false,
      message: "Transaction not found."
    });
  }

  tx.status = "SUCCESS";

  res.json({
    success: true,
    message: "Transaction marked as successful."
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "MoFunds Uganda Backend"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
