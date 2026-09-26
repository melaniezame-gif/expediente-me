// Pure rule-based calculation. No AI, no external APIs.
// Inspired by simplified early-warning scores (NEWS) for educational use:
// it does NOT replace the judgement of a health professional.
export function calculateTriage({ temperature, heartRate, oxygenSaturation, painLevel }) {
  let score = 0;

  if (temperature > 38.0 || temperature < 35.0) score += 2;
  else if (
    (temperature >= 37.3 && temperature <= 38.0) ||
    (temperature >= 35.1 && temperature <= 36.0)
  )
    score += 1;

  if (heartRate > 120 || heartRate < 50) score += 2;
  else if ((heartRate >= 101 && heartRate <= 120) || (heartRate >= 50 && heartRate <= 59))
    score += 1;

  if (oxygenSaturation <= 90) score += 2;
  else if (oxygenSaturation >= 91 && oxygenSaturation <= 94) score += 1;

  if (painLevel >= 7) score += 2;
  else if (painLevel >= 4) score += 1;

  let status = "Stable";
  let recommendation =
    "Vital signs are within the normal range. No immediate care is needed.";

  if (score >= 5) {
    status = "Attention";
    recommendation =
      "Vital signs indicate high risk. Seek medical care immediately.";
  } else if (score >= 2) {
    status = "Review";
    recommendation =
      "Some vital signs are out of range. A medical check-up within the next few hours is recommended.";
  }

  return { score, status, recommendation };
}
