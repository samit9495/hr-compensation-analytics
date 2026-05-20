import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RangePenetrationBar } from "@/components/RangePenetrationBar";

describe("RangePenetrationBar", () => {
  it("renders an accessible progressbar with aria-value attributes", () => {
    render(<RangePenetrationBar value={0.42} />);

    const bar = screen.getByRole("progressbar", { name: /range penetration/i });
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("clamps values above 1 to 100%", () => {
    render(<RangePenetrationBar value={1.7} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
  });

  it("clamps negative values to 0%", () => {
    render(<RangePenetrationBar value={-0.3} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
  });
});
