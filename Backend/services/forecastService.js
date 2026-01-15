exports.forecastAQI = (currentAQI) => {
  return {
    trend: "Worsening",
    summary: "AQI is expected to increase during evening hours.",
    highRiskTime: "6 PM – 9 PM",
    forecast: [
      { time: "Now", aqi: currentAQI },
      { time: "+3 Hours", aqi: currentAQI + 10 },
      { time: "+6 Hours", aqi: currentAQI + 20 }
    ]
  };
};
