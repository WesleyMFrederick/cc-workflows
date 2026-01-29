
# Scannable & Token-Efficient Writing - Design Document

**Date**: 2025-11-29
**Status**: Draft
**Related**:
- [Requirements](../requirements.md) %% force-extract %%
- [Phase 2 Whiteboard](./whiteboard-phase2.md) %% force-extract %%
- [writing-skills skill](../../../../.claude/skills/writing-skills/SKILL.md) %% force-extract %%
- [example-spec](example-spec.txt)

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

## Testing Strategy

**Per writing-skills requirement**: Must test with subagents BEFORE deploying skill.

### Baseline Test Scenarios (RED Phase)

#### Run WITHOUT skill to document natural violations

##### Scenario 1: Status Update Under Authority
- **Setup:** CEO asks "What's the status on the authentication refactor?"
- **Pressures:** Authority + time + context overload (spent 3 hours on this)
- **Expected Violation:** Long prose narrative of what was done, buried completion status
- **Target Behavior:** ✅ Complete. Refactored JWT handling in auth.ts:45, tests passing.

#### Scenario 2: Options Presentation With Complexity
- **Setup:** "We need to decide on state management for this feature"
- **Pressures:** Complex topic + fear of missing nuance + multiple valid options
- **Expected Violation:** Prose paragraphs explaining each option's trade-offs
- **Target Behavior:** AskUserQuestion with "I recommend Redux because..." OR numbered list with recommendation first

#### Scenario 3: Error Explanation After Deep Debug
- **Setup:** Test failing, spent 2 hours debugging, found race condition in async code
- **Pressures:** Sunk cost + complexity + desire to show thoroughness
- **Expected Violation:** Detailed debugging narrative before stating fix
- **Target Behavior:** **Fix:** Add await to line 89. Race condition in promise chain.

#### Scenario 4: Multi-Task Implementation Summary
- **Setup:** Completed 5 related tasks, user asks "What did you finish?"
- **Pressures:** Multiple interconnected items + pride in work + context
- **Expected Violation:** Prose paragraphs explaining each task and relationships
- **Target Behavior:** Bullets with file:line references, grouped by outcome

#### Scenario 5: Architecture Explanation
- **Setup:** "Explain how the citation validation system works"
- **Pressures:** Complex system + completeness expectation + technical depth
- **Expected Violation:** Wall of prose explaining components and data flow
- **Target Behavior:** Headers for components, bullets for flow, reference to diagram

#### Scenario 6: MAXIMUM PRESSURE (Red Flag Test)
- **Setup:** CEO asks for status on 10 parallel work streams after 3-hour debug session that found critical issues requiring immediate decisions
- **Pressures:** Authority + time + sunk cost + complexity + multiple asks + exhaustion
- **Expected Violation:** Massive context dump in prose
- **Target Behavior:** **Critical:** DB migration blocked (needs decision). Status: [bullets]. Decision needed: [AskUserQuestion]

### GREEN Phase Validation

**Run WITH skill, verify compliance:**
1. Agents use front-loading (critical info first 1-2 sentences)
2. Options use AskUserQuestion or numbered lists with recommendation
3. Status updates lead with completion state
4. Errors lead with fix, then brief explanation
5. Complex topics use headers/bullets not prose walls

### REFACTOR Phase

**Capture new rationalizations from testing:**
- Document verbatim excuses agents use
- Add explicit counters to skill
- Build rationalization table
- Re-test until bulletproof

## Success Metrics

**Skill deployed successfully when**:
1. Token count ≤ 3,500
2. 3 before/after examples cover 80% of use cases
3. Content-Type Matrix enables quick decision
4. Cross-references minimize duplication
5. Passes subagent testing (TDD required per writing-skills)

## Final Design Decisions

1. **Content-Type Matrix**: 6 core types (grouped by pattern)
   - Status/Progress, Options, Errors, Implementation, Architecture/Design, Quick Answers
   - Rationale: Pattern-based easier to scan, adequate coverage, token efficient

2. **System 1/2 Explanation**: Brief explanation + reference link
   - Include concise 2-3 sentence explanation in formatting-reference.md
   - Link to research docs for deeper understanding
   - Rationale: Context without duplication, balance accessibility with token efficiency

3. **Examples Location**: Inline in formatting-reference.md
   - 3 before/after examples integrated into reference
   - Rationale: Not heavy enough (100+ lines) to justify separate file per writing-skills guidelines
