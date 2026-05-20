import { SalaryBarChart, type SalaryBarChartDatum } from "@/components/SalaryBarChart";

type Props = {
  averages: Record<string, string>;
};

export function TitleAveragesChart({ averages }: Props) {
  const data: SalaryBarChartDatum[] = Object.entries(averages).map(
    ([title, value]) => ({
      key: title,
      value: Number(value),
    }),
  );

  return (
    <SalaryBarChart
      data={data}
      ariaLabel="Average salary by job title"
      emptyMessage="No salary data for this country."
    />
  );
}
