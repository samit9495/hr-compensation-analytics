import { SalaryBarChart, type SalaryBarChartDatum } from "@/components/SalaryBarChart";
import { SummaryList, type SummaryListItem } from "@/components/SummaryList";
import type { PayrollBurdenResponse, PayrollEntry } from "@/services/types";

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

function toSummaryItems(entries: PayrollEntry[]): SummaryListItem[] {
  return entries.map((entry) => ({
    key: entry.key,
    label: entry.key,
    value: (
      <>
        <span className="text-slate-800">{Number(entry.total).toLocaleString()}</span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
          {entry.percentage}%
        </span>
      </>
    ),
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
    <div className="space-y-4">
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
            <SummaryList
              ariaLabel={`${ariaLabel} breakdown`}
              items={toSummaryItems(payroll.entries)}
            />
          )}
        </>
      )}
    </div>
  );
}
