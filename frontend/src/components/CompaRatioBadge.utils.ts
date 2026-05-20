export type CompaRatioBucket = "underpaid" | "healthy" | "highly_compensated";

const UNDERPAID_CEILING = 0.8;
const HEALTHY_CEILING = 1.2;

export function compaRatioBucket(ratio: number): CompaRatioBucket {
  if (ratio < UNDERPAID_CEILING) return "underpaid";
  if (ratio < HEALTHY_CEILING) return "healthy";
  return "highly_compensated";
}
