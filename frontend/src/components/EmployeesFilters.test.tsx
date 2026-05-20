import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EmployeesFilters } from "@/components/EmployeesFilters";
import { employeesApi } from "@/services/employees";

vi.mock("@/services/employees", () => ({
  employeesApi: {
    countries: vi.fn(),
  },
}));

const apiMock = employeesApi as unknown as {
  countries: ReturnType<typeof vi.fn>;
};

function renderFilters(onApply: (next: unknown) => void) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <EmployeesFilters onApply={onApply} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  apiMock.countries.mockReset();
  apiMock.countries.mockResolvedValue({
    countries: [
      { code: "IN", count: 12 },
      { code: "US", count: 9 },
    ],
  });
});

describe("EmployeesFilters", () => {
  it("applies the selected country from the combobox", async () => {
    const onApply = vi.fn();
    renderFilters(onApply);

    await userEvent.type(screen.getByLabelText(/search name/i), "ja");
    await userEvent.click(await screen.findByRole("combobox", { name: /country/i }));
    await userEvent.click(await screen.findByText("IN"));
    await userEvent.selectOptions(screen.getByLabelText(/sort/i), "-salary");
    await userEvent.click(screen.getByRole("button", { name: /apply/i }));

    expect(onApply).toHaveBeenCalledWith({ q: "ja", country: "IN", sort: "-salary" });
  });

  it("omits empty values from the apply payload", async () => {
    const onApply = vi.fn();
    renderFilters(onApply);

    await userEvent.click(screen.getByRole("button", { name: /apply/i }));

    expect(onApply).toHaveBeenCalledWith({ q: undefined, country: undefined, sort: undefined });
  });
});
