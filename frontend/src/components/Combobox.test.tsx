import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Combobox } from "@/components/Combobox";

const options = [
  { value: "IN", label: "IN", description: "12" },
  { value: "US", label: "US", description: "9" },
  { value: "DE", label: "DE", description: "4" },
];

describe("Combobox", () => {
  it("renders the placeholder when nothing is selected", () => {
    render(
      <Combobox
        options={options}
        value={null}
        onChange={() => {}}
        ariaLabel="Country"
        placeholder="Any country"
      />,
    );

    expect(screen.getByRole("combobox", { name: /country/i })).toHaveTextContent(
      /any country/i,
    );
  });

  it("opens, filters, and selects an option via keyboard", async () => {
    const onChange = vi.fn();
    render(
      <Combobox
        options={options}
        value={null}
        onChange={onChange}
        ariaLabel="Country"
        placeholder="Any country"
        searchPlaceholder="Search countries"
      />,
    );

    await userEvent.click(screen.getByRole("combobox", { name: /country/i }));
    await userEvent.type(screen.getByPlaceholderText(/search countries/i), "us");
    await userEvent.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("US");
  });

  it("exposes a 'Clear selection' affordance when a value is set", async () => {
    const onChange = vi.fn();
    render(
      <Combobox
        options={options}
        value="IN"
        onChange={onChange}
        ariaLabel="Country"
        clearLabel="Clear selection"
      />,
    );

    await userEvent.click(screen.getByRole("combobox", { name: /country/i }));
    await userEvent.click(screen.getByText(/clear selection/i));

    expect(onChange).toHaveBeenCalledWith(null);
  });
});
