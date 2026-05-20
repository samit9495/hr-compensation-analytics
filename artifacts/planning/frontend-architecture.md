# Frontend Architecture

> React 18 (now upgraded to 19) + Vite + TypeScript strict + Tailwind +
> shadcn/ui + TanStack Query + TanStack Table + Recharts + Vitest +
> RTL. Server state via TanStack Query; UI state via `useState`. No
> Redux, no Zustand, no global store.

For UI decisions (AnalyticsSection, InfoHint, SummaryList, Title Case
sweep) see [ui-ux-decisions.md](ui-ux-decisions.md); for analytics
component contracts see [analytics-strategy.md](analytics-strategy.md).

## Module map

```
frontend/src/
├── main.tsx, App.tsx           App + Router + QueryClientProvider + TooltipProvider + ErrorBoundary
├── pages/
│   ├── DashboardPage.tsx       global KPIs + recent hires + country distribution
│   ├── EmployeesPage.tsx       table + filters + pagination + create/edit/delete
│   └── InsightsPage.tsx        country selector + KPIs + by-title + payroll + outliers
├── components/
│   ├── AppShell.tsx            top nav + outlet
│   ├── ui/                     shadcn primitives (button, card, dialog, input, popover, command, tooltip, ...)
│   ├── AnalyticsSection.tsx    titled card wrapper with optional InfoHint + actions
│   ├── InfoHint.tsx            Radix tooltip on lucide Info icon
│   ├── SummaryList.tsx         bordered label↔value list (Recent Hires + payroll)
│   ├── KpiCard.tsx             label + value tile
│   ├── EmployeesTable.tsx      TanStack Table v8; columns accept ReactNode
│   ├── EmployeesFilters.tsx    CountryCombobox + name search (debounced)
│   ├── Pagination.tsx          "Showing 1–25 of N" + prev/next
│   ├── EmployeeForm.tsx        RHF + Zod, mirrors backend schema
│   ├── Combobox.tsx            generic Popover + cmdk combobox
│   ├── CountryCombobox.tsx     filter-aware concrete combobox
│   ├── SalaryBarChart.tsx      Recharts wrapper with safe YAxis width
│   ├── TitleAveragesChart.tsx  by-title avg chart (delegates to SalaryBarChart)
│   ├── PayrollBreakdown.tsx    SummaryList over payroll entries
│   ├── OutlierTables.tsx       bottom/top NTILE outlier tables
│   ├── CountryDistributionChart.tsx  dashboard distribution
│   ├── CompaRatioBadge.tsx     three buckets, ARIA, tooltip
│   ├── CompaRatioBadge.utils.ts  bucket helper (extracted for Fast Refresh)
│   ├── RangePenetrationBar.tsx 0–100% bar with ARIA
│   └── ErrorBoundary.tsx       catches render errors, logs, recovers
├── hooks/
│   ├── useEmployees.ts             rows + total via X-Total-Count
│   ├── useDistinctCountries.ts     filter-aware country list
│   ├── useCompensationAnalysis.ts  per-id analysis map
│   ├── useInsights.ts              global + per-country aggregates
│   ├── usePayrollBurden.ts         by-country + by-title
│   └── useOutliers.ts              bottom/top buckets
├── services/
│   ├── employees.ts            typed CRUD + analytics fetches
│   ├── insights.ts             typed insights fetches
│   └── types.ts                shared response types
├── lib/
│   ├── api.ts                  apiFetch + apiFetchWithMeta + ApiError
│   ├── queryClient.ts          TanStack Query defaults
│   ├── logger.ts               console wrapper (info no-op in prod)
│   └── utils.ts                cn() and formatters
└── test/
    └── setup.ts                jsdom polyfills (ResizeObserver, PointerEvent, scrollIntoView)
```

## State strategy

| Concern | Where it lives |
|---|---|
| Server data | TanStack Query. Cache keys: `["employees", filters]`, `["employees", "countries", filters]`, `["compensation-analysis", filters]`, `["insights", "country", code]`, `["insights", "global"]`, `["insights", "payroll", scope]`, `["insights", "outliers", bucket]` |
| Form data | React Hook Form + Zod (`EmployeeForm`) |
| UI data (dialog open, selected row, debounced filter input) | local `useState`, co-located with the component |
| Cross-page state | **None.** Anything shared is server data, so TanStack Query's cache *is* the shared state |

