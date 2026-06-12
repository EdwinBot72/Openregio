---
name: Plan naming convention
description: Internal plan names vs. display labels for OpenRegio subscription plans
---

## Rule
Internal DB/API plan values: `"basic"`, `"pro"`, `"coaching"` — always lowercase English.
Never use `"basis"` as an internal value; it was a legacy Dutch variant that caused bugs.

## Display labels (frontend)
| Internal | Display NL |
|----------|-----------|
| basic | Basis |
| pro | Pro |
| coaching | 1-op-1 coaching |

## Prices (excl. btw)
- basic: €14,95/maand
- pro: €59/maand
- coaching: prijs op aanvraag

**Why:** The codebase had a mix of "basis" (NL) and "basic" (EN) causing TS errors,
broken plan comparisons, and wrong course-access filtering. Canonical value is now
always "basic" everywhere (DB, schema, routes, config).

**How to apply:** Any new plan check: `plan === "basic"`, not `"basis"`.
COURSE_PLAN_TYPES = ["basic", "pro", "all"]. Display via getPlanDisplayName() or
the PLAN_DISPLAY record in shared/pricing.ts.
