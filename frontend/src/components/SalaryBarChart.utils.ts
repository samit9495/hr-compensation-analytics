const ONE_MILLION = 1_000_000;
const ONE_THOUSAND = 1_000;

export function formatCompactCurrency(value: number): string {
  if (value === 0) return "0";
  if (Math.abs(value) >= ONE_MILLION) {
    return `${(value / ONE_MILLION).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (Math.abs(value) >= ONE_THOUSAND) {
    return `${Math.round(value / ONE_THOUSAND)}K`;
  }
  return String(value);
}
