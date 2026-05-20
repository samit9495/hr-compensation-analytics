import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { employeesApi } from "@/services/employees";
import type {
  EmployeeCreate,
  EmployeeListParams,
  EmployeeListResult,
  EmployeeUpdate,
} from "@/services/types";

export const employeesQueryKey = (params: EmployeeListParams) =>
  ["employees", params] as const;

export function useEmployees(params: EmployeeListParams = {}) {
  return useQuery<EmployeeListResult>({
    queryKey: employeesQueryKey(params),
    queryFn: () => employeesApi.list(params),
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmployeeCreate) => employeesApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EmployeeUpdate }) =>
      employeesApi.update(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
