import { useState } from "react";

import { CountryCombobox } from "@/components/CountryCombobox";
import { KpiCard } from "@/components/KpiCard";
import { OutlierTables } from "@/components/OutlierTables";
import { PayrollBreakdown } from "@/components/PayrollBreakdown";
import { TitleAveragesChart } from "@/components/TitleAveragesChart";
import { useCountryInsights, useCountryTitleAverages } from "@/hooks/useInsights";
import { usePayrollByCountry, usePayrollByTitle } from "@/hooks/usePayrollBurden";

export function InsightsPage() {
  const [country, setCountry] = useState<string | null>("IN");

  const summary = useCountryInsights(country ?? "");
  const breakdown = useCountryTitleAverages(country ?? "");
  const payrollByCountry = usePayrollByCountry();
  const payrollByTitle = usePayrollByTitle();

  return (
    <section aria-labelledby="insights-heading" className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 id="insights-heading" className="text-2xl font-semibold text-slate-900">
          Insights
        </h1>
        <div className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Country</span>
          <CountryCombobox value={country} onChange={setCountry} />
        </div>
      </header>

      {country === null ? (
        <p role="status" className="text-sm text-slate-500">
          Select a country to see insights.
        </p>
      ) : summary.isLoading ? (
        <p role="status" className="text-sm text-slate-500">
          Loading insights for {country}…
        </p>
      ) : summary.isError ? (
        <p role="alert" className="text-sm text-red-700">
          Failed to load insights.
        </p>
      ) : summary.data ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Employees" value={String(summary.data.employee_count)} />
          <KpiCard label="Average" value={summary.data.average_salary} />
          <KpiCard label="Min" value={summary.data.min_salary} />
          <KpiCard label="Max" value={summary.data.max_salary} />
        </div>
      ) : null}

      <h2 className="pt-2 text-lg font-semibold text-slate-800">
        Average Salary by Job Title
      </h2>
      {country === null ? null : breakdown.isLoading ? (
        <p role="status" className="text-sm text-slate-500">
          Loading breakdown…
        </p>
      ) : breakdown.isError ? (
        <p role="alert" className="text-sm text-red-700">
          Failed to load breakdown.
        </p>
      ) : breakdown.data ? (
        <TitleAveragesChart averages={breakdown.data.averages} />
      ) : null}

      <h2 className="pt-4 text-lg font-semibold text-slate-800">
        Total Compensation Burden
      </h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PayrollBreakdown
          title="By Country"
          payroll={payrollByCountry.data}
          isLoading={payrollByCountry.isLoading}
          isError={payrollByCountry.isError}
        />
        <PayrollBreakdown
          title="By Job Title"
          payroll={payrollByTitle.data}
          isLoading={payrollByTitle.isLoading}
          isError={payrollByTitle.isError}
        />
      </div>

      <h2 className="pt-4 text-lg font-semibold text-slate-800">Compensation Outliers</h2>
      <OutlierTables />
    </section>
  );
}
