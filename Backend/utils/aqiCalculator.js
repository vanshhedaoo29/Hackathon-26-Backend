exports.calculateAQI = ({ pm25, pm10, no2 }) => {

  const maxValue = Math.max(pm25, pm10, no2);

  let category = "Good";

  if (maxValue > 300) category = "Severe";
  else if (maxValue > 200) category = "Very Poor";
  else if (maxValue > 150) category = "Poor";
  else if (maxValue > 100) category = "Moderate";
  else category = "Good";

  let dominant = "PM2.5";
  if (maxValue === pm10) dominant = "PM10";
  if (maxValue === no2) dominant = "NO₂";

  return {
    value: Math.round(maxValue),
    category,
    dominant
  };
};
