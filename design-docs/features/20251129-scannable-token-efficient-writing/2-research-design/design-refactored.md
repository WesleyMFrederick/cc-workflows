# Scannable & Token-Efficient Writing - Design Document

**Date**: 2025-11-29
**Status**: Draft
**Related**: [Requirements](../requirements.md) | [Phase 2 Whiteboard](./whiteboard-phase2.md)

## Architecture Decision

**Skill Type**: MECHANISM (Reference/Technique)
**Scope**: Project (`.claude/skills/scannable-token-efficient-writing/`)
**File Structure**: SKILL.md (<200 words) + formatting-reference.md (~2,000 words)
**Pattern**: Heavy reference (per writing-skills guidelines)

### MECHANISM vs. POLICY

**This skill is MECHANISM**: Teaches formatting techniques and patterns
- How to write scannably
- How to reduce tokens
- Pattern library for common scenarios

**NOT policy enforcement**: Doesn't mandate when to use (that's CEO hook's job)
- CEO hook = POLICY (when to be brief)
- This skill = MECHANISM (how to be brief)

**Separation rationale**: Hook stays lightweight (~200 tokens), skill provides depth when needed

## Integration Architecture

```text
CEO Hook (user-prompt-submit.sh) ────> High-level directives
         │                              "Be concise, scannable"
         │
         ├─> Skill (scannable-token-efficient-writing)
         │   └─> Detailed HOW (formatting, examples)
         │
         └─> elements-of-style skill
             └─> Prose quality (word choice, grammar)
```

**No overlap**:
- CEO hook: When/why be brief (POLICY)
- This skill: How to be brief (MECHANISM)
- elements-of-style: Prose clarity (separate concern)

## Content Strategy

### Core Sections (in skill)

1. **Overview** - What/when to use (~150 words)
2. **Content-Type Matrix** - Table: 12 types → format decision
3. **Formatting Patterns** - Front-loading, visual hierarchy, F-pattern
4. **Token Techniques** - Hedge word removal, reference vs. repetition
5. **Progressive Disclosure** - 3 patterns with templates
6. **Before/After Examples** - 3 examples (not 5, token budget)
7. **Red Flags** - Quick self-check list

### Eliminated from Original Design

**Removed** (too verbose):
- Long before/after examples → Compress to 3 short ones
- Detailed rationalizations table → Brief red flags list
- Comprehensive architecture discussion → Single integration diagram

**Cross-reference instead of duplicate**:
- Elements-of-style for prose quality
- CEO hook for when to apply

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Skill vs. hook enhancement | New skill | Hook stays lightweight, skill provides depth |
| Token budget | ~3,500 | Larger than typical but essential reference |
| MECHANISM/POLICY split | MECHANISM only | Reusable across contexts, hook handles policy |
| Example count | 3 not 5 | Token efficiency, cover most common cases |
| Matrix vs. prose | Table | Scannable, 60% token reduction |

## Token Optimization Applied

**From writing-skills patterns**:
- ✅ Cross-references (not duplication)
- ✅ Tables over prose (Content-Type Matrix)
- ✅ Compress examples (3 short vs. 5 long)
- ✅ Templates over explanations (Progressive Disclosure)
- ✅ Reference other skills (elements-of-style)

**Target verification**:

```bash
wc -w SKILL.md                    # Must be <200 words
wc -w formatting-reference.md      # ~2,000 words
```

## Skill Structure (Final)

### SKILL.md (<200 words)

```text
SKILL.md
├─ Overview (what this is)
├─ When to use (triggers)
├─ Token cost warning (~2,000 word reference)
└─ Link to formatting-reference.md
```

### formatting-reference.md (~2,000 words)

```text
formatting-reference.md
├─ Content-Type Decision Matrix (table)
├─ Formatting Patterns
│  ├─ Front-loading
│  ├─ Visual hierarchy
│  └─ F-pattern optimization
├─ Token Reduction Techniques
│  ├─ Remove hedge words
│  ├─ Avoid redundancy
│  └─ References vs. repetition
├─ Progressive Disclosure (3 templates)
├─ Before/After Examples (3)
└─ Red Flags
```

## What NOT to Include

**Excluded to meet token budget**:
- ❌ Extensive rationalizations table (use brief red flags)
- ❌ 5 before/after examples (use 3)
- ❌ Detailed architecture rationale (in this design doc)
- ❌ CEO hook implementation details (separate file)
- ❌ System 1/2 psychology deep dive (reference research)
- ❌ Multiple examples per pattern (one excellent example)

**Philosophy**: Mechanism, not manifesto. Teach technique, not theory.

## Success Metrics

**Skill deployed successfully when**:
1. Token count ≤ 3,500
2. 3 before/after examples cover 80% of use cases
3. Content-Type Matrix enables quick decision
4. Cross-references minimize duplication
5. Passes subagent testing (TDD required per writing-skills)

## Open Questions for Implementation

- Should Content-Type Matrix be exhaustive (12 types) or core (6 types)?
- Include System 1/2 explanation or just reference research?
- Separate file for extended examples or keep inline?

**Recommendation**: Inline only, 6 core types in matrix, reference research (not explain)
