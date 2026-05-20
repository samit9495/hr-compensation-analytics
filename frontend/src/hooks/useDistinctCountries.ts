import { useQuery } from "@tanstack/react-query";

import { employeesApi } from "@/services/employees";
import type { CountriesFilter } from "@/services/types";

export const distinctCountriesQueryKey = (filter: CountriesFilter) =>
  ["employees", "countries", filter] as const;

export function useDistinctCountries(filter: CountriesFilter = {}) {
  return useQuery({
    queryKey: distinctCountriesQueryKey(filter),
    queryFn: () => employeesApi.countries(filter),
  });
}
