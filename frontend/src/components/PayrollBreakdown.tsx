import { SalaryBarChart, type SalaryBarChartDatum } from "@/components/SalaryBarChart";
import type { PayrollBurdenResponse } from "@/services/types";

type Props = {
  ariaLabel: string;
  payroll: PayrollBurdenResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  emptyMessage?: string;
};

function toChartData(payroll: PayrollBurdenResponse | undefined): SalaryBarChartDatum[] {
  if (!payroll) return [];
  return payroll.entries.map((entry) => ({
    key: entry.key,
    value: Number(entry.total),
  }));
}

export function PayrollBreakdown({
  ariaLabel,
  payroll,
  isLoading,
  isError,
  emptyMessage = "No payroll data yet.",
}: Props) {
  return (
    <div className="space-y-3">
      {payroll && (
        <p className="text-xs text-slate-500">
          Total payroll: {Number(payroll.total).toLocaleString()}
        </p>
      )}

      {isLoading ? (
        <p role="status" className="text-sm text-slate-500">
          Loading…
        </p>
      ) : isError ? (
        <p role="alert" className="text-sm text-red-700">
          Failed to load payroll breakdown.
        </p>
      ) : (
        <>
          <SalaryBarChart
            data={toChartData(payroll)}
            ariaLabel={ariaLabel}
            emptyMessage={emptyMessage}
          />
          {payroll && payroll.entries.length > 0 && (
            <ul className="grid grid-cols-1 gap-1 text-xs text-slate-600 sm:grid-cols-2 md:grid-cols-3">
              {payroll.entries.map((entry) => (
                <li key={entry.key} className="flex justify-between gap-3 tabular-nums">
                  <span className="font-medium text-slate-700">{entry.key}</span>
                  <span>{entry.percentage}%</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
