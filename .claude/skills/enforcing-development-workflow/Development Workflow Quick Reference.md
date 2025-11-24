# Development Workflow - Quick Reference

## Progressive Disclosure: Four Levels

```
┌─────────────────────────────────────────────────────────────────┐
│ LEVEL 1: HIGH-LEVEL, GENERIC                                    │
├─────────────────────────────────────────────────────────────────┤
│ Phase 1: DISCOVERY & IDEATION                                   │
│ Brainstorm → Elicit → Sense Making → Problem Framing           │
│                         ↓                                        │
│                   [Whiteboard]                                  │
│                         ↓                                        │
│              [Requirements Document]                            │
│                                                                 │
│ Output: Generic, high-level understanding                       │
│ Question: WHAT needs to be solved?                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ LEVEL 2: MEDIUM DETAIL, SYSTEM-SPECIFIC (THE BRIDGE)            │
├─────────────────────────────────────────────────────────────────┤
│ Phase 2: RESEARCH & DESIGN                                      │
│ Requirements triggers research loop:                            │
│ Gather Context → Identify Gaps → Solutions Hypothesis          │
│                         ↓              ↑                        │
│              Research Patterns ────────┘                        │
│                         ↓                                        │
│              [Phase 2 Whiteboard]                               │
│                         ↓                                        │
│                [Design Document]                                │
│                                                                 │
│ Output: System-adapted design                                   │
│ Question: HOW does this fit OUR system context?                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ LEVEL 3: HIGHER DETAIL, WORK DECOMPOSITION                      │
├─────────────────────────────────────────────────────────────────┤
│ Phase 3: SEQUENCING                                            │
│                                                                 │
│ [Requirements] ───────┐                                        │
│ [Design] ─────────────┼──→ [Sequencing Document]              │
│ [Whiteboards] ─ ─ ─ ─ ┘    (weak/optional)                    │
│                                                                 │
│ Output: Ordered work breakdown                                  │
│ Question: In what ORDER and how DECOMPOSED?                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ LEVEL 4: MAXIMUM DETAIL, EXECUTABLE                             │
├─────────────────────────────────────────────────────────────────┤
│ Phase 4: IMPLEMENTATION PLAN                                    │
│                                                                 │
│ [Sequencing] ──→ [Task Implementation Plan]                    │
│                                                                 │
│ Output: 2-5 min tasks with exact code                          │
│ Question: EXACTLY what actions to take?                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ EXECUTION OPTIONS                                               │
├─────────────────────────────────────────────────────────────────┤
│ Option A: subagent-driven-development (same session)           │
│ Option B: executing-plans (parallel session)                   │
└─────────────────────────────────────────────────────────────────┘
```

## The Bridge Concept

**Phase 2 (Research & Design) is THE BRIDGE:**

- Requirements are generic (WHAT to solve)
- Design is system-specific (HOW in YOUR context)
- The bridge adapts generic to specific through research

## Iterative Loop

Within Phase 2 Research & Design:

- Gather → Gaps → Hypothesis ⟷ Research Patterns (iterative)
- Continues until system-specific design is solid

## Key Decision Points

|Question|Answer|
|---|---|
|When to loop within Research & Design?|Until system-specific approach is validated|
|When to skip Discovery?|Requirements already exist and are clear|
|Can I skip Research & Design (the bridge)?|**NO** - Can't go from generic requirements to code|
|Can I skip Sequencing?|**NO** - Need work decomposition before tasks|
|What if requirements are already system-specific?|Then you've done the bridge - proceed to Sequencing|

## Required Skills by Phase

|Phase|Required Skill|Purpose|
|---|---|---|
|Phase 1|`writing-requirements-documents`|Transform whiteboard to formal requirements|
|Phase 2|`evaluate-against-architecture-principles`|Validate design choices|
|Phase 3|None|Work sequencing and decomposition|
|Phase 4|`writing-plans`|Bite-sized implementation tasks|
|Execution|`subagent-driven-development` OR `executing-plans`|Task execution|

## Artifacts at Each Stage (Progressive Disclosure)

1. **Whiteboard** - Informal exploration (Phase 1)
2. **Requirements Document** - High-level, generic (Level 1)
3. **Design Document** - Medium detail, system-specific (Level 2) ← THE BRIDGE
4. **Sequencing Document** - Higher detail, work decomposition (Level 3)
5. **Task Implementation Plan** - Maximum detail, 2-5 min tasks (Level 4)

## Common Mistakes

❌ Jump from Requirements directly to code (missing 2 disclosure levels) ❌ Write system-specific Requirements (they should be generic) ❌ Write generic Design (it should be system-adapted) ❌ Skip the bridge (Research & Design phase) ❌ Create Implementation Plan without Sequencing

✅ Follow progressive disclosure levels sequentially ✅ Keep Requirements generic, Design system-specific ✅ Use Research & Design to create the bridge ✅ Sequence before detailed planning ✅ Use required skills at each phase
  