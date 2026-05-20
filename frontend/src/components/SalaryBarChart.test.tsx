import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { formatCompactCurrency, SalaryBarChart } from "@/components/SalaryBarChart";

describe("formatCompactCurrency", () => {
  it("renders thousands with a K suffix", () => {
    expect(formatCompactCurrency(50_000)).toBe("50K");
  });

  it("renders millions with an M suffix and one decimal place", () => {
    expect(formatCompactCurrency(1_120_000)).toBe("1.1M");
  });

  it("returns 0 for zero without a suffix", () => {
    expect(formatCompactCurrency(0)).toBe("0");
  });

  it("handles small numbers verbatim", () => {
    expect(formatCompactCurrency(450)).toBe("450");
  });
});

describe("SalaryBarChart", () => {
  it("renders an empty-state when data is empty", () => {
    render(<SalaryBarChart data={[]} ariaLabel="Average salary by job title" />);

    expect(
      screen.getByRole("status", { name: /no data/i }),
    ).toBeInTheDocument();
  });

  it("renders an accessible figure for non-empty data", () => {
    render(
      <SalaryBarChart
        ariaLabel="Average salary by job title"
        data={[
          { key: "Engineer", value: 50000 },
          { key: "Manager", value: 75000 },
        ]}
      />,
    );

    expect(
      screen.getByRole("img", { name: /average salary by job title/i }),
    ).toBeInTheDocument();
  });
});