The decision to skip Redux/Zustand is documented in
[tradeoffs-and-decisions.md](tradeoffs-and-decisions.md) §"TanStack
Query for server state".

## API client

```ts
// frontend/src/lib/api.ts (paraphrased)
export class ApiError extends Error {
  constructor(public status: number, public code: string, public detail: string) { ... }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> { ... }
export async function apiFetchWithMeta<T>(path: string, init?: RequestInit): Promise<{ data: T; totalCount: number }> { ... }
```

- `apiFetch` throws `ApiError` on non-2xx, reading `{ detail, code }`
  from the body so toasts can surface server-side validation errors.
- `apiFetchWithMeta` additionally reads `X-Total-Count` for paginated
  endpoints. See
  [tradeoffs-and-decisions.md](tradeoffs-and-decisions.md)
  §"X-Total-Count header".
- `logger.error("api_error", { method, path, status, requestId })`
  fires on every non-OK response so the browser console mirrors the
  backend's request log via the `X-Request-ID` header.

## Reusable UI primitives

| Primitive | Born when | What it owns |
|---|---|---|
| `AnalyticsSection` | UX polish pass (Phase 10) | white card, slate border, h2 + optional `InfoHint`, optional right-aligned actions, `space-y-3` body |
| `InfoHint` | UX polish pass | accessible info button, lucide `Info` icon, shadcn `Tooltip` content |
| `SummaryList` | Payroll readability pass | bordered rows of label↔value with optional metadata column |
| `Combobox` / `CountryCombobox` | Bugs+analytics phase | shadcn `Popover` + `cmdk` keyboard-first picker |
| `SalaryBarChart` | Bugs+analytics phase | Recharts `BarChart` with safe `YAxis` width and K/M `tickFormatter` |
| `CompaRatioBadge` | Analytics phase | 3-bucket color + ARIA + tooltip |
| `KpiCard` | Insights phase | label + value tile |
| `Pagination` | Pagination "of N" pass | "Showing X–Y of N" + prev/next |
| `ErrorBoundary` | Logging phase | wraps router; logs `boundary_error`; offers recovery |

See [ui-ux-decisions.md](ui-ux-decisions.md) for the design intent
behind each primitive.

## Testing

| Layer | Tool | What it asserts |
|---|---|---|
| Pure helpers (`*.utils.ts`) | Vitest | input/output |
| Components | Vitest + RTL + `userEvent` | behaviour: clicks, focus, accessible names |
| Hooks | Vitest + RTL `renderHook` + `QueryClientProvider` test wrapper | success / loading / error |
| Pages | Vitest + RTL + mocked services | wiring across components |
| API client | Vitest + `fetch` mock | error mapping, header parsing |

No snapshot tests by rule (the
[incubyte-testing rule](../../.cursor/rules/incubyte-testing.mdc)
explicitly forbids them). Coverage gate: `npm run test -- --coverage`
≥ 80% on changed files.

## Fast Refresh discipline

`react-refresh/only-export-components` is enforced. Helper functions
that originally lived alongside components were extracted into
co-located `*.utils.ts` files (`CompaRatioBadge.utils.ts`,
`SalaryBarChart.utils.ts`) to keep Fast Refresh green. The pattern is
the canonical fix and is documented in
[tradeoffs-and-decisions.md](tradeoffs-and-decisions.md) §"Fast
Refresh hygiene".

## Build & deploy

- Vite production build → `frontend/dist/`.
- Vercel hosts the SPA; `VITE_API_BASE_URL` points at the deployed
  backend.
- Type-check + tests are part of the pre-deploy checklist. See
  [implementation-phases.md](implementation-phases.md) §Phase 12.

## What this design deliberately does NOT include

- No global state library (Redux / Zustand). TanStack Query is enough.
- No CSS-in-JS runtime. Tailwind classes + shadcn primitives only.
- No design-token JSON. Tailwind theme is the single source of truth.
- No internationalisation layer. Single-tenant, single-locale.
- No router-level data loaders. TanStack Query already handles
  pre-fetch / cache.
- No micro-frontends, no module federation. One bundle, one entry.

## See also

- [ui-ux-decisions.md](ui-ux-decisions.md) — the UX polish pass that
  added `AnalyticsSection` / `InfoHint` / `SummaryList`.
- [analytics-strategy.md](analytics-strategy.md) — the data contract
  the analytics components consume.
- [tradeoffs-and-decisions.md](tradeoffs-and-decisions.md) — every
  framework / dependency choice with alternatives considered.
