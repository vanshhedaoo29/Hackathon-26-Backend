const express = require("express");
const router = express.Router();
const historyService = require("../services/historyService");

router.get("/", (req, res) => {
  res.render("pages/index", { title: "AQI Dashboard" });
});
router.get("/history", (req, res) => {
  res.render("pages/aqi_history", { city: req.query.city || "Delhi" });
});



module.exports = router;