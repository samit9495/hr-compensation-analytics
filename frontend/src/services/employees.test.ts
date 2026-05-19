import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api";
import { employeesApi } from "@/services/employees";

const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = vi.fn();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("employeesApi.list", () => {
  it("encodes country/q/sort/limit/offset into the query string", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response("[]", { status: 200 }),
    );

    await employeesApi.list({ country: "IN", q: "ja", sort: "-salary", limit: 25, offset: 50 });

    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    const url = call[0] as string;
    expect(url).toContain("/employees?");
    expect(url).toContain("country=IN");
    expect(url).toContain("q=ja");
    expect(url).toContain("sort=-salary");
    expect(url).toContain("limit=25");
    expect(url).toContain("offset=50");
  });

  it("omits the query string when no params are passed", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response("[]", { status: 200 }),
    );

    await employeesApi.list();

    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
    expect(url.endsWith("/employees")).toBe(true);
  });
});

describe("employeesApi.create", () => {
  it("posts JSON and parses an Employee", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          full_name: "Jane",
          job_title: "E",
          country: "IN",
          salary: "100.00",
          email: null,
          department: null,
          hire_date: null,
          is_active: true,
        }),
        { status: 201, headers: { "content-type": "application/json" } },
      ),
    );

    const result = await employeesApi.create({
      full_name: "Jane",
      job_title: "E",
      country: "IN",
      salary: "100.00",
    });

    expect(result.id).toBe(1);
  });

  it("throws ApiError with code on a 409 response", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ detail: "boom", code: "duplicate_email" }), {
        status: 409,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(
      employeesApi.create({
        full_name: "X",
        job_title: "E",
        country: "IN",
        salary: "1.00",
        email: "x@y.com",
      }),
    ).rejects.toMatchObject({ status: 409, code: "duplicate_email" });

    await expect(
      employeesApi.create({
        full_name: "X",
        job_title: "E",
        country: "IN",
        salary: "1.00",
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
