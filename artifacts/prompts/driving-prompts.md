# Cursor Agent Driving Prompts

> Companion to [README.md](README.md), which catalogs Stitch UI generation
> and LLM Council prompts. This file captures the high-signal
> **user-to-agent prompts** that drove the build itself — architecture,
> TDD planning, product thinking, scalability, UI/UX, performance,
> testing strategy, and refactoring decisions.
>
> Repetitive "implement the plan" directives, short chores
> ("push the changes", "commit these plans"), the venv-setup follow-up,
> and the Plan-mode meta-prompt that produced this artifact are
> intentionally **excluded** as low-signal.

## Index

1. [Initial implementation plan](#1-initial-implementation-plan)
2. [Bug fixes & advanced HR analytics](#2-bug-fixes--advanced-hr-analytics)
3. [UX polish pass: card sections, tooltips, Title Case](#3-ux-polish-pass-card-sections-tooltips-title-case)
4. [Payroll summary readability](#4-payroll-summary-readability)
5. [Seed 10k performance validation](#5-seed-10k-performance-validation)
6. [Repo code review via `incubyte-code-reviewer`](#6-repo-code-review-via-incubyte-code-reviewer)
7. [Address review warnings & info](#7-address-review-warnings--info)
8. [Repo QA pass via `incubyte-qa-automation`](#8-repo-qa-pass-via-incubyte-qa-automation)

---

## 1. Initial implementation plan

**Date**: Wednesday, May 20, 2026, 2:03 AM (UTC+5:30)
**Demonstrates**: architecture reasoning, TDD planning, AI-assisted engineering, scalability analysis, testing strategy
**Purpose**: bootstrap the entire build with a single, exhaustive plan that wires together TDD, clean architecture, and the AI tooling (Stitch, LLM Council, code reviewer, QA automation) before a single line of code is written.

**Prompt** (verbatim):

> Before moving forward, create a comprehensive implementation plan for the project located at: @Salary Management Assessment.pdf
>
> This plan will serve as the primary execution reference for all future development work, so it must be extremely detailed, structured, and implementation-focused.
>
> Requirements for the plan:
>
> - Analyze the current repository structure, AGENTS.md, Cursor rules, skills, agents, and project expectations before creating the plan.
> - The plan should strongly align with:
>   - TDD workflow
>   - Incubyte craftsmanship expectations
>   - clean architecture principles
>   - incremental delivery
>   - AI-assisted engineering workflow
>
> The plan must include:
>
> 1. Project phases in execution order
> 2. Detailed backend roadmap
> 3. Detailed frontend roadmap
> 4. Database design and migration plan
> 5. API design sequence
> 6. UI implementation sequence
> 7. Testing strategy for every feature
> 8. Refactor checkpoints
> 9. Documentation checkpoints
> 10. AI usage checkpoints
> 11. Deployment preparation steps
> 12. Review + QA checkpoints
>
> Important constraints:
>
> - Every feature must be broken into very small/micro implementation tasks.
> - Tasks should be small enough to support:
>   - one failing test
>   - one implementation step
>   - one refactor step
>   - one small commit
>
> For each task include:
> - objective
> - files likely affected
> - dependencies/prerequisites
> - expected tests
> - suggested commit examples
> - whether Plan / Ask / Agent / Debug mode is most appropriate
>
> The plan should heavily leverage the chosen stack:
>
> Backend:
> - FastAPI
> - SQLAlchemy 2.x
> - Pydantic v2
> - SQLite
> - pytest
>
> Frontend:
> - React 18
> - Vite
> - TypeScript strict mode
> - Tailwind CSS
> - shadcn/ui
> - TanStack Query
> - TanStack Table
> - React Hook Form
> - Recharts
> - Vitest + React Testing Library
>
> AI workflow:
> - Stitch MCP for UI scaffolding
> - LLM Council for architecture/tradeoff discussions
> - Code Reviewer agent
> - QA Automation agent
> - Context7 for framework references
>
> Additional expectations:
> - Include suggested folder structure evolution over time
> - Include scalability considerations for 10,000 employees
> - Include pagination/filtering/query optimization strategy
> - Include analytics architecture strategy
> - Include seed script performance strategy
> - Include frontend state management strategy
> - Include reusable component extraction strategy
> - Include accessibility and UX checkpoints
> - Include git commit strategy guidance
> - Include what should NOT be overengineered
>
> Output format:
> - Create this as a highly readable markdown execution document
> - Prefer checklists, tables, and phased sections
> - Optimize the structure so it can be followed step-by-step during development
> - Keep the plan practical and implementation-oriented, not theoretical

**Impact**: produced [.cursor/plans/salary_mgmt_execution_plan_4021925a.plan.md](../../.cursor/plans/salary_mgmt_execution_plan_4021925a.plan.md), the 13-phase execution plan that drove the entire initial build. Every commit in the first ~100 commits maps to a micro-task from this plan. It pinned the stack, made TDD non-negotiable, and forced the AI-tooling decisions (Stitch for UI, Council for tradeoffs, code-reviewer and qa-automation as named agents) up front.

---

## 2. Bug fixes & advanced HR analytics

**Date**: Wednesday, May 20, 2026, 11:47 AM (UTC+5:30)
**Demonstrates**: architecture reasoning, product thinking, scalability analysis, refactoring decisions, UI/UX generation, TDD planning, testing strategy
**Purpose**: convert post-build manual-testing findings (3 bugs, 3 enhancements) into a TDD-driven plan that pulls the Insights page from a basic dashboard up to a strategic HR compensation analysis tool — with compa-ratio, range penetration, payroll burden, and outlier detection.

**Prompt** (verbatim):

> After manually testing the application, I identified several bugs, UX inconsistencies, and product enhancements that need to be addressed.
>
> Before implementing changes:
> - analyze the current backend and frontend architecture,
> - identify affected components/services/endpoints,
> - propose the cleanest implementation strategy,
> - preserve existing behavior,
> - avoid unnecessary complexity,
> - maintain TDD discipline and incremental commits.
>
> The implementation should align with:
> - FastAPI
> - SQLAlchemy 2.x
> - React + TypeScript
> - TanStack Query
> - TanStack Table
> - shadcn/ui
> - Recharts
> - clean architecture principles
> - maintainable reusable frontend patterns
>
> Important:
> - break implementation into small/micro tasks,
> - prefer reusable abstractions,
> - maintain strong typing,
> - preserve frontend responsiveness and accessibility,
> - add/update tests wherever behavior changes.
>
> ====================================================
> ISSUES TO FIX
> ====================================================
>
> 1. Job Title Case Sensitivity
> Current issue:
> The Title field is case-sensitive and treats:
> - "engineer"
> - "Engineer"
> as separate titles.
>
> Expected behavior:
> - title filtering,
> - grouping,
> - analytics,
> - aggregations,
> should all behave case-insensitively.
>
> Requirements:
> - normalize title handling consistently across backend and frontend,
> - preserve original formatting for display purposes if possible,
> - analytics should aggregate equivalent titles together,
> - update tests for case-insensitive behavior.
>
> Examples:
> - "Engineer", "engineer", "ENGINEER"
> should all be treated as the same logical title.
>
> ----------------------------------------------------
>
> 2. Country Filter Inconsistency
> Current issue:
> - Employees page country filter behaves case-insensitively (correct),
> - Insights page country filter behaves case-sensitively (incorrect).
>
> Expected behavior:
> Country handling must be fully case-insensitive everywhere.
>
> Requirements:
> - unify country normalization logic,
> - ensure filtering + analytics use consistent behavior,
> - update relevant backend query logic and frontend filter handling,
> - add regression tests.
>
> ----------------------------------------------------
>
> 3. Recharts Y-Axis Label Clipping
> Current issue:
> Under the "Average salary by job title" chart,
> the Y-axis labels are getting clipped/cut from the left side.
>
> Requirements:
> - properly fix chart spacing/layout,
> - ensure labels are fully visible,
> - preserve responsiveness,
> - avoid hardcoded hacks where possible,
> - review Recharts margin/container sizing best practices.
>
> The attached screenshot should be referenced for the issue.
>
> ====================================================
> ENHANCEMENTS
> ====================================================
>
> 1. Dynamic Searchable Country Dropdowns
> Currently country input fields are plain text inputs.
>
> Enhancement:
> Replace country inputs on:
> - Employees page
> - Insights page
>
> with:
> - searchable select dropdowns,
> - built using reusable shadcn/ui components.
>
> Requirements:
> - search-enabled dropdown,
> - dynamically generated country options,
> - options should react to active filters.
>
> Example:
> If current filters/search results only contain:
> - India
> - USA
> - Germany
>
> then dropdown should only display those 3 countries.
>
> Implementation expectations:
> - avoid duplicate country-fetching logic,
> - prefer reusable hooks/services,
> - optimize for performance,
> - preserve accessibility and keyboard navigation.
>
> Consider:
> - deriving countries from filtered dataset,
> OR
> - dedicated lightweight backend endpoint,
> depending on architecture quality and scalability.
>
> Document tradeoffs if needed.
>
> ----------------------------------------------------
>
> 2. Improve Pagination Summary
> Current text:
> "Showing 1–25"
>
> Expected:
> "Showing 1–25 out of X"
>
> Where:
> X = total employee count after filtering.
>
> Requirements:
> - update pagination component,
> - ensure total updates dynamically with filters/search,
> - maintain responsive layout,
> - preserve TanStack Table pagination flow.
>
> ----------------------------------------------------
>
> 3. Advanced HR Insights & Compensation Analytics
> I want to evolve the Insights page from a basic analytics dashboard into a more strategic HR compensation analysis tool.
>
> The implementation should focus on:
> - meaningful HR product thinking,
> - practical analytics,
> - visually understandable insights,
> - maintainable architecture,
> - scalable aggregation logic.
>
> ====================================================
> ADVANCED HR METRICS
> ====================================================
>
> A. Compa-Ratio (Compensation Ratio)
>
> Definition:
> Compares an employee's salary against the midpoint/average salary for:
> - the same role,
> - in the same country.
>
> Insights:
> - <= 80% → severe underpayment / retention risk
> - 90–110% → healthy compensation range
> - >= 120% → highly compensated employee
>
> Implementation Requirements:
> - calculate dynamically,
> - include backend support,
> - expose through APIs cleanly,
> - avoid duplicated aggregation queries.
>
> Frontend:
> - add colored compensation badges beside employee rows,
> - visually distinguish:
>   - underpaid,
>   - healthy,
>   - highly compensated.
>
> Suggested badge colors:
> - Red → under 80%
> - Green → 90–110%
> - Orange → above 120%
>
> Requirements:
> - reusable badge component,
> - accessible color usage,
> - tooltip or explanation support if appropriate.
>
> ----------------------------------------------------
>
> B. Salary Spread / Range Penetration
>
> Goal:
> Show how close an employee is to the upper compensation boundary for their role.
>
> Insights:
> - identify employees near salary ceiling,
> - identify employees with growth runway.
>
> Requirements:
> - define a reasonable spread calculation strategy,
> - document assumptions,
> - implement scalable aggregation logic,
> - expose insights cleanly in UI.
>
> ====================================================
> MACRO-LEVEL ORGANIZATIONAL INSIGHTS
> ====================================================
>
> A. Total Compensation Burden
>
> Metrics:
> - total payroll by country,
> - total payroll by job title,
> - compensation distribution insights.
>
> HR Value:
> Provide organizational budgeting visibility.
>
> Examples:
> - payroll distribution percentages,
> - highest payroll regions,
> - most expensive departments/roles.
>
> Requirements:
> - reusable aggregation queries,
> - chart-friendly APIs,
> - responsive visualizations.
>
> ----------------------------------------------------
>
> B. Outlier Detection
>
> Goal:
> Identify:
> - bottom 5% compensation employees,
> - top 5% compensation employees,
> within comparable peer groups.
>
> Insights:
> - bottom 5% → retention risk,
> - top 5% → budget anomaly review.
>
> Requirements:
> - define clear peer grouping strategy,
> - avoid naive global comparisons,
> - scalable query design,
> - meaningful visual indicators in UI.
>
> ====================================================
> IMPLEMENTATION EXPECTATIONS
> ====================================================
>
> Implementation should:
> - follow strict TDD workflow,
> - maintain small commits,
> - separate:
>   - tests,
>   - implementation,
>   - refactors,
> - avoid overengineering,
> - preserve clean architecture.
>
> Before coding:
> 1. Create a phased implementation plan.
> 2. Identify backend/frontend tasks separately.
> 3. Identify reusable abstractions/components.
> 4. Identify new API requirements.
> 5. Identify database/query implications.
> 6. Identify testing strategy.
> 7. Identify scalability considerations.
> 8. Identify possible refactor opportunities.
>
> Prefer:
> - reusable analytics query services,
> - reusable chart wrappers,
> - reusable filter abstractions,
> - reusable badge/status components,
> - strongly typed API contracts,
> - maintainable frontend state handling.
>
> Finally:
> Generate a recommended commit sequence for the entire implementation.

**Impact**: produced [.cursor/plans/salary-mgmt_bugs_and_analytics_2c8dd4b6.plan.md](../../.cursor/plans/salary-mgmt_bugs_and_analytics_2c8dd4b6.plan.md) and roughly 60 commits — case-insensitive `title_canonical` (`lower(job_title)`) used across the repository and compensation services; a new `/employees/compensation-analysis` endpoint backed by `CompensationAnalysisService` (SQL window functions for compa-ratio and range penetration); `/insights/payroll/by-{country,title}` and `/insights/outliers` (NTILE bucketing); shadcn-based `Combobox` / `CountryCombobox` primitive; full-pagination `X-Total-Count`. The user's two architectural questions during execution (separate endpoint vs. inline; shadcn primitives) were both answered explicitly and shaped the contract.

---

## 3. UX polish pass: card sections, tooltips, Title Case

**Date**: Wednesday, May 20, 2026, 12:50 PM (UTC+5:30)
**Demonstrates**: UI/UX generation, product thinking, accessibility, refactoring decisions, testing strategy
**Purpose**: lift the Insights and Dashboard pages from "functional" to "polished enterprise HR analytics platform" — establish a reusable analytics-section wrapper, one accessible tooltip primitive, and Title Case as a project-wide convention for user-visible headings.

**Prompt** (verbatim):

> After manually testing the application again, I identified additional UX, layout, consistency, and usability improvements required across the Dashboard, Employees, and Insights pages.
>
> Before implementing:
> - review the current page layout hierarchy,
> - improve visual separation and readability,
> - establish consistent section patterns,
> - introduce reusable informational tooltip behavior,
> - standardize heading conventions across the application,
> - preserve responsiveness and accessibility,
> - avoid visual clutter,
> - maintain clean reusable frontend abstractions.
>
> The goal is to make the application feel like a polished enterprise HR analytics platform with strong product clarity, discoverability, and UI consistency.
>
> Implementation should align with:
> - React + TypeScript
> - Tailwind CSS
> - shadcn/ui
> - Recharts
> - reusable component architecture
> - accessibility best practices
> - responsive dashboard design patterns
>
> ====================================================
> ENHANCEMENTS
> ====================================================
>
> 1. Improve "Total Compensation Burden" Layout
>
> Current issue:
> Under the Insights page → "Total Compensation Burden",
> the following charts are currently rendered side-by-side:
> - "By Country"
> - "By Job Title"
>
> This makes the section feel:
> - cramped,
> - visually noisy,
> - difficult to scan,
> especially on medium-sized screens.
>
> Expected structure:
>
> "Total Compensation Burden"
>     ├── By Job Title
>     └── By Country
>
> Requirements:
> - stack these charts vertically instead of horizontally,
> - maintain proper spacing between graphs,
> - preserve responsive behavior,
> - ensure charts utilize available width properly,
> - improve readability and visual hierarchy.
>
> Implementation expectations:
> - avoid hardcoded spacing hacks,
> - use reusable responsive layout containers,
> - preserve chart responsiveness across breakpoints.
>
> ====================================================
>
> 2. Improve Visual Separation Between Insights Sections
>
> Current issue:
> The entire Insights page visually blends together, making:
> - sections difficult to distinguish,
> - analytics harder to scan,
> - dashboard hierarchy unclear.
>
> Expected behavior:
> Every major analytics section should visibly feel independent and self-contained.
>
> Examples of sections:
> - Average Salary by Job Title
> - Total Compensation Burden
> - Compensation Outliers
> - Salary Distribution
> - Country Insights
> - Retention Risk Metrics
>
> Requirements:
> - add stronger section separation,
> - improve spacing/padding consistency,
> - introduce visually distinct section containers/cards,
> - improve typography hierarchy,
> - improve section titles and subtitles,
> - maintain a clean enterprise dashboard feel.
>
> Suggested improvements:
> - card-based grouping,
> - section borders/backgrounds,
> - subtle elevation/shadows,
> - consistent vertical rhythm,
> - reusable analytics section wrapper component.
>
> Requirements:
> - preserve responsiveness,
> - avoid over-styling,
> - keep UI professional and minimal,
> - avoid inconsistent spacing patterns.
>
> ====================================================
>
> 3. Add Reusable Informational Tooltips To Advanced/Non-Obvious Headings
>
> Current issue:
> Several analytics and HR-specific terms are not self-explanatory for first-time users.
>
> Expected behavior:
> Every advanced or non-obvious metric/section should include a consistent informational tooltip explaining:
> - what the metric means,
> - why it matters,
> - how HR managers can use it.
>
> Requirements:
> - use ONE reusable tooltip icon/component everywhere,
> - maintain consistent tooltip behavior and styling,
> - ensure accessibility and keyboard support,
> - avoid duplicated tooltip logic.
>
> Tooltip should appear beside section headings/titles.
>
> ====================================================
> SECTIONS THAT SHOULD HAVE TOOLTIPS
> ====================================================
>
> Dashboard Page:
> - "Employees by Country"
> - "Recent Hires"
>
> Employee Page:
> - "Compa"
> - "Spread"
>
> Insights Page:
> - "Average Salary by Job Title"
> - "Total Compensation Burden"
> - "Compensation Outliers"
>
> Additional expectation:
> Any future advanced analytics section should easily support this same tooltip system.
>
> ====================================================
> TOOLTIP CONTENT EXPECTATIONS
> ====================================================
>
> Tooltips should:
> - be concise,
> - be business-oriented,
> - explain value clearly,
> - avoid overly technical language,
> - help HR users understand why the metric matters.
>
> Examples:
>
> "Compa"
> → Explains how employee salary compares against peers in the same role and country.
>
> "Spread"
> → Explains how close an employee is to the upper salary boundary for their role.
>
> "Total Compensation Burden"
> → Explains overall payroll cost distribution across the organization.
>
> "Compensation Outliers"
> → Explains how unusually low/high compensated employees may indicate retention or budgeting risks.
>
> ====================================================
>
> 4. Standardize Heading Capitalization Across The Entire Application
>
> Current issue:
> Heading capitalization is currently inconsistent across pages/components.
>
> Expected behavior:
> All page titles, section headings, chart titles, card titles, and major labels should consistently follow:
> - Title Case convention
>
> Examples:
> ✅ Correct:
> - "Average Salary by Job Title"
> - "Total Compensation Burden"
> - "Employees by Country"
>
> ❌ Incorrect:
> - "Average salary by job title"
> - "total compensation burden"
> - "employees By country"
>
> Requirements:
> - standardize heading capitalization everywhere in the application,
> - ensure consistency across:
>   - Dashboard
>   - Employees page
>   - Insights page
>   - charts
>   - cards
>   - tables
>   - dialogs/modals
>   - reusable components,
> - avoid hardcoded inconsistent labels.
>
> Implementation expectations:
> - identify reusable heading/title patterns,
> - centralize constants/configuration where appropriate,
> - preserve readability,
> - avoid overengineering.
>
> ====================================================
> IMPLEMENTATION EXPECTATIONS
> ====================================================
>
> Before coding:
> 1. Review current dashboard layout architecture.
> 2. Identify reusable section wrapper opportunities.
> 3. Identify reusable tooltip abstraction opportunities.
> 4. Identify responsive layout improvements.
> 5. Identify typography hierarchy inconsistencies.
> 6. Identify heading capitalization inconsistencies.
> 7. Identify accessibility considerations.
>
> Implementation requirements:
> - create reusable analytics section components,
> - create reusable tooltip/icon wrapper,
> - preserve strong TypeScript typing,
> - maintain clean component composition,
> - avoid duplicated UI logic,
> - keep styling consistent across pages.
>
> Accessibility requirements:
> - keyboard accessible tooltips,
> - proper aria labels,
> - readable contrast,
> - responsive/mobile-friendly behavior.
>
> Testing expectations:
> - add/update frontend behavior tests where appropriate,
> - validate tooltip rendering,
> - validate responsive layout behavior,
> - validate reusable component behavior,
> - validate heading capitalization consistency where applicable.
>
> Finally:
> Generate a recommended phased implementation plan with:
> - backend/frontend impact,
> - reusable component strategy,
> - expected commits,
> - refactor opportunities,
> - testing strategy.

**Impact**: produced [.cursor/plans/insights-polish-ux-pass_c3887b4e.plan.md](../../.cursor/plans/insights-polish-ux-pass_c3887b4e.plan.md) and the reusable primitives that now back every analytics surface: `AnalyticsSection` (card wrapper with optional tooltip slot), `InfoHint` (single shadcn `@radix-ui/react-tooltip`-backed primitive used by every advanced-metric heading on Dashboard, Insights, and the Employees table), and a project-wide Title Case sweep applied only to user-visible elements. The two architectural questions during execution (tooltip primitive choice; capitalization scope) were both answered by the user mid-flow and locked into the plan.

---

## 4. Payroll summary readability

**Date**: Wednesday, May 20, 2026, 1:12 PM (UTC+5:30)
**Demonstrates**: UI/UX generation, refactoring decisions, reusable component patterns
**Purpose**: turn the cramped `<ul>/<li>` payroll summary into a structured, scannable list — and abstract the pattern so the same primitive can be reused elsewhere on the dashboard.

**Prompt** (verbatim):

> Additional UI/UX enhancement required for the "Total Compensation Burden" section.
>
> Current issue:
> Under:
> - "By Job Title"
> - "By Country"
>
> the `<ul>` / `<li>` summary items rendered below the graphs are visually too close together and almost merge into one another.
>
> This causes:
> - poor readability,
> - weak visual hierarchy,
> - cluttered appearance,
> - difficulty scanning payroll summary insights.
>
> Expected behavior:
> Each summary/list item should feel visually separated, structured, and easy to scan.
>
> Requirements:
> - improve spacing/alignment between list items,
> - add proper borders/dividers/cards between items,
> - ensure consistent padding and typography,
> - maintain responsive layout behavior,
> - preserve clean enterprise dashboard aesthetics,
> - avoid visually cramped content.
>
> Implementation expectations:
> - use reusable styling patterns/components where possible,
> - avoid ad-hoc margin hacks,
> - maintain consistent spacing system across the application,
> - ensure lists remain readable on smaller screens,
> - improve alignment between labels and values.
>
> Suggested UI direction:
> - bordered list rows,
> - subtle separators,
> - rounded containers,
> - flex/grid alignment for labels vs values,
> - improved vertical rhythm,
> - optional hover states if appropriate.
>
> Accessibility expectations:
> - maintain readable contrast,
> - preserve semantic list structure,
> - ensure responsive readability.
>
> Before implementing:
> 1. Review the current analytics summary list structure.
> 2. Identify reusable summary/list item component opportunities.
> 3. Standardize spacing/alignment patterns with the rest of the dashboard UI.
> 4. Ensure visual consistency with existing cards/analytics sections.
>
> Finally:
> Generate a clean implementation plan including:
> - affected components,
> - reusable UI abstractions,
> - styling strategy,
> - expected commits,
> - refactor opportunities.

**Impact**: produced the reusable `SummaryList` primitive — bordered, dividered, label/value rows with hover states — and refactored both `PayrollBreakdown` (per-row total + percentage chip) and the Dashboard "Recent Hires" list to consume it. Eliminated ad-hoc list spacing across the analytics surfaces.

---

## 5. Seed 10k performance validation

**Date**: Wednesday, May 20, 2026, 1:20 PM (UTC+5:30)
**Demonstrates**: performance optimization, scalability analysis, architecture reasoning
**Purpose**: stress-test the existing seed at the assessment-required 10k rows, with phase-level timings, and produce a structured report that classifies recommendations into "required / nice-to-have / premature" so the next decisions are evidence-driven.

**Prompt** (verbatim):

> Run the seed script for 10,000 employee records after first performing a complete cleanup/reset of existing seeded data.
>
> Goals:
> - validate real-world seed performance,
> - measure execution timings accurately,
> - evaluate scalability/readiness,
> - identify bottlenecks,
> - assess whether additional optimization is needed.
>
> Before execution:
> 1. Review the current seed architecture.
> 2. Identify:
>    - insertion strategy,
>    - batching strategy,
>    - transaction handling,
>    - duplicate handling,
>    - deterministic/random generation approach.
> 3. Confirm cleanup/reset strategy before reseeding.
>
> ====================================================
> EXECUTION REQUIREMENTS
> ====================================================
>
> 1. Cleanup Existing Data
> Before seeding:
> - remove/reset existing employee data cleanly,
> - ensure no duplicate accumulation,
> - confirm database is in expected clean state.
>
> Document:
> - cleanup strategy used,
> - tables affected,
> - whether IDs/autoincrement were reset.
>
> ====================================================
>
> 2. Run Seed Script For 10,000 Records
>
> Execute the full seed workflow for:
> - 10,000 employees
>
> Capture:
> - total execution time,
> - DB insertion time,
> - employee generation time,
> - startup/setup overhead,
> - any query bottlenecks,
> - memory concerns if visible.
>
> ====================================================
> PERFORMANCE REPORT
> ====================================================
>
> Generate a detailed performance report including:
>
> A. Execution Summary
> - total employees inserted,
> - total execution time,
> - average insert throughput,
> - whether execution completed successfully,
> - whether execution is deterministic/repeatable.
>
> B. Architecture Review
> Analyze:
> - bulk insert strategy,
> - transaction management,
> - SQLAlchemy usage,
> - SQLite suitability,
> - batching effectiveness,
> - memory efficiency.
>
> C. Scalability Analysis
> Evaluate:
> - whether current implementation is sufficient for 10k records,
> - likely bottlenecks at:
>   - 50k,
>   - 100k,
>   - 1M records,
> - whether pagination/filtering assumptions still hold.
>
> D. Optimization Opportunities
> Identify:
> - unnecessary DB commits,
> - N+1 patterns,
> - slow loops,
> - excessive object creation,
> - redundant transformations,
> - inefficient faker/random usage,
> - frontend implications if relevant.
>
> E. Recommendations
> Clearly classify recommendations into:
> - Required improvements
> - Nice-to-have optimizations
> - Premature overengineering to avoid
>
> ====================================================
> EXPECTATIONS
> ====================================================
>
> Important:
> - do NOT optimize blindly,
> - avoid premature complexity,
> - prefer measurable improvements only,
> - preserve readability and maintainability,
> - explain tradeoffs before suggesting major changes.
>
> If performance is already acceptable for the assessment scope:
> - explicitly state that,
> - avoid unnecessary architectural changes.
>
> ====================================================
> OUTPUT FORMAT
> ====================================================
>
> Provide:
> 1. execution logs summary,
> 2. timing breakdown table,
> 3. performance observations,
> 4. scalability assessment,
> 5. optimization recommendations,
> 6. final verdict on whether the current implementation is production-appropriate for the assessment requirements.
>
> Finally:
> Generate recommended follow-up tasks and commit suggestions if improvements are needed.

**Impact**: produced [.cursor/plans/seed-10k-perf-validate_dcbc7a0c.plan.md](../../.cursor/plans/seed-10k-perf-validate_dcbc7a0c.plan.md) and the dated 10k validation entry in [artifacts/performance.md](../performance.md). Mean wall-clock of **88ms for 10,000 rows** (~57x under the 5s budget), with a phase-level table showing the SQLAlchemy Core bulk path dominating (68%) and row generation second (27%). The explicit verdict — production-appropriate, no code changes warranted — prevented a round of premature optimization on a path that already wins by an order of magnitude.

---

## 6. Repo code review via `incubyte-code-reviewer`

**Date**: Wednesday, May 20, 2026, 1:37 PM (UTC+5:30)
**Demonstrates**: AI-assisted engineering, code quality, refactoring decisions
**Purpose**: invoke the project's own named code-reviewer agent against the full tree to surface anything an automated lint pass would miss — TDD-discipline regressions in `git log`, layering violations, SQL safety, error handling, missing tests, code smells.

**Prompt** (verbatim):

> review entire repo as per @.cursor/agents/incubyte-code-reviewer.md

**Impact**: surfaced 4 warnings (W1 private-method coupling, W2 access-log gap on 500, W3 `dict[str, object]` returns laundered with `# type: ignore`, W4 legacy `db.query().delete()`) and 3 info items (unused constant, duplicated `title_canonical`, file-size watch). The output became the input for the very next prompt, and W2 — initially mis-classified as a false positive — turned out to be a real RED→GREEN bug fix once a regression test was actually written.

---

## 7. Address review warnings & info

**Date**: Wednesday, May 20, 2026, 1:45 PM (UTC+5:30)
**Demonstrates**: TDD planning, refactoring decisions, regression safety
**Purpose**: hygiene-only pass against the review output — each warning landed as one logical, behavior-preserving (or behavior-locking) commit, with the explicit constraint of zero regressions.

**Prompt** (verbatim):

> Address the warnings and info. make sure no exisiting functionality is impacted.

**Impact**: produced [.cursor/plans/address-review-warnings_864a30e2.plan.md](../../.cursor/plans/address-review-warnings_864a30e2.plan.md) and a 6-commit sequence — `EmployeeRepository._filtered` renamed to public `apply_filters` (cross-referenced from `CompensationAnalysisService`), the W2 "false positive" rewritten as a real RED test → middleware fix that emits the access log from `finally` so unhandled errors are still recorded, TypedDict-typed returns for `payroll_by_*`, `global_overview`, and `salary_outliers` (dropping every `# type: ignore`), SA-2.x `delete()` in the seed test, and the dead `_ALLOWED_SORT_VALUES` constant removed. Test count went 127 → 128, coverage held at 99%.

---

## 8. Repo QA pass via `incubyte-qa-automation`

**Date**: Wednesday, May 20, 2026, 1:57 PM (UTC+5:30)
**Demonstrates**: AI-assisted engineering, testing strategy, refactoring decisions
**Purpose**: invoke the QA automation agent across the whole repo — coverage gap detection, gap-filling tests, full suite execution (backend + frontend + lint + tsc), and a fresh dated session in the manual-test-scenarios log.

**Prompt** (verbatim):

> test the entire repo using @.cursor/agents/incubyte-qa-automation.md

**Impact**: surfaced and fixed (RED→GREEN) a **latent `ALLOWED_ORIGINS` JSON-form bug** in `Settings._parse_origins` (the `NoDecode` marker meant the `if startswith("[")` branch silently failed at runtime); added two characterization tests (JSON-form parser, seed empty-files guard); cleaned all remaining frontend lint warnings — `coverage/` gitignored, dead `eslint-disable no-console` directives in `logger.ts` removed, and `CompaRatioBadge` / `SalaryBarChart` non-component helpers extracted into colocated `*.utils.ts` files so Vite Fast Refresh works. End state: backend 130 tests / 99% coverage, frontend 86 tests / 20 files, ESLint 0 errors / 0 warnings, `tsc --noEmit` clean. Wrote a dated session into [tasks/manual-test-scenarios.md](../../tasks/manual-test-scenarios.md) with six new scenarios covering every behavior change.
