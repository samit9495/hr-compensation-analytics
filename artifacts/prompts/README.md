# AI Prompts

Every non-trivial AI invocation that shaped the codebase is recorded
here. Same level of citation discipline as a research paper.

## Stitch MCP — UI generation

### Employees table + filters

> "Generate a React component for an HR Salary Management `EmployeesTable`.
> It accepts an `employees: Employee[]` prop where Employee has
> `{ id, full_name, job_title, country (ISO2), salary (string), is_active }`.
> Show a striped table with a sticky header and per-row Edit / Delete
> buttons. Render an accessible empty state when the array is empty.
> Tailwind only — no shadcn primitives."
>
> "Add a companion `EmployeesFilters` component with a text search,
> a 2-letter country input (auto-uppercase), and a sort dropdown
> (name / -name / salary / -salary). Submit via a `Filter` button that
> calls `onApply({q, country, sort})`."

The output was used as a draft. Hand-refinements:

- replaced raw `<table>` styling with semantic landmarks
  (`role="search"` on filters, `caption` on the table, `aria-label`s on
  action buttons),
- extracted hardcoded option lists into the component,
- removed all unused imports and tightened types.

### Employee form

> "Build a `EmployeeForm` using React Hook Form + Zod. Fields:
> full_name (1–120), job_title (1–120), country (2 letters), salary
> (decimal ≥ 0), email (optional), department (optional, ≤ 120),
> is_active (bool, default true). Show inline errors with
> `aria-invalid`. Submit calls a prop `onSubmit(EmployeeCreate)` and
> shows a banner on rejection."

Hand-refined to (a) accept `initialValues` for the edit case,
(b) reset the submit error when the user starts editing, and
(c) match the project's existing form-control class.

### Insights + Dashboard

> "Build a `KpiCard` with `{ label, value }` props — single card,
> dark text on white, subtle border. Then build a Recharts
> `BarChart` wrapper `TitleAveragesChart` that takes
> `Record<string, number>` and renders bars sorted by value desc with
> an accessible `role="img"` wrapper and an empty-state message."

## LLM Council — extra insight metrics

Run when deciding what to add beyond average-by-country.

> "We have `/insights/by-country/{country}` returning avg/min/max/count.
> Should we add: (a) top job titles overall, (b) avg per (country, title),
> (c) percentile salary by country, (d) salary distribution histogram?
> Constraints: SQLite, 10k rows, single-screen Insights UI, must remain
> readable for a non-technical HR manager."

Council verdict: **(a) and (b)**. (c) and (d) add complexity without a
clear UI story for an HR manager who thinks in averages and counts.
Recorded as `top_titles_by_count` and
`average_salary_by_country_and_title` in `SalaryInsightsService`.

## Future prompts

Add a new dated section each time a Stitch or council invocation
changes the codebase. Keep the original prompt verbatim and note the
diff applied before commit.
