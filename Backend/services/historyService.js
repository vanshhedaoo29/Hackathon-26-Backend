const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/aqi_history.json");
const MAX_DAYS = 30;

if (!fs.existsSync(DATA_FILE)) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// ---------------- CLEAN OLD DATA ----------------
const cleanOldData = (data) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MAX_DAYS);
  return data.filter(entry => new Date(entry.lastUpdated) >= cutoff);
};

// ---------------- SAVE DATA ----------------
const saveAQIData = (entry) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  const cleanedData = cleanOldData(data);
  cleanedData.push(entry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(cleanedData, null, 2));
};

// ---------------- GET HISTORY ----------------
const getHistory = (city, range = "today") => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  const cleanedData = cleanOldData(data);
  const now = new Date();

  const filtered = city
    ? cleanedData.filter(item => item.city.toLowerCase() === city.toLowerCase())
    : cleanedData;

  let rangeFiltered = [];

  // ---------------- FILTER BY RANGE ----------------
  if (range === "today") {
    rangeFiltered = filtered.filter(item => {
      const d = new Date(item.lastUpdated);
      return d.toDateString() === now.toDateString();
    });
  } 
  else if (range === "weekly") {
    const start = new Date();
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    rangeFiltered = filtered.filter(item => new Date(item.lastUpdated) >= start);
  } 
  else if (range === "monthly") {
    const start = new Date();
    start.setMonth(now.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
    rangeFiltered = filtered.filter(item => new Date(item.lastUpdated) >= start);
  } 
  else {
    rangeFiltered = filtered;
  }

  if (rangeFiltered.length === 0) {
    return {
      chartData: [],
      avgAQI: 0,
      aqiRange: "0 - 0",
      period: range,
      insight: "No AQI data available for this period."
    };
  }

  // ---------------- CHART GROUPING ----------------
  let chartData = [];

  // --------- TODAY ---------
  if (range === "today") {
    const buckets = {
      "6 AM": [],
      "9 AM": [],
      "12 PM": [],
      "3 PM": [],
      "6 PM": [],
      "Now": []
    };

    rangeFiltered.forEach(item => {
      const d = new Date(item.lastUpdated);
      const hour = d.getHours();

      if (hour >= 6 && hour < 9) buckets["6 AM"].push(item.aqi);
      else if (hour >= 9 && hour < 12) buckets["9 AM"].push(item.aqi);
      else if (hour >= 12 && hour < 15) buckets["12 PM"].push(item.aqi);
      else if (hour >= 15 && hour < 18) buckets["3 PM"].push(item.aqi);
      else if (hour >= 18 && hour < 21) buckets["6 PM"].push(item.aqi);
    });

    buckets["Now"].push(rangeFiltered[rangeFiltered.length - 1].aqi);

    chartData = Object.entries(buckets).map(([label, values]) => ({
      label,
      value: values.length
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : null
    }));
  }

  // --------- WEEKLY (FIXED MONDAY ISSUE) ---------
  else if (range === "weekly") {
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const days = {};
    weekDays.forEach(day => days[day] = []);

    rangeFiltered.forEach(item => {
      const d = new Date(item.lastUpdated);
      const jsDay = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      const index = jsDay === 0 ? 6 : jsDay - 1; // shift Sunday to last
      const dayLabel = weekDays[index];
      days[dayLabel].push(item.aqi);
    });

    chartData = weekDays.map(day => ({
      label: day,
      value: days[day].length
        ? Math.round(days[day].reduce((a, b) => a + b, 0) / days[day].length)
        : null
    }));
  }

  // --------- MONTHLY ---------
  else if (range === "monthly") {
  const weeks = {
    "Week 1": [],
    "Week 2": [],
    "Week 3": [],
    "Week 4": [],
    "Week 5": []
  };

  rangeFiltered.forEach(item => {
    const d = new Date(item.lastUpdated);
    const day = d.getDate();
    const weekNumber = Math.ceil(day / 7);
    const weekLabel = `Week ${weekNumber}`;
    if (weeks[weekLabel]) {
      weeks[weekLabel].push(item.aqi);
    }
  });

  chartData = Object.entries(weeks).map(([label, values]) => ({
    label,
    value: values.length
      ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
      : 0 // 👈 return 0 instead of null
  }));
}


  // ---------------- AVG & RANGE ----------------
  const aqiValues = rangeFiltered.map(item => item.aqi);
  const avgAQI = Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length);
  const minAQI = Math.min(...aqiValues);
  const maxAQI = Math.max(...aqiValues);

  return {
    chartData,
    avgAQI,
    aqiRange: `${minAQI} - ${maxAQI}`,
    period: range,
    insight: generateInsight(avgAQI)
  };
};

// ---------------- INSIGHT LOGIC ----------------
function generateInsight(avgAQI) {
  if (avgAQI <= 50) return "Air quality is good today. Enjoy outdoor activities!";
  if (avgAQI <= 100) return "Air quality is satisfactory. Minor breathing discomfort possible.";
  if (avgAQI <= 200) return "Air quality is moderate. Sensitive groups should reduce outdoor exposure.";
  if (avgAQI <= 300) return "Air quality is poor. Avoid prolonged outdoor activities.";
  return "Air quality is severe. Stay indoors and use air purifiers.";
}

module.exports = { saveAQIData, getHistory };
