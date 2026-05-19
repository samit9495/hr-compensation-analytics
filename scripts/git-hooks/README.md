# Git Hooks

Project-tracked git hooks for the Salary-Management-Assessment. Opt-in.
Hooks live in the repo so the assessor can read them; they are not
installed automatically — git only runs `.git/hooks/*` by default.

## Install (one-time)

From the repo root:

```bash
git config core.hooksPath scripts/git-hooks
chmod +x scripts/git-hooks/*
```

## Uninstall

```bash
git config --unset core.hooksPath
```

## What's here

| Hook | Purpose | Blocks commit? |
|------|---------|----------------|
| `post-commit` | Prints a yellow reminder when the commit subject / body signals an artifact entry is due (perf, Stitch MCP output, breaking change, design decision). | No — fires after the commit lands. |

## Triggers the `post-commit` hook reacts to

| Pattern | Suggested artifact |
|---------|--------------------|
| Subject `^perf:` (or `perf(scope):`, `perf!:`) | `artifacts/performance.md` |
| Subject `^docs(stitch):` / `^feat(stitch):` / `^chore(stitch):` | new file in `artifacts/prompts/` |
| Subject contains `!:` (Conventional Commits breaking-change marker) | `artifacts/tradeoffs.md` |
| Body opens with `tradeoff:` / `decision:` / `considered:` | `artifacts/tradeoffs.md` |

The reminder mirrors **Step 9 — Artifact audit** in
`.cursor/skills/incubyte-tdd-loop/SKILL.md`. Most commits (`test:`,
plain `feat:`, `refactor:`, `chore:`) match nothing and the hook stays
silent.

## Why a hook instead of full automation

- Stubs auto-written from a hook without human thought read like AI
  slop and would hurt the assessment more than they help.
- Per `.cursor/rules/incubyte-commit-hygiene.mdc`, every commit is a
  deliberate unit of work. The hook nudges; the human curates.
- Pre-commit hooks that run an LLM are flaky and slow down the
  TDD loop. `post-commit` runs after the safety net is already on
  disk.
