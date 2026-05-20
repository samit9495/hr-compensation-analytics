import { apiFetch, apiFetchWithMeta } from "@/lib/api";
import type {
  Employee,
  EmployeeCreate,
  EmployeeListParams,
  EmployeeUpdate,
  EmployeeListResult,
} from "@/services/types";

function toQuery(params: EmployeeListParams): string {
  const search = new URLSearchParams();
  if (params.country) search.set("country", params.country);
  if (params.q) search.set("q", params.q);
  if (params.sort) search.set("sort", params.sort);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const employeesApi = {
  async list(params: EmployeeListParams = {}): Promise<EmployeeListResult> {
    const { data, headers } = await apiFetchWithMeta<Employee[]>(
      `/employees${toQuery(params)}`,
    );
    const headerTotal = headers.get("x-total-count");
    const total = headerTotal !== null ? Number(headerTotal) : data.length;
    return { rows: data, total };
  },
  get(id: number): Promise<Employee> {
    return apiFetch<Employee>(`/employees/${id}`);
  },
  create(payload: EmployeeCreate): Promise<Employee> {
    return apiFetch<Employee>("/employees", { method: "POST", body: payload });
  },
  update(id: number, payload: EmployeeUpdate): Promise<Employee> {
    return apiFetch<Employee>(`/employees/${id}`, { method: "PUT", body: payload });
  },
  remove(id: number): Promise<void> {
    return apiFetch<void>(`/employees/${id}`, { method: "DELETE" });
  },
};
