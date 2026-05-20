import { useQuery } from "@tanstack/react-query";

import { insightsApi } from "@/services/insights";

export function usePayrollByCountry() {
  return useQuery({
    queryKey: ["insights", "payroll", "by-country"] as const,
    queryFn: () => insightsApi.payrollByCountry(),
  });
}

export function usePayrollByTitle() {
  return useQuery({
    queryKey: ["insights", "payroll", "by-title"] as const,
    queryFn: () => insightsApi.payrollByTitle(),
  });
}
