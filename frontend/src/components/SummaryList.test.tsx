import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SummaryList } from "@/components/SummaryList";

describe("SummaryList", () => {
  it("renders each item as a list row with label and value", () => {
    render(
      <SummaryList
        ariaLabel="Payroll by country"
        items={[
          { key: "IN", label: "India", value: "70%" },
          { key: "US", label: "USA", value: "30%" },
        ]}
      />,
    );

    const list = screen.getByRole("list", { name: /payroll by country/i });
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]!).getByText("India")).toBeInTheDocument();
    expect(within(rows[0]!).getByText("70%")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("USA")).toBeInTheDocument();
  });

  it("renders a ReactNode value (e.g. number + chip)", () => {
    render(
      <SummaryList
        ariaLabel="Mixed values"
        items={[
          {
            key: "Engineer",
            label: "Engineer",
            value: (
              <>
                <span>120,000</span>
                <span data-testid="chip">40%</span>
              </>
            ),
          },
        ]}
      />,
    );

    expect(screen.getByText("120,000")).toBeInTheDocument();
    expect(screen.getByTestId("chip")).toHaveTextContent("40%");
  });

  it("renders an empty list when there are no items (no crash, no rows)", () => {
    render(<SummaryList ariaLabel="Empty" items={[]} />);

    const list = screen.getByRole("list", { name: /empty/i });
    expect(within(list).queryAllByRole("listitem")).toHaveLength(0);
  });
});
