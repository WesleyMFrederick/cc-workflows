<!-- markdownlint-disable-file MD048 -->

# Epic 1: Router Implementation - Design Document

**Date:** 2025-01-13
**Status:** Design Complete
**Requirements:** [fast-slow-skill-variants-prd.md](../../fast-slow-skill-variants-prd.md#Epic%201%20-%20Router%20Implementation) %% force-extract %%

## Overview

Implement the main SKILL.md router that presents a variant choice question using AskUserQuestion, then directs the LLM to read the appropriate variant file. The router enforces workflow with a Mermaid flowchart to ensure proper sequencing and prevent skipping steps.

**Primary Use Case:** Enable skill testers to explicitly choose between fast conversational testing (15-30 min iteration) and slow isolated testing (45-90 min deployment validation) based on their time constraints and validation needs.

## Architecture Decision

**Selected Approach:** Single AskUserQuestion with directive-based routing

**Rationale (Architecture Evaluation Results):**

| Principle Category | Compliance |
|-------------------|------------|
| Modular Design | ✅ Single responsibility: router routes, variants execute. Clean separation. |
| Data-First Design | ➖ Not applicable - process documentation, not code |
| Action-Based File Organization | ✅ Variant files named by action: `fast-conversational.md`, `slow-isolated.md` |
| Interface Design | ✅ Simplest solution: two sequential questions, clear routing |
| MVP Principles | ✅ Minimal scope: just Epic 1 router, reuses existing content |
| Deterministic Offloading | ✅ AskUserQuestion (deterministic tool) for routing decisions |
| Self-Contained Naming | ✅ File names clearly signal purpose without lookup |
| Safety-First | ➖ Not applicable - no file modifications in router |
| Anti-Patterns | ✅ No scattered checks, branch explosion, or leaky flags |

**Rejected Alternatives:**
- Monolithic SKILL.md with conditional sections: Violates separation of concerns, harder to maintain
- Router as separate skill invoking variant skills: Over-engineered, unclear context passing

## Component Design

### File Structure

```text
.claude/skills/testing-skills-with-subagents/
├── SKILL.md (router, ~100-150 lines) ← NEW/REPLACED
├── variants/                           ← NEW DIRECTORY
│   ├── fast-conversational.md (~250 lines) ← NEW (adapted from global)
│   └── slow-isolated.md (~400 lines)       ← NEW (migrated from current SKILL.md)
├── shared/                             ← NEW DIRECTORY
│   ├── pressure-scenarios.md          ← MOVED from root
│   └── rationalization-patterns.md    ← NEW (extracted from variants)
├── infrastructure-setup.md             ← EXISTING (referenced by slow variant)
├── running-tests.md                    ← EXISTING (referenced by slow variant)
├── anthropic-cli-commands-reference.md ← EXISTING
├── evals/                              ← EXISTING
└── examples/                           ← EXISTING
```

### Router SKILL.md Design

**Location:** `.claude/skills/testing-skills-with-subagents/SKILL.md`

#### Section 1: Skill Metadata and Announcement

```markdown
---
name: testing-skills-with-subagents
description: Use after writing a new skill and/or when testing existing skills, creating skill evaluations, or verifying skills work under pressure - applies TDD/RED-GREEN-REFACTOR to skill documentation by running baseline tests, measuring compliance, and closing rationalization loopholes
---

# Testing Skills With Subagents

## Overview

**Testing skills is just TDD applied to process documentation.**

Choose your testing approach based on development phase:
- **Fast variant**: Quick iteration during skill development (15-30 min)
- **Slow variant**: Rigorous validation before deployment (45-90 min)

**Announce at start:** "I'm using the testing-skills-with-subagents skill."
```

#### Section 2: Workflow Enforcement (Mermaid Flowchart)

~~~markdown
## Workflow

Follow this workflow exactly - do not skip steps:

````mermaid
graph TD
    a@{ shape: stadium, label: "Start: Announce Skill Usage" }
    b@{ shape: rect, label: "Ask Variant Question" }
    c@{ shape: diam, label: "Variant Choice?" }
    d@{ shape: rect, label: "Read variants/fast-conversational.md" }
    e@{ shape: rect, label: "Read variants/slow-isolated.md" }
    f@{ shape: stadium, label: "Execute Variant Workflow" }

    a --> b
    b --> c
    c -->|Fast| d
    c -->|Slow| e
    d --> f
    e --> f

    classDef start fill:#ccffcc
    classDef decision fill:#ffffcc
    classDef action fill:#ccccff

    a:::start
    c:::decision
    b:::action
    d:::action
    e:::action
    f:::start
````

**Design Rationale:** Mermaid flowchart provides visual enforcement of workflow sequence, preventing LLM from skipping announcement or question.

#### Section 3: Variant Question

```markdown
## Step 1: Choose Testing Variant

<critical-instruction>
Use the AskUserQuestion tool with these exact parameters:
</critical-instruction>

**Question:** "Which testing variant do you want to use?"

**Options:**
1. **"Fast: Conversational testing with control scenarios"** - 15-30 min iteration, lightweight logging, good for skill development
2. **"Slow: Worktree-based isolated testing"** - 45-90 min validation, full infrastructure, deployment-ready confidence

**Trade-offs:**

| Aspect | Fast Variant | Slow Variant |
|--------|-------------|--------------|
| Time | 15-30 min | 45-90 min |
| Infrastructure | Lightweight logs | Full worktree isolation |
| Confidence | Moderate | High (deployment-ready) |
| Best For | Iteration, hypothesis testing | Pre-deployment validation |
```

**Design Rationale:**
- Two clear options with time estimates
- Trade-off table helps user make informed choice
- No automatic routing - user has full control

#### Section 4: Routing with Critical Instructions

```markdown
## Step 2: Execute Selected Variant

<critical-instruction>
Based on the user's variant choice from Step 1:

**IF user selected "Fast: Conversational testing":**
- Read the file: [variants/fast-conversational.md](variants/fast-conversational.md)
- Follow ALL instructions in that file
- Use the context from Step 1 to inform your testing approach

**IF user selected "Slow: Worktree-based testing":**
- Read the file: [variants/slow-isolated.md](variants/slow-isolated.md)
- Follow ALL instructions in that file
- Use the context from Step 1 to inform your testing approach

Do NOT proceed without reading the selected variant file.
</critical-instruction>

## Error Handling

**If variant file doesn't exist:**
Display this error message:

```

❌ Error: Variant file not found

Expected file: variants/{variant-name}.md

This indicates incomplete skill installation. Please check:
1. File structure is correct (.claude/skills/testing-skills-with-subagents/variants/)
2. Variant files exist (fast-conversational.md, slow-isolated.md)
3. Repository is up to date

Cannot proceed without variant file.

```

**Design Rationale:**
- `<critical-instruction>` tags ensure LLM doesn't skip file read
- Context passed forward but doesn't override variant's workflow
- Clear error message for missing files (FR5 from user stories)

### Variant File Requirements

Each variant file must:
1. **Be self-contained** - Complete testing workflow from RED to REFACTOR
2. **Reference shared content** - Link to `shared/pressure-scenarios.md` and `shared/rationalization-patterns.md`
3. **Specify infrastructure** - Log/worktree creation, file organization
4. **Define success criteria** - What "passing" means for that variant

**Fast Variant (fast-conversational.md):**
- Adapted from global skill at `~/.claude/plugins/cache/superpowers/skills/testing-skills-with-subagents/SKILL.md`
- Adds lightweight logging to `.claude/skills/testing-skills-with-subagents/logs/YYYYMMDD-HHMMSS-{skill-name}/`
- Includes control scenario guidance (3:1 ratio)
- Emphasizes conversational testing approach

**Slow Variant (slow-isolated.md):**
- Migrated from current project-local SKILL.md
- Preserves worktree infrastructure
- References `infrastructure-setup.md` and `running-tests.md`
- Maintains rigorous validation approach

## Data Flow

```text
User invokes skill
       ↓
Router SKILL.md:
  - Announce skill usage
  - AskUserQuestion #1: Context → Store answer
  - AskUserQuestion #2: Variant → Store answer
  - Critical instruction: Read variant file based on choice
       ↓
LLM reads selected variant file:
  - Fast: variants/fast-conversational.md
  - Slow: variants/slow-isolated.md
       ↓
Variant executes:
  - RED phase (baseline testing)
  - GREEN phase (write skill)
  - REFACTOR phase (close loopholes)
  - References shared content as needed
       ↓
Testing complete
```
~~~

## Shared Content Design

### shared/pressure-scenarios.md

**Purpose:** Common pressure scenario patterns used by both variants

**Content Structure:**

```markdown
# Pressure Scenarios for Skill Testing

## Pressure Types Taxonomy
- Time pressure
- Sunk cost pressure
- Authority pressure
- Economic pressure
- Exhaustion pressure
- Social pressure
- Pragmatic pressure

## Template Library
[Scenario templates for common situations]

## Combining Pressures
Guidelines for 3+ pressure combinations

## Red Herring Patterns (Control Scenarios)
Templates for creating control scenarios that test understanding
```

**Migration:** Move existing `pressure-scenarios.md` to `shared/` directory

### shared/rationalization-patterns.md

**Purpose:** Common rationalization categories and counters

**Content Structure:**

```markdown
# Rationalization Patterns for Skill Testing

## Common Rationalization Categories
- "I already tested manually"
- "Tests after achieve same goals"
- "Deleting work is wasteful"
- "Being pragmatic not dogmatic"
- [Additional patterns extracted from both variants]

## Counter-Argument Templates
How to address each rationalization in skill content

## Red Flag Language Patterns
Words/phrases that signal rationalization:
- "Just this once"
- "Normally I would but..."
- "In this case it's different"

## Meta-Testing Questions
Questions to ask when evaluating test results:
- Did agent rationalize or follow skill?
- Which pressures were most effective?
- What loopholes remain?
```

**Creation:** Extract patterns from both global and project-local skills

## Migration Strategy

### Phase 1: Create Directory Structure

```bash
cd .claude/skills/testing-skills-with-subagents
mkdir -p variants shared
```

### Phase 2: Move/Create Shared Content

```bash
# Move existing pressure scenarios
mv pressure-scenarios.md shared/

# Create rationalization patterns (extract from both skills)
# [Manual creation required]
```

### Phase 3: Create Variant Files

**For slow variant:**

```bash
# Copy current SKILL.md to variants
cp SKILL.md variants/slow-isolated.md

# Update references in slow-isolated.md:
# - Change "../pressure-scenarios.md" → "../shared/pressure-scenarios.md"
# - Add reference to "../shared/rationalization-patterns.md"
# - Ensure infrastructure-setup.md and running-tests.md references work
```

**For fast variant:**

```bash
# Copy from global skill (reference implementation)
cp ~/.claude/plugins/cache/superpowers/skills/testing-skills-with-subagents/SKILL.md \
   variants/fast-conversational.md

# Adapt for project structure:
# - Add logging directory creation
# - Reference shared content files
# - Add control scenario guidance
```

### Phase 4: Create New Router

```bash
# Replace SKILL.md with new router
# [Implementation as designed above]
```

### Phase 5: Validation
- [ ] Router asks both questions in sequence
- [ ] Router directs to correct variant file
- [ ] Fast variant references shared content correctly
- [ ] Slow variant references shared content correctly
- [ ] Error message displays if variant file missing

## Testing Strategy

### Test 1: Fast Variant Selection

**Setup:** Fresh Claude Code session

**Execute:**

```text
User: "Use testing-skills-with-subagents skill"
```

**Expected Flow:**
1. Router announces skill usage
2. AskUserQuestion #1 displays context options
3. User selects "New skill (never tested before)"
4. AskUserQuestion #2 displays variant options
5. User selects "Fast: Conversational testing"
6. Router reads `variants/fast-conversational.md`
7. Fast variant workflow begins

**Verification:**
- Both questions asked in correct order
- Correct variant file read
- Fast variant workflow executes

### Test 2: Slow Variant Selection

**Setup:** Fresh Claude Code session

**Execute:**

```text
User: "Use testing-skills-with-subagents skill"
```

**Expected Flow:**
1. Router announces skill usage
2. AskUserQuestion #1 displays context options
3. User selects "Final validation (before deployment)"
4. AskUserQuestion #2 displays variant options
5. User selects "Slow: Worktree-based testing"
6. Router reads `variants/slow-isolated.md`
7. Slow variant workflow begins

**Verification:**
- Both questions asked in correct order
- Correct variant file read
- Slow variant workflow executes with worktree infrastructure

### Test 3: Missing Variant File (Error Handling)

**Setup:** Temporarily rename `variants/fast-conversational.md`

**Execute:**

```text
User selects "Fast: Conversational testing"
```

**Expected Output:**

```text
❌ Error: Variant file not found

Expected file: variants/fast-conversational.md
[Full error message as designed]
```

**Verification:**
- Clear error message displayed
- Indicates which file is missing
- Provides troubleshooting steps

## Implementation Checklist

### File Creation
- [ ] Create `variants/` directory
- [ ] Create `shared/` directory
- [ ] Move `pressure-scenarios.md` to `shared/`
- [ ] Create `shared/rationalization-patterns.md`

### Variant Files
- [ ] Create `variants/fast-conversational.md` (adapt from global)
- [ ] Create `variants/slow-isolated.md` (migrate from current SKILL.md)
- [ ] Update all shared content references
- [ ] Verify infrastructure file references work

### Router Implementation
- [ ] Replace SKILL.md with new router design
- [ ] Add workflow Mermaid flowchart
- [ ] Implement Step 1 (context question)
- [ ] Implement Step 2 (variant question)
- [ ] Implement Step 3 (routing with critical instructions)
- [ ] Add error handling for missing variant files

### Testing
- [ ] Run Test 1: Fast variant selection
- [ ] Run Test 2: Slow variant selection
- [ ] Run Test 3: Error handling for missing file
- [ ] Verify shared content links work in both variants

### Documentation
- [ ] Update PRD with link to this design document
- [ ] Document migration from old structure

## Success Criteria

1. **Router Implementation (User Story 1.1)**
   - Router announces skill usage before questions ✅ US1-1AC1
   - Context question with 4 options presented ✅ US1-1AC2
   - Variant question with 2 options presented after context ✅ US1-1AC3
   - Selected variant file content is read and followed ✅ US1-1AC4
   - Clear error if variant file missing ✅ US1-1AC5

2. **Directory Structure (User Story 1.2)**
   - `variants/` directory exists with variant files ✅ US1-2AC1
   - `shared/` directory exists with common content ✅ US1-2AC2
   - Structure supports adding new variants easily ✅ US1-2AC3

3. **Architecture Compliance**
   - Follows Action-Based File Organization (NFR1)
   - Router is transparent about variant choice (NFR2)
   - Enables easy addition of new variants (NFR7)
   - Error messages indicate which variant is executing (NFR8)

4. **No Breaking Changes**
   - Existing evals/ examples/ remain unchanged
   - infrastructure-setup.md and running-tests.md work as before
   - Slow variant preserves all existing functionality

## References

- **Requirements:** [fast-slow-skill-variants-prd.md](../../fast-slow-skill-variants-prd.md)
- **Architecture Principles:** [ARCHITECTURE-PRINCIPLES.md](../../../../../ARCHITECTURE-PRINCIPLES.md)
- **Reference Skills:**
  - [brainstorming](../../../.claude/skills/brainstorming/SKILL.md) - Mermaid flowchart pattern
  - [test-driven-development](../../../.claude/skills/test-driven-development/SKILL.md) - TDD cycle foundation
- **Global Skill Reference:** `~/.claude/plugins/cache/superpowers/skills/testing-skills-with-subagents/SKILL.md`
