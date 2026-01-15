// const express = require("express");
// const { askGemini } = require("../services/geminiServices");

// const router = express.Router();

// router.post("/", async (req, res) => {
//   try {
//     const { message, aqi, category } = req.body;

//     // 1️⃣ Validate input
//     if (!message) {
//       return res.status(400).json({ error: "Message is required" });
//     }

//     // 2️⃣ Call Gemini service
//     const reply = await askGemini(message, aqi, category);

//     // 3️⃣ Send response
//     res.json({ reply });

//   } catch (err) {
//     res.status(500).json({ error: "Gemini chatbot failed" });
//   }
// });

// module.exports = router;



const express = require("express");
const { askGemini } = require("../services/geminiServices");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, aqi, category } = req.body;

    console.log("📩 Incoming chat request:", req.body);

    const reply = await askGemini(
      message || "Hello",
      aqi || "Unknown",
      category || "Unknown"
    );

    res.json({ reply });

  } catch (error) {
    // 🔴 THIS IS THE KEY PART
    console.error("🔥 CHAT ROUTE ERROR:");
    console.error(error.message);
    console.error(error.stack);

    res.status(500).json({
      error: "Gemini chatbot failed",
      debug: error.message
    });
  }
});

module.exports = router;


