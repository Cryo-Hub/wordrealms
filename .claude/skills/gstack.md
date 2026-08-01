# Gstack Skill

Gstack (Get-Shit-Done Stack) is a pragmatic, results-focused approach: ship working code now, refactor later if needed. Bias toward action and measurable progress over architectural perfection.

## Core Philosophy

**Shipping > Perfection**

- Get it working first
- Get it fast
- Get it out
- Optimize if metrics demand it
- Refactor if duplication becomes obvious

## Gstack Rules

1. **Function Before Form** - Does it work? Ship it. Polish later.
2. **One Solution Now > Perfect Solution Never** - Done is better than perfect
3. **Remove Duplication Only When You See It 3x** - DRY is good; premature DRY is waste
4. **Measure, Don't Guess** - Only optimize what you've measured
5. **Deadline > Feature Creep** - Shipping late with extras is worse than shipping on time with the core
6. **No Pre-optimization** - Write straightforward code until profiling says otherwise
7. **Commit to Main When It Works** - Don't let branches rot waiting for perfection

## The Gstack Workflow

```
1. Write a function that works
2. If it's obvious garbage, fix it
3. If it's obviously duplicated, deduplicate
4. If it's obviously slow (you measured), optimize
5. Otherwise: ship it
```

## When to use Gstack

- Startup/MVP development
- Prototyping features
- Competitive time-to-market matters
- User feedback drives the roadmap
- Cost per feature delivery matters

## Anti-pattern: Gstack Abuse

Gstack is **not**:
- An excuse for bad code
- Permission to ignore obvious bugs
- Reason to skip security checks
- "YOLO engineering"

Gstack says: ship fast, but ship things that work.

---

**Gstack Checklist**
- ☐ It works (tested manually)
- ☐ It doesn't crash on normal input
- ☐ It's understandable (passes caveman test)
- ☐ Ship it now, optimize tomorrow if needed
