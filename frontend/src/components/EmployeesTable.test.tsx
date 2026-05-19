import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EmployeesTable } from "@/components/EmployeesTable";
import type { Employee } from "@/services/types";

const sample = (overrides: Partial<Employee> = {}): Employee => ({
  id: 1,
  full_name: "Jane Doe",
  job_title: "Engineer",
  country: "IN",
  salary: "50000.00",
  email: null,
  department: "Platform",
  hire_date: null,
  is_active: true,
  ...overrides,
});

describe("EmployeesTable", () => {
  it("shows an empty-state message when there are no employees", () => {
    render(<EmployeesTable employees={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent(/no employees/i);
  });

  it("renders one row per employee with name, country, salary", () => {
    render(<EmployeesTable employees={[sample(), sample({ id: 2, full_name: "John Smith" })]} />);

    expect(screen.getByRole("cell", { name: "Jane Doe" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "John Smith" })).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3); // header + 2 rows
  });

  it("invokes onDelete with the employee when Delete is clicked", async () => {
    const onDelete = vi.fn();
    render(<EmployeesTable employees={[sample()]} onDelete={onDelete} />);

    await userEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });
});
