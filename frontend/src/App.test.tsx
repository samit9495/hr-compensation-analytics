import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("renders the dashboard heading on the root route", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /dashboard/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it("exposes primary navigation to all three top-level pages", () => {
    render(<App />);
    const primary = screen.getByRole("navigation", { name: /primary/i });
    expect(primary).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /employees/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /insights/i })).toBeInTheDocument();
  });
});
