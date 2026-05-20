import { useQuery } from "@tanstack/react-query";

import { employeesApi } from "@/services/employees";
import type { CountriesFilter } from "@/services/types";

export const compensationAnalysisQueryKey = (filter: CountriesFilter) =>
  ["employees", "compensation-analysis", filter] as const;

export function useCompensationAnalysis(filter: CountriesFilter = {}) {
  return useQuery({
    queryKey: compensationAnalysisQueryKey(filter),
    queryFn: () => employeesApi.compensationAnalysis(filter),
  });
}
