const axios = require("axios");

exports.askGemini = async (message, aqi, category) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1alpha/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are an air quality assistant.

Current AQI: ${aqi}
AQI Category: ${category}

User question: ${message}

Explain clearly in simple language and give health advice if needed.`
              }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    // Safety check
    if (
      !response.data ||
      !response.data.candidates ||
      response.data.candidates.length === 0
    ) {
      throw new Error("Empty Gemini response");
    }

    return response.data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error(
      "❌ Gemini API Error:",
      error.response?.data || error.message
    );
    throw new Error("Gemini chatbot failed");
  }
};
