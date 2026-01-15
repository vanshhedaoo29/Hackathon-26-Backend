require("dotenv").config(); // MUST be first line

const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chatroutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AQI Backend Server is Running");
});

app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
