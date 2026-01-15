const express = require("express");
const { getCurrentAQI } = require("../services/aqiService");

const router = express.Router();

// Example: /api/aqi/current?city=Delhi
router.get("/current", getCurrentAQI);

module.exports = router;

