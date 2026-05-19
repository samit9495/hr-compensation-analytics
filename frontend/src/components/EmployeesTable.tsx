import type { Employee } from "@/services/types";

type Props = {
  employees: Employee[];
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
};

const COLUMNS = ["Name", "Title", "Country", "Salary", "Department", "Active", ""] as const;

export function EmployeesTable({ employees, onEdit, onDelete }: Props) {
  if (employees.length === 0) {
    return (
      <p
        role="status"
        className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500"
      >
        No employees match your filters.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <table className="w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
          <tr>
            {COLUMNS.map((col) => (
              <th key={col} scope="col" className="px-3 py-2 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {employees.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50">
              <td className="px-3 py-2 font-medium text-slate-900">{e.full_name}</td>
              <td className="px-3 py-2 text-slate-700">{e.job_title}</td>
              <td className="px-3 py-2 text-slate-700">{e.country}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                {e.salary}
              </td>
              <td className="px-3 py-2 text-slate-700">{e.department ?? "—"}</td>
              <td className="px-3 py-2 text-slate-700">{e.is_active ? "Yes" : "No"}</td>
              <td className="px-3 py-2 text-right">
                <div className="flex justify-end gap-2">
                  {onEdit && (
                    <button
                      type="button"
                      className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                      onClick={() => onEdit(e)}
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(e)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
