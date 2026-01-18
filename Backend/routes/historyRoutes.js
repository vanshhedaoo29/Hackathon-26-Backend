const express = require("express");
const { getHistory } = require("../services/historyService");
const router = express.Router();

router.get("/", (req, res) => {
  const city = req.query.city || "Delhi";
  const range = req.query.range || "today";

  const data = getHistory(city, range);
  res.json(data);
});

module.exports = router;
