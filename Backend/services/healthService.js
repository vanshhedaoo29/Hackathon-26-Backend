exports.healthMessage = (aqi) => {
  if (aqi > 150) {
    return {
      level: "Poor",
      message: "Poor air quality may cause breathing discomfort.",
      recommendations: [
        "Wear masks outdoors",
        "Limit physical activity",
        "Keep windows closed"
      ],
      sensitiveGroups: ["Children", "Elderly", "Asthma Patients"]
    };
  }

  return {
    level: "Good",
    message: "Air quality is satisfactory.",
    recommendations: ["Outdoor activities are safe"]
  };
};
