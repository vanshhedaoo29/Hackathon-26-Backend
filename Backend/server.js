require("dotenv").config(); // MUST be first line
const cron = require("node-cron");



const express = require("express");
const cors = require("cors");
const path = require("path");

const chatRoutes = require("./routes/chatroutes");
const pageRoutes = require("./routes/pageRoutes");
const historyRoutes = require("./routes/historyRoutes");
const aqiRoutes = require("./routes/aqiRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
  res.render("pages/index", {
    title: "AQI Monitor - Dashboard", // optional variable for EJS
  });
});

app.get("/health", (req, res) => {
  res.render("pages/health", {
    title: "AQI Monitor - Health Advisory", 
  });
});

app.get("/forecast", (req, res) => {
  res.render("pages/forecast", {
    title: "AQI Monitor - Forecast", 
  });
});

app.get("/about", (req, res) => {
  res.render("pages/about", {
    title: "AQI Monitor - About", 
  });
});


app.use("/", pageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/aqi", aqiRoutes);


// cron.schedule("*/1 * * * *", () => {  // every minute for testing
//   saveFromAPI("Delhi");
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
