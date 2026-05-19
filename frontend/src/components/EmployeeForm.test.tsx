import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EmployeeForm } from "@/components/EmployeeForm";

describe("EmployeeForm", () => {
  it("submits valid values uppercasing the country", async () => {
    const onSubmit = vi.fn();
    render(<EmployeeForm submitLabel="Save" onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await userEvent.type(screen.getByLabelText(/job title/i), "Engineer");
    await userEvent.type(screen.getByLabelText(/country/i), "in");
    await userEvent.type(screen.getByLabelText(/salary/i), "50000.00");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({
      full_name: "Jane Doe",
      country: "IN",
      salary: "50000.00",
      department: null,
      email: null,
    });
  });

  it("shows validation errors for blank required fields and does not submit", async () => {
    const onSubmit = vi.fn();
    render(<EmployeeForm submitLabel="Save" onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findAllByText(/required/i)).not.toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects 1-letter country and non-decimal salary", async () => {
    const onSubmit = vi.fn();
    render(<EmployeeForm submitLabel="Save" onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/full name/i), "Jane");
    await userEvent.type(screen.getByLabelText(/job title/i), "E");
    await userEvent.type(screen.getByLabelText(/country/i), "i");
    await userEvent.type(screen.getByLabelText(/salary/i), "abc");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByText(/iso 2-letter/i)).toBeInTheDocument();
    expect(await screen.findByText(/decimal number/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders submit error banner when provided", () => {
    render(
      <EmployeeForm submitLabel="Save" onSubmit={vi.fn()} submitError="Email already exists" />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/email already exists/i);
  });
});
