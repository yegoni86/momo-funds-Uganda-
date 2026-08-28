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

    // Validate Uganda format (256 + 9 digits)
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

    const response = await axios.post(
      "https://autopay.co.ke/api/global/uganda/stk-push",
      {
        phone: phone,
        amount: amount
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AUTOPAY_SECRET}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.json(response.data);

  } catch (error) {
    console.log("AUTOPAY ERROR:", error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Payment request failed."
    });
  }
});
