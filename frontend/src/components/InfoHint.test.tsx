import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InfoHint } from "@/components/InfoHint";
import { TooltipProvider } from "@/components/ui/tooltip";

function renderHint(node: React.ReactNode) {
  return render(<TooltipProvider delayDuration={0}>{node}</TooltipProvider>);
}

describe("InfoHint", () => {
  it("renders a focusable button with the label as accessible name", () => {
    renderHint(
      <InfoHint label="Compa-ratio">
        Salary divided by peer-group average.
      </InfoHint>,
    );

    const trigger = screen.getByRole("button", { name: /compa-ratio/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("type", "button");
  });

  it("hides the icon from the accessibility tree (aria-hidden)", () => {
    renderHint(<InfoHint label="Spread">Range penetration explanation.</InfoHint>);

    const svg = screen.getByRole("button", { name: /spread/i }).querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
