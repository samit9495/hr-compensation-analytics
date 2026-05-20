import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CountryCombobox } from "@/components/CountryCombobox";
import { employeesApi } from "@/services/employees";

vi.mock("@/services/employees", () => ({
  employeesApi: {
    countries: vi.fn(),
  },
}));

const apiMock = employeesApi as unknown as {
  countries: ReturnType<typeof vi.fn>;
};

function renderWithClient(ui: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  apiMock.countries.mockReset();
});

describe("CountryCombobox", () => {
  it("calls employeesApi.countries with the supplied filter and shows live options", async () => {
    apiMock.countries.mockResolvedValue({
      countries: [
        { code: "IN", count: 12 },
        { code: "US", count: 9 },
      ],
    });

    renderWithClient(
      <CountryCombobox value={null} onChange={() => {}} filter={{ q: "jane" }} />,
    );

    await userEvent.click(await screen.findByRole("combobox", { name: /country/i }));

    expect(await screen.findByText("IN")).toBeInTheDocument();
    expect(screen.getByText("US")).toBeInTheDocument();
    expect(apiMock.countries).toHaveBeenCalledWith({ q: "jane" });
  });
});
