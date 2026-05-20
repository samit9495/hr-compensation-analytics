import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Pagination } from "@/components/Pagination";

describe("Pagination", () => {
  it("disables Previous on the first page", () => {
    render(<Pagination offset={0} limit={25} total={100} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).not.toBeDisabled();
  });

  it("disables Next when isLastPage is true (header-less fallback)", () => {
    render(<Pagination offset={50} limit={25} isLastPage onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("disables Next when offset + limit >= total", () => {
    render(<Pagination offset={50} limit={25} total={60} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("renders 'Showing 1–25 of 100' when total is known", () => {
    render(<Pagination offset={0} limit={25} total={100} onChange={() => {}} />);
    expect(screen.getByText(/showing 1\u201325 of 100/i)).toBeInTheDocument();
  });

  it("clamps 'end' to total on the final page", () => {
    render(<Pagination offset={50} limit={25} total={60} onChange={() => {}} />);
    expect(screen.getByText(/showing 51\u201360 of 60/i)).toBeInTheDocument();
  });

  it("renders 'Showing 0–0 of 0' when there are no results", () => {
    render(<Pagination offset={0} limit={25} total={0} onChange={() => {}} />);
    expect(screen.getByText(/showing 0\u20130 of 0/i)).toBeInTheDocument();
  });

  it("calls onChange with the next offset when Next is clicked", async () => {
    const onChange = vi.fn();
    render(<Pagination offset={25} limit={25} total={100} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(onChange).toHaveBeenCalledWith({ offset: 50, limit: 25 });
  });

  it("calls onChange with offset - limit when Previous is clicked", async () => {
    const onChange = vi.fn();
    render(<Pagination offset={50} limit={25} total={100} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: /previous/i }));

    expect(onChange).toHaveBeenCalledWith({ offset: 25, limit: 25 });
  });
});
