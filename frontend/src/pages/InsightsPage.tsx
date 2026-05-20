import { useState } from "react";

import { AnalyticsSection } from "@/components/AnalyticsSection";
import { CountryCombobox } from "@/components/CountryCombobox";
import { InfoHint } from "@/components/InfoHint";
import { KpiCard } from "@/components/KpiCard";
import { OutlierTables } from "@/components/OutlierTables";
import { PayrollBreakdown } from "@/components/PayrollBreakdown";
import { TitleAveragesChart } from "@/components/TitleAveragesChart";
import { useCountryInsights, useCountryTitleAverages } from "@/hooks/useInsights";
import { usePayrollByCountry, usePayrollByTitle } from "@/hooks/usePayrollBurden";

const TOOLTIP_AVG_BY_TITLE =
  "Mean salary per role within the selected country. Roles with one employee show that employee's salary.";
const TOOLTIP_PAYROLL =
  "Total payroll cost distributed by role and by country. Use this to monitor budget concentration.";
const TOOLTIP_OUTLIERS =
  "Lowest 5% (retention risk) and highest 5% (budget review) within each peer group of role and country.";

export function InsightsPage() {
  const [country, setCountry] = useState<string | null>("IN");

  const summary = useCountryInsights(country ?? "");
  const breakdown = useCountryTitleAverages(country ?? "");
  const payrollByCountry = usePayrollByCountry();
  const payrollByTitle = usePayrollByTitle();

  return (
    <section aria-labelledby="insights-heading" className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id="insights-heading" className="text-2xl font-semibold text-slate-900">
            Insights
          </h1>
          <p className="text-sm text-slate-600">
            Compensation analytics for the selected country and the wider organization.
          </p>
        </div>
        <div className="space-y-1 text-sm">
          <span className="font-medium text-slate-700">Country</span>
          <CountryCombobox value={country} onChange={setCountry} />
        </div>
      </header>

      <AnalyticsSection
        id="country-overview"
        title="Country Overview"
        description="Headline KPIs for the selected country."
      >
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
      </AnalyticsSection>

      <AnalyticsSection
        id="avg-by-title"
        title="Average Salary by Job Title"
        tooltip={
          <InfoHint label="Average Salary by Job Title">{TOOLTIP_AVG_BY_TITLE}</InfoHint>
        }
      >
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
      </AnalyticsSection>

      <AnalyticsSection
        id="payroll-burden"
        title="Total Compensation Burden"
        tooltip={<InfoHint label="Total Compensation Burden">{TOOLTIP_PAYROLL}</InfoHint>}
      >
        <div className="space-y-6">
          <AnalyticsSection
            id="payroll-by-title"
            title="By Job Title"
            className="border-slate-100 bg-slate-50/40 shadow-none"
          >
            <PayrollBreakdown
              ariaLabel="By Job Title"
              payroll={payrollByTitle.data}
              isLoading={payrollByTitle.isLoading}
              isError={payrollByTitle.isError}
            />
          </AnalyticsSection>

          <AnalyticsSection
            id="payroll-by-country"
            title="By Country"
            className="border-slate-100 bg-slate-50/40 shadow-none"
          >
            <PayrollBreakdown
              ariaLabel="By Country"
              payroll={payrollByCountry.data}
              isLoading={payrollByCountry.isLoading}
              isError={payrollByCountry.isError}
            />
          </AnalyticsSection>
        </div>
      </AnalyticsSection>

      <AnalyticsSection
        id="outliers"
        title="Compensation Outliers"
        tooltip={<InfoHint label="Compensation Outliers">{TOOLTIP_OUTLIERS}</InfoHint>}
      >
        <OutlierTables />
      </AnalyticsSection>
    </section>
  );
}
