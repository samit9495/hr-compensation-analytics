# UI / UX Decisions

> How the application went from a working CRUD + insights frontend to
> a polished enterprise HR analytics product — without rebuilding the
> design system. Driven by the
> [insights-polish UX-pass plan](../../.cursor/plans/insights-polish-ux-pass_c3887b4e.plan.md)
> (Phases J–N) and a follow-up payroll-readability pass (Phase O).

For the module layout these primitives sit inside, see
[frontend-architecture.md](frontend-architecture.md); for the
analytics they decorate, see [analytics-strategy.md](analytics-strategy.md).

## Three reusable primitives

The polish pass introduced exactly three new primitives. Every other
visual improvement is a composition of them.

### `<AnalyticsSection>` — the section wrapper

```tsx
<AnalyticsSection
  title="Total Compensation Burden"
  tooltip={<>Total payroll cost distributed by country and by role.</>}
  actions={<CountrySelect />}
>
  {/* chart / table / list */}
</AnalyticsSection>
```

- Owns the card chrome: `bg-white`, `border border-slate-200`,
  `rounded-lg`, subtle shadow, `p-4 sm:p-6`, `space-y-3`.
- Owns the `<h2>` heading (Title Case) and an optional `<InfoHint>`.
- Optional right-aligned `actions` slot (country selector, etc).
- Children stay focused on content — no per-call card styling.

**Why**: Before the pass, every Insights / Dashboard section had its
own ad-hoc padding, border, and heading style. One wrapper standardized
all of it without producing a heavy design-token system. See
[tradeoffs-and-decisions.md](tradeoffs-and-decisions.md) §"Cursor
rules as enforceable engineering policy" for the broader "boring
solution wins" principle.

### `<InfoHint>` — the canonical info affordance

```tsx
<InfoHint label="Compa-Ratio">
  Salary ÷ peer-group average. Below 80% may indicate underpayment
  risk; above 120% may need budget review.
</InfoHint>
```

- Renders a 14 px `Info` icon inside a focusable `<button>` (keyboard +
  screen-reader accessible).
- Backed by `@radix-ui/react-tooltip` via a small shadcn primitive
  (`frontend/src/components/ui/tooltip.tsx`, ~30 lines).
- One global `<TooltipProvider delayDuration={150}>` in `App.tsx`.

**Why**: HR-specific terms (Compa, Spread, Range Penetration, NTILE
outlier) need an on-demand definition. Spreading raw `<Tooltip>`
boilerplate across every heading would have been noise. `<InfoHint>`
makes it a one-line decision and keeps the aria-label / focus contract
consistent. Tooltip copy is canonical (see "Tooltip copy" below).

### `<SummaryList>` — bordered label↔value rows

```tsx
<SummaryList
  items={entries.map((e) => ({
    key: e.key,
    label: e.key,
    value: formatCurrency(e.total),
    meta: `${e.percentage.toFixed(1)}%`,
  }))}
/>
```

- Bordered rows; `flex` alignment of label vs value; optional `meta`
  column on the right (for percentages, badges).
- Used by `PayrollBreakdown` (payroll entries with % chip) and
  Dashboard `RecentHires` (label + date).

**Why**: The original `<ul>`/`<li>` payroll summary was visually
cramped — list items merged together, weak scan-ability. A bordered
row primitive solves it once and is reusable across the dashboard
without ad-hoc margin hacks.

## Title-Case sweep

Per the polish plan, a single `refactor:` commit standardized
**user-visible** headings to Title Case across:

- KPI card labels (`Average Salary`, `Job Titles`)
- Page / section `<h1>` / `<h2>` (`Employees by Country`, `Recent
  Hires`, `Total Compensation Burden`, `Compensation Outliers`,
  `Average Salary by Job Title`)
- Chart / table titles, outlier bucket labels (`Bottom 5% — Retention
  Risk`, `Top 5% — Budget Review`)

**Deliberately excluded** to avoid over-shouting: ARIA labels,
status/empty messages, button labels, form labels, tooltip body text.

**Why one commit, not per-call**: a Title-Case rename is pure
refactor with no behavior change; bundling them produces one clean
commit instead of polluting the log with N near-identical entries.

## Insights page restructure

Stacked vertically with consistent card wrappers (Phase L):

