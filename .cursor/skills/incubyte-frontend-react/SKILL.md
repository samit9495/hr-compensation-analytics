---
name: incubyte-frontend-react
description: Scaffold and grow the React + Vite + TypeScript frontend with the Google Stitch MCP for UI generation and shadcn/ui as the component library. Use when initializing the frontend, adding pages, generating screens via Stitch, hooking up TanStack Query, or writing a component test.
---

# Incubyte Frontend (React + Vite + TypeScript)

## Trigger

Use when asked to: scaffold the UI, set up Vite, add a page/feature, generate a screen via the Stitch MCP, hook up TanStack Query / TanStack Table / Recharts, or write a component test.

## Context

UI stack (finalized):

- **Vite + React 18 + TypeScript (strict)**
- **Tailwind CSS** for styling
- **shadcn/ui** as the component library (under `src/components/ui/`)
- **TanStack Query** for server state
- **TanStack Table** for tabular data
- **Recharts** for analytics charts
- **React Hook Form + Zod** for forms
- **Vitest + React Testing Library** for tests

UI generation comes from the **Google Stitch MCP** (configured in `.cursor/mcp.json`). Generated code is treated as a draft — reviewed, refactored, and TDD-driven before commit.

## Step 1 — Initialize (one time)

```bash
cd frontend  # or run from project root
npm create vite@latest . -- --template react-ts
npm install
npm install @tanstack/react-query @tanstack/react-table recharts react-router-dom react-hook-form zod @hookform/resolvers
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @types/node
# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Initialize shadcn/ui (interactive, sets up `components.json`, `tailwind.config.ts`, and `src/components/ui/`):

```bash
npx shadcn@latest init
# add only the primitives you need, when you need them, e.g.
npx shadcn@latest add button card input dialog table form
```

Strict TS:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

Vitest config (`vite.config.ts`):

```ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
})
```

`src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

## Step 2 — Wire up the QueryClient

```tsx
// src/main.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import { App } from "./App"

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
```

## Step 3 — Typed services layer

```ts
// src/services/client.ts
const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.detail ?? res.statusText, body.code)
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message)
  }
}
```

```ts
// src/services/employees.ts
import { api } from "./client"
import type { Employee, EmployeeCreate } from "../types/employee"

export const employeesService = {
  list: (params: { country?: string; limit?: number; offset?: number } = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null) as [string, string][])
    return api<Employee[]>(`/employees?${qs}`)
  },
  create: (payload: EmployeeCreate) => api<Employee>("/employees", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number, payload: Partial<EmployeeCreate>) =>
    api<Employee>(`/employees/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: number) => api<void>(`/employees/${id}`, { method: "DELETE" }),
}
```

## Step 4 — Hooks via TanStack Query

```ts
// src/hooks/useEmployees.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { employeesService } from "../services/employees"
import type { EmployeeCreate } from "../types/employee"

export const useEmployees = (country?: string) =>
  useQuery({ queryKey: ["employees", country], queryFn: () => employeesService.list({ country }) })

export const useCreateEmployee = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: EmployeeCreate) => employeesService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  })
}
```

## Step 5 — Generate a screen via the Stitch MCP

When you need a new screen (dashboard, employee form, analytics page, responsive layout):

1. Call the Stitch MCP with a precise prompt: stack (React + TS + Tailwind + shadcn/ui), the page's purpose, the data shape (link to `src/types/`), and any constraints (e.g. "use shadcn `Card` for KPI tiles, `Table` for the list, `Dialog` for the create form, Recharts `BarChart` for country breakdown").
2. Read the generated component(s). Treat as a **draft**, not final code.
3. Reconcile against the existing primitives in `src/components/ui/`. If a primitive does not exist yet, add it via `npx shadcn@latest add <name>` — never hand-roll a `<Button>`.
4. Use Tailwind tokens from `tailwind.config.ts`; no inline hex codes, no ad-hoc CSS files.
5. Move the screen into the right folder per the project structure (`src/components/<domain>/` for composed components; `src/pages/` for routes).
6. Write a Vitest test that exercises the component's user interactions (RED), then keep only the parts of the generated code that pass it (GREEN), then refactor.

### What developers always own (Stitch never replaces this)

- **Accessibility**: keyboard nav, ARIA labels on icon buttons, color contrast.
- **Reusable components**: extract anything used twice into `src/components/<domain>/`.
- **State management**: TanStack Query for server data; React state for UI state. No global stores Stitch may invent.
- **API integration**: `src/services/` is the only place that calls `fetch`.
- **Performance**: memoize where measurable; paginate lists; virtualize only if needed.
- **Testing**: behavioral Vitest + RTL tests, never snapshots.
- **Maintainability**: rename, split, and delete generated code until the file reads cleanly.

## Step 6 — TDD for components

```tsx
// src/components/EmployeeForm.test.tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { EmployeeForm } from "./EmployeeForm"

test("submitting the form calls onSubmit with the entered values", async () => {
  const onSubmit = vi.fn()
  render(<EmployeeForm onSubmit={onSubmit} />)
  await userEvent.type(screen.getByLabelText(/full name/i), "Jane Doe")
  await userEvent.type(screen.getByLabelText(/job title/i), "Engineer")
  await userEvent.selectOptions(screen.getByLabelText(/country/i), "IN")
  await userEvent.type(screen.getByLabelText(/salary/i), "50000")
  await userEvent.click(screen.getByRole("button", { name: /save/i }))
  expect(onSubmit).toHaveBeenCalledWith({
    fullName: "Jane Doe", jobTitle: "Engineer", country: "IN", salary: "50000",
  })
})
```

Behavior, not markup. No snapshots.

## Step 7 — Commit pattern

Every component lands as at least two commits:

```
test: EmployeeForm submits entered values
feat: implement EmployeeForm with react-hook-form
```

Per the TDD discipline rule, no skipping the RED.

## Checklist

- [ ] `frontend/` initialized with Vite + React + TS strict
- [ ] TanStack Query provider wired
- [ ] Tailwind + shadcn/ui initialized (`components.json`, `tailwind.config.ts`, `src/components/ui/` populated lazily)
- [ ] Vitest configured with jsdom + Testing Library setup
- [ ] `src/services/client.ts` returns typed responses, throws `ApiError` on non-2xx
- [ ] Every domain folder (`employees/`, `analytics/`, `dashboard/`) has tests co-located with components
- [ ] Stitch prompt + key generated artifacts noted in PR description or `artifacts/prompts/`

## See also

- `.cursor/rules/incubyte-frontend-react.mdc` — authoritative conventions
- `.cursor/rules/incubyte-testing.mdc` — Vitest expectations
- `.cursor/skills/incubyte-tdd-loop/SKILL.md` — same loop applies to components
