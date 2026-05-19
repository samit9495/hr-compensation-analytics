---
name: incubyte-code-quality
description: Short companion for code smells, edge cases, logging context, and refactor boundaries. Use when reviewing a diff, hardening validation, or splitting a large module.
---

# Incubyte Code Quality (skill)

Companion to `.cursor/rules/incubyte-code-quality.mdc` and `.cursor/rules/incubyte-craftsmanship.mdc`.

## Smells

| Smell | Direction |
|-------|-----------|
| Magic numbers/strings | Named constant or `Enum` |
| `.get(id=x)` without None check | `get_or_404` or explicit guard + domain exception |
| Function > 20 lines | Extract intermediate functions |
| File > 300 lines | Split by responsibility |
| `if/elif` chain on a type field | Strategy / polymorphism |
| `print` for diagnostics | `logger.info/debug/exception` with context |
| Commented-out code | Delete; git remembers |
| Boolean trap (`flag=True` arg) | Two functions with intention-revealing names |

## Edge cases (always consider)

- Empty list, empty string, `None`, `0`
- Country with zero employees ⇒ insights endpoint returns 0, not 500
- One-element aggregation ⇒ average == that one value, not divide-by-zero
- Decimal precision: `Numeric(12, 2)` + `.quantize(Decimal("0.01"))`
- Long names, non-ASCII characters in `full_name`
- Pagination: `limit` and `offset` validated; `limit <= 500`

## Logging context

```python
logger.exception("Failed to compute insights for country=%s metric=%s", country, metric)
```

Identifiers in the message. Never log secrets or full request bodies.

## Structure

- One responsibility per file
- `__init__.py` re-exports only — no behavior
- Circular import ⇒ split the module

## See also

- Rule: `.cursor/rules/incubyte-code-quality.mdc`
- Rule: `.cursor/rules/incubyte-craftsmanship.mdc`
- Agent: `.cursor/agents/incubyte-code-reviewer.md`