```
InsightsPage
├── AnalyticsSection "Country Overview"             KPI cards
├── AnalyticsSection "Average Salary by Job Title"  TitleAveragesChart  + InfoHint
├── AnalyticsSection "Total Compensation Burden"                         + InfoHint
│   ├── AnalyticsSection "By Job Title"             PayrollBreakdown
│   └── AnalyticsSection "By Country"               PayrollBreakdown
└── AnalyticsSection "Compensation Outliers"        OutlierTables       + InfoHint
```

The payroll sub-sections are stacked (`space-y-4`), not side-by-side,
so each chart gets the full content width on every breakpoint. The
country selector lives in the page header's `actions` slot.

## Dashboard restructure (Phase M)

Same wrapper applied to `Employees by Country` and `Recent Hires`,
plus a re-render of `RecentHires` through `SummaryList` for visual
parity with the payroll list (Phase O).

## Employees table tooltips (Phase N)

The table's `columns` array type widened from `string` to
`string | ReactNode` so the `Compa` and `Spread` column headers can
embed `<InfoHint>` without changing every other column. Cheaper than
introducing a header-renderer pattern.

## Searchable country combobox

Replaced two plain-text country inputs (Employees filter + Insights
selector) with a single shadcn-style `<CountryCombobox>` built on
`cmdk` + `@radix-ui/react-popover`. Options are dynamic: the
`useDistinctCountries(filters)` hook hits
`GET /employees/countries?country=&q=` so the dropdown reflects the
*currently active filter chain* — typing a name search narrows the
country list to countries that still have matches. See
[tradeoffs-and-decisions.md](tradeoffs-and-decisions.md) §"shadcn-style
Combobox" for the rationale.

## Pagination "Showing X–Y of N"

The `<Pagination>` component took a `total` prop and rendered the full
"out of N" summary. Required:

- A new `apiFetchWithMeta` wrapper that reads `X-Total-Count` (already
  CORS-exposed by the backend).
- `useEmployees` returning `{ rows, total }` instead of `rows`.

See [tradeoffs-and-decisions.md](tradeoffs-and-decisions.md)
§"X-Total-Count header" for why a header beats an envelope response.

## Tooltip copy (canonical)

These strings live inline at call sites — no constants file (YAGNI for
~7 strings):

| Section | Copy |
|---|---|
| Dashboard / Employees by Country | "Headcount distribution across countries. Useful for spotting concentration of risk or growth opportunities." |
| Dashboard / Recent Hires | "Most recently added employees. Useful for onboarding follow-ups and audit trails." |
| Employees / Compa | "Compa-ratio: salary ÷ peer-group average. Below 80% may indicate underpayment risk; above 120% may need budget review." |
| Employees / Spread | "Range penetration: where the salary sits between peer-group min and max. 0% = floor, 100% = ceiling." |
| Insights / Average Salary by Job Title | "Mean salary per role within the selected country. Roles with one employee show that employee's salary." |
| Insights / Total Compensation Burden | "Total payroll cost distributed by country and by role. Use this to monitor budget concentration." |
| Insights / Compensation Outliers | "Lowest 5% (retention risk) and highest 5% (budget review) within each peer group of role and country." |

## Accessibility checkpoints

- `<InfoHint>` is a focusable `<button>`. Tab to focus → tooltip
  appears; Esc dismisses.
- All KPI / chart / table headings carry semantic `<h2>` / `<th>` —
  screen reader nav works.
- Color contrast: card background `bg-white` on page `bg-slate-50`
  yields ≥ 1.5:1 separation; section heading `text-slate-900` on card
  is 21:1.
- Charts ship with `<Bar isAnimationActive={false}>` for users with
  reduced-motion preferences.
- jsdom polyfills (`ResizeObserver`, `PointerEvent`, `scrollIntoView`)
  cover Radix Tooltip and cmdk in tests — no behavior gap.

## What this pass deliberately does NOT add

- No design token JSON. Tailwind classes inline.
- No centralized `headings.ts` constants file. ~10 strings; YAGNI.
- No new fonts, colors, animation libraries.
- No theming / dark mode. Out of scope for the assessment.
- No layout grid system. `space-y-*` is enough.

## See also

- [frontend-architecture.md](frontend-architecture.md) — where these
  primitives live in the module map.
- [analytics-strategy.md](analytics-strategy.md) — the data behind
  the analytics sections these primitives decorate.
- [testing-strategy.md](testing-strategy.md) — behavioral component
  tests over snapshot tests.
- [tradeoffs-and-decisions.md](tradeoffs-and-decisions.md) — every
  framework / dependency choice.
