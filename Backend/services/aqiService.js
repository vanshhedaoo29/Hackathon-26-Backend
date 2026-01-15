const axios = require("axios");
const { calculateAQI } = require("../utils/aqiCalculator");

exports.getCurrentAQI = async (req, res) => {
  const city = req.query.city || "Delhi";

  try {
    const response = await axios.get(
      "https://api.openaq.org/v2/latest",
      {
        params: {
          city,
          limit: 1
        },
        timeout: 10000
      }
    );

    // ✅ SAFE CHECK
    if (!response.data.results || response.data.results.length === 0) {
      return res.status(404).json({
        error: "No AQI data available for this city"
      });
    }

    const measurements = response.data.results[0].measurements || [];

    let pm25 = 0, pm10 = 0, no2 = 0;

    measurements.forEach(m => {
      if (m.parameter === "pm25") pm25 = m.value;
      if (m.parameter === "pm10") pm10 = m.value;
      if (m.parameter === "no2") no2 = m.value;
    });

    // ❗ fallback if OpenAQ returns partial data
    if (pm25 === 0 && pm10 === 0 && no2 === 0) {
      return res.status(404).json({
        error: "Pollutant data unavailable for this city"
      });
    }

    const aqiResult = calculateAQI({ pm25, pm10, no2 });

    res.json({
      city,
      aqi: aqiResult.value,
      category: aqiResult.category,
      dominantPollutant: aqiResult.dominant,
      pollutants: { pm25, pm10, no2 },
      lastUpdated: new Date()
    });

  } catch (err) {
    console.error("OpenAQ Error:", err.message);
    res.status(500).json({
      error: "Failed to fetch government AQI data"
    });
  }
};
