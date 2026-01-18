const axios = require("axios");
const { calculateAQI } = require("../utils/aqiCalculator");
const { saveAQIData } = require("../services/historyService");

exports.getCurrentAQI = async (req, res) => {
  const city = req.query.city || "Delhi";

  try {
    const response = await axios.get(
      `https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69?api-key=579b464db66ec23bdd000001654b323cdf4c4f64692b194118d49851&filters%5Bcity%5D=${city}`,
      {
        params: {
          format: 'json',
          limit: 25 // fetch enough records to find all pollutants
        }
      }
    );

    const records = response.data.records || [];

    const cityRecords = records.filter(
      r => r.city?.toLowerCase() === city.toLowerCase()
    );

    if (!cityRecords.length) {
      return res.status(404).json({ error: "No AQI data found for this city" });
    }

    const requiredPollutants = ["PM2.5", "PM10", "NO2", "SO2", "OZONE", "NH3"];

    let pm25 = 0, pm10 = 0, no2 = 0, so2 = 0, ozone = 0, nh3 = 0;
    const found = new Set();

    for (const r of cityRecords) {
      const pollutant = r.pollutant_id?.toUpperCase();
      const value = Number(r.avg_value);

      if (!requiredPollutants.includes(pollutant)) continue;
      if (isNaN(value)) continue;

      if (!found.has(pollutant)) {
        if (pollutant === "PM2.5") pm25 = value;
        if (pollutant === "PM10") pm10 = value;
        if (pollutant === "NO2") no2 = value;
        if (pollutant === "SO2") so2 = value;
        if (pollutant === "OZONE") ozone = value;
        if (pollutant === "NH3") nh3 = value;
        found.add(pollutant);
      }

      // 🚀 Stop once all pollutants are found
      if (found.size === requiredPollutants.length) break;
    }

    if (pm25 === 0 && pm10 === 0 && no2 === 0 && so2 === 0 && ozone === 0 && nh3 === 0) {
      return res.status(404).json({ error: "Pollutant values unavailable" });
    }

    const aqiResult = calculateAQI({ pm25, pm10, no2, so2, ozone, nh3 });
    //format date
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    // local ISO-like format (YYYY-MM-DDTHH:MM:SS)
    const localISO = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

    const entry = {
      city,
      aqi: aqiResult.value,
      category: aqiResult.category,
      dominantPollutant: aqiResult.dominant,
      pollutants: { pm25, pm10, no2, so2, ozone, nh3 },
      lastUpdated: localISO 
    };
    res.json(entry);
    saveAQIData(entry);

  } catch (error) {
    console.error("Gov API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch AQI data" });
  }
};
