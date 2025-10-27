# Split testing-skills-with-subagents: Progressive Disclosure Pattern

**Date**: 2025-10-27
**Status**: Design Phase
**Target Skill**: `.claude/skills/testing-skills-with-subagents/SKILL.md`
**Feature Branch**: `split-testing-skills-progressive-disclosure`

> [!attention] **Required skills**
> You must use the skills below to implement this plan
> - `testing-skills-with-subagents` - use this skill to create and run all evaluation scenarios
> - `writing-skills` - use this skill for the TDD approach to splitting the skill

## Overview

Split the `testing-skills-with-subagents` skill from 784 lines into 4 files following Anthropic's progressive disclosure pattern to achieve optimal performance (target: <500 lines for SKILL.md). SKILL.md becomes a navigation hub pointing to detailed reference files.

## Problem Statement

The current `testing-skills-with-subagents` skill violates Anthropic's best practices:
1. **Size**: 784 lines exceeds the 500-line optimal performance target (line 241 of anthropic-best-practices.md)
2. **Structure**: All content in single file instead of progressive disclosure pattern
3. **Token efficiency**: Heavy infrastructure content loads even when only conceptual guidance is needed
4. **Discovery risk**: May not be selected when needed due to description field optimization opportunities

## Design Decisions

### 1. Progressive Disclosure Split (Approach #1, p=0.40)

**Decision**: Split into 4 files following Anthropic's recommended pattern (SKILL.md as navigation hub).

**File structure**:

```text
testing-skills-with-subagents/
├── SKILL.md (~300 lines)
│   - Frontmatter + description (optimized for discovery)
│   - Overview: TDD for documentation principle
│   - TDD mapping table
│   - When to use
│   - Quick reference: RED-GREEN-REFACTOR summary
│   - Process overview (high-level steps)
│   - Common mistakes, bulletproofing strategies
│   - Points to reference files
│
├── infrastructure-setup.md (~160 lines)
│   - Eval folder structure
│   - Scenario file format
│   - Fixture worktree setup
│   - Cleanup procedures
│
├── running-tests.md (~210 lines)
│   - Extracting instructions to prompt files
│   - Copying prompts to worktrees
│   - Baseline test commands (RED)
│   - Green test commands (GREEN)
│   - Monitoring test execution
│   - Prompt isolation techniques
│
└── pressure-scenarios.md (~70 lines)
    - Writing pressure scenarios
    - Pressure types table
    - Key elements of good scenarios
    - Testing setup
```

**Rationale**:
- Matches Anthropic guidance exactly (line 236-268 of anthropic-best-practices.md)
- SKILL.md stays well under 500 lines for optimal performance
- Infrastructure details load only when setting up tests
- Natural organization: concepts vs. execution mechanics

### 2. Description Optimization for Discovery

**Current description**:

```yaml
description: Use when creating or editing skills, before deployment, to verify they work under pressure and resist rationalization - applies RED-GREEN-REFACTOR cycle to process documentation by running baseline without skill, writing to address failures, iterating to close loopholes
```

**Proposed optimization**:

```yaml
description: Use after writing a new skill and/or when testing existing skills, creating skill evaluations, or verifying skills work under pressure - applies TDD/RED-GREEN-REFACTOR to skill documentation by running baseline tests, measuring compliance, and closing rationalization loopholes
```

**Changes**:
- Add "testing skills with subagents" trigger phrase (exact match for common queries)
- Add "creating skill evaluations" trigger
- Add "verifying skills" trigger
- Keep RED-GREEN-REFACTOR (established pattern)
- Keep "pressure" and "rationalization" keywords

**Rationale**: Anthropic guidance emphasizes that description is critical for discovery from "potentially 100+ available Skills" (line 199). Current description uses passive voice and complex structure. New version adds direct trigger phrases while staying under 1024 char limit.

### 3. Table of Contents for Reference Files

**Decision**: Add TOC to `./running-tests.md` (>100 lines per Anthropic guidance line 383-406).

**Example**:

```markdown
# Running Tests with cco Sandbox

## Contents
- Extracting instructions to prompt files
- Copying prompts to worktrees
- Baseline test commands (RED)
- Green test commands (GREEN)
- Monitoring test execution
- Prompt isolation techniques
- Cleanup procedures

## Extracting Instructions to Prompt Files
...
```

**Rationale**: Anthropic guidance requires TOC for files >100 lines to enable preview reads and navigation.

## Implementation Plan (TDD Approach)

### Phase 1: Create Feature Branch

**Actions**:
1. Create branch from current branch: `git checkout -b split-testing-skills-progressive-disclosure`
2. Verify clean working directory
3. Push branch to remote (if configured)

### Phase 2: Write Evaluation Scenario First (RED)

Following TDD principle: write tests BEFORE implementation.

#### Scenario 5: Integrated Discovery, Navigation & Loading Test

**Objective**: Verify (1) skill discovery from description, (2) progressive navigation to reference files, and (3) minimal context loading in single test run.

**Evaluation approach**: Bundled - capture 3 metrics from one subagent execution (saves ~45 minutes vs. separate scenarios).

**Test design**:

```markdown
# Scenario 5: Integrated Discovery, Navigation & Loading Test

**Test objective**: Verify skill discovery, progressive navigation, and minimal loading in single test run.

**Evaluation criteria**: 3 metrics from one subagent execution

## Instructions for Sub-Agent

IMPORTANT: This is a real scenario. You must choose and act.

Your human partner says:

"I just finished writing a new debugging skill. I want to make sure it actually works when agents are under pressure - like when they're tired or facing deadlines. Can you explain:
1. How to set up the test infrastructure (worktrees, fixtures, etc.)
2. What types of pressure I should combine in test scenarios?"

## Baseline Test (RED)

### Criterion 1: Discovery
**Expected violations**: Skill not discovered via current description
**What to capture**:
- SessionStart hook output - which skills are listed?
- Does agent discover testing-skills-with-subagents?
- What approach does agent suggest?
- Does agent load `SKILL.md`?

### Criterion 2: Navigation (N/A - single file baseline)
**Baseline behavior**: All content in one SKILL.md file (784 lines)
**What to capture**:
- Read tool call: full `SKILL.md`
- All content loaded together (no selective loading possible)
- Baseline token usage

### Criterion 3: Minimal Loading (N/A - single file baseline)
**Baseline behavior**: All content loaded together
**What to capture**: Infrastructure content loaded when only conceptual guidance needed

**Stop condition**: After agent provides full explanation (~60 seconds)

## Green Test (GREEN)

### Criterion 1: Discovery ✅
**Expected compliance**: Skill discovered and used
**What to capture**:
- Skill appears in SessionStart hook
- Agent loads `SKILL.md`
- Agent cites testing-skills-with-subagents explicitly

### Criterion 2: Navigation ✅
**Expected compliance**: Progressive disclosure works
**What to capture**:
- Read sequence: `SKILL.md` → `infrastructure-setup.md` → `pressure-scenarios.md`
- Correct files loaded for both infrastructure AND pressure questions
- Agent navigates to multiple reference files

### Criterion 3: Minimal Loading ✅
**Expected compliance**: Only needed files loaded
**What to capture**:
- Does NOT read `running-tests.md` (not needed for this query)
- Token efficiency vs baseline
- Selective file loading demonstrated

**Stop condition**: After agent provides full explanation (~60 seconds)

## Pass Criteria

**All 3 criteria must pass**:
- [ ] Discovery: Skill found in SessionStart AND used by agent
- [ ] Navigation: Reads SKILL.md → 2+ reference files correctly
- [ ] Minimal Loading: Does NOT over-read (running-tests.md should be skipped)
```

**Run approach**:
- Single 60-second monitoring window
- Check SessionStart hook for discovery
- Track Read tool calls for navigation and loading patterns
- Evaluate all 3 criteria from one log file
- **Time savings**: 6 runs (S5+S6+S7 baseline+green) → 2 runs = ~45 min saved

### Phase 3: Create Eval Structure

**Actions**:
1. Create single scenario folder following mandatory structure:

   ```bash
   mkdir -p .claude/skills/testing-skills-with-subagents/evals/scenario-5-integrated-discovery-navigation-loading/logs
   ```

2. Write scenario.md file with integrated test design (from Phase 2)
3. Extract instructions to baseline-prompt.md and green-prompt.md

**Folder structure**:

```text
evals/
  scenario-5-integrated-discovery-navigation-loading/
    scenario.md              # All 3 evaluation criteria
    baseline-prompt.md       # Single prompt for baseline
    green-prompt.md         # Single prompt for green
    logs/
      baseline-2025-10-27.jsonl
      green-2025-10-27.jsonl
```

### Phase 4: Run Baseline Test (RED - Watch It Fail)

**Single integrated baseline test capturing all 3 metrics.**

**Setup**:

```bash
# Baseline: Current skill with unoptimized description
cd /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows

# Create baseline fixture worktree
git worktree add .worktrees/scenario-5-baseline -b test/scenario-5-baseline

# Copy baseline prompt
cp .claude/skills/testing-skills-with-subagents/evals/scenario-5-integrated-discovery-navigation-loading/baseline-prompt.md \
   .worktrees/scenario-5-baseline/
```

**Run**:

```bash
cd .worktrees/scenario-5-baseline
cco --output-format stream-json --verbose baseline-prompt.md 2>&1 | \
  tee /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/.claude/skills/testing-skills-with-subagents/evals/scenario-5-integrated-discovery-navigation-loading/logs/baseline-2025-10-27.jsonl &

# Monitor for 60 seconds (longer to capture full response)
sleep 20
# Check output with BashOutput
sleep 20
# Continue monitoring
sleep 20
```

**Capture from ONE test run**:

**Criterion 1 - Discovery**:
- SessionStart hook: Which skills are listed?
- Does agent discover testing-skills-with-subagents?
- What approach does agent suggest?
- Does agent load SKILL.md?

**Criterion 2 - Navigation** (baseline = N/A, single file):
- Read tool calls: full SKILL.md (784 lines)
- All content loaded together (no selective loading possible)
- Baseline token usage

**Criterion 3 - Minimal Loading** (baseline = N/A, single file):
- Infrastructure content loaded even when only conceptual guidance needed
- Everything in one file

### Phase 5: Document Baseline Failures

**Actions**:
1. Review single baseline test log
2. Document specific failures for each criterion:
   - **Discovery**: Description doesn't trigger discovery? Exact SessionStart output?
   - **Navigation**: Full file read? Token count? Lines read?
   - **Loading**: Infrastructure content loaded when not needed?
3. Update scenario.md with verbatim observations from the integrated test
4. Identify patterns across all 3 metrics

### Phase 6: Split Skill (GREEN - Make It Pass)

**Actions**:
1. Create 4 new files following progressive disclosure pattern
2. Extract content from SKILL.md:
   - SKILL.md: lines 1-46, 417-450, 532-682 + navigation
   - infrastructure-setup.md: lines 48-203
   - running-tests.md: lines 204-416 + TOC
   - pressure-scenarios.md: lines 459-531
3. Add cross-references in SKILL.md:

   ```markdown
   **Fixture setup**: See [infrastructure-setup.md](infrastructure-setup.md)
   **Running tests**: See [running-tests.md](running-tests.md)
   **Pressure scenarios**: See [pressure-scenarios.md](pressure-scenarios.md)
   ```

4. Optimize description field based on S5 baseline findings
5. Verify SKILL.md < 500 lines

### Phase 7: Run Green Test (VERIFY GREEN)

**Single integrated green test capturing all 3 metrics.**

**Setup**:

```bash
# Green: Split skill with optimized description
cd /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows

# Create green fixture worktree
git worktree add .worktrees/scenario-5-green -b test/scenario-5-green

# Copy green prompt
cp .claude/skills/testing-skills-with-subagents/evals/scenario-5-integrated-discovery-navigation-loading/green-prompt.md \
   .worktrees/scenario-5-green/
```

**Run**:

```bash
cd .worktrees/scenario-5-green
cco --output-format stream-json --verbose green-prompt.md 2>&1 | \
  tee /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/.claude/skills/testing-skills-with-subagents/evals/scenario-5-integrated-discovery-navigation-loading/logs/green-2025-10-27.jsonl &

# Monitor for 60 seconds
sleep 20
# Check output with BashOutput
sleep 20
# Continue monitoring
sleep 20
```

**Success criteria from ONE test run**:

**Criterion 1 - Discovery ✅**:
- Skill appears in SessionStart hook
- Agent discovers and loads SKILL.md
- Agent cites testing-skills-with-subagents explicitly

**Criterion 2 - Navigation ✅**:
- Read sequence: SKILL.md → infrastructure-setup.md → pressure-scenarios.md
- Correct files loaded for both infrastructure AND pressure questions
- Progressive disclosure works

**Criterion 3 - Minimal Loading ✅**:
- Does NOT read running-tests.md (not needed for this query)
- Token efficiency vs baseline demonstrated
- Selective file loading confirmed

### Phase 8: REFACTOR - Close Loopholes

**If any criterion fails in integrated test:**

1. **Discovery fails (Criterion 1)**:
   - Refine description field further
   - Add missing trigger keywords
   - Re-test green
   - Document changes in scenario.md

2. **Navigation fails (Criterion 2)**:
   - Make cross-references more prominent in SKILL.md
   - Add navigation section to SKILL.md overview
   - Verify reference links work
   - Re-test green

3. **Minimal Loading fails (Criterion 3)**:
   - Review SKILL.md content - is it too sparse?
   - Check if pressure info should be inline in SKILL.md
   - Adjust split boundaries
   - Re-test green

**Iterate until all 3 criteria pass in the integrated test.**

### Phase 9: Re-Run Existing Critical Scenarios

**Must re-run** (affected by split):

#### Scenario 0: Worktree Workflow

**Why**: Worktree setup moved to infrastructure-setup.md

**Run**:

```bash
# Baseline already exists (not affected by split)
# Only run GREEN test with new split

cd .worktrees/scenario-0-green
cco --output-format stream-json --verbose green-prompt.md 2>&1 | \
  tee /path/to/logs/scenario-0-green-2025-10-27.jsonl
```

**Success criteria**: Agent navigates to infrastructure-setup.md successfully

#### Scenario 1: Eval Structure

**Why**: Eval folder structure moved to infrastructure-setup.md

**Run**: Green test only (baseline unaffected)

**Success criteria**: Agent finds structure in infrastructure-setup.md

#### Scenario 3: Git Worktree + cco

**Why**: Both infrastructure and commands split across files

**Run**: Green test only

**Success criteria**: Agent navigates to both infrastructure-setup.md and running-tests.md

### Phase 10: Final Cleanup

**Actions**:
1. Remove all fixture worktrees:

   ```bash
   cd /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows
   git worktree remove --force .worktrees/scenario-5-baseline
   git worktree remove --force .worktrees/scenario-5-green
   git worktree remove --force .worktrees/scenario-6-baseline
   git worktree remove --force .worktrees/scenario-6-green
   git worktree remove --force .worktrees/scenario-7-baseline
   git worktree remove --force .worktrees/scenario-7-green
   # Plus scenarios 0, 1, 3 if re-run
   ```

2. Delete fixture branches:

   ```bash
   git branch -D test/scenario-5-baseline test/scenario-5-green
   git branch -D test/scenario-6-baseline test/scenario-6-green
   git branch -D test/scenario-7-baseline test/scenario-7-green
   # Plus scenarios 0, 1, 3 if re-run
   ```

3. Verify logs persist:

   ```bash
   ls .claude/skills/testing-skills-with-subagents/evals/scenario-*/logs/
   ```

4. Commit changes:

   ```bash
   git add .claude/skills/testing-skills-with-subagents/
   git commit -m "feat(skills): split testing-skills-with-subagents using progressive disclosure pattern

   - Split SKILL.md (784 lines) into 4 files following Anthropic best practices
   - SKILL.md now <500 lines (optimal performance target)
   - Extract infrastructure to infrastructure-setup.md
   - Extract execution to running-tests.md
   - Extract scenarios to pressure-scenarios.md
   - Optimize description for discovery
   - Add TOC to running-tests.md
   - Verify with 3 new scenarios + 3 re-run scenarios
   - All tests pass: discovery, navigation, minimal loading"
   ```

## Success Criteria

**Must achieve ALL**:

1. **Size**: SKILL.md < 500 lines (optimal performance)
2. **Discovery**: Scenario 5 passes - skill discovered from description
3. **Navigation**: Scenario 6 passes - correct file sequence
4. **Efficiency**: Scenario 7 passes - minimal loading verified
5. **Backwards compatibility**: Scenarios 0, 1, 3 still pass with split
6. **Structure**: All files have clear cross-references
7. **TOC**: running-tests.md has table of contents
8. **Logs**: All test logs persist and are properly named

## Estimated Time Investment

- Phase 1 (Branch): 5 minutes
- Phase 2 (Write evals): 45 minutes
- Phase 3 (Eval structure): 15 minutes
- Phase 4 (Baseline tests): 90 seconds runtime + 30 min analysis
- Phase 5 (Document): 20 minutes
- Phase 6 (Split skill): 60 minutes
- Phase 7 (Green tests): 90 seconds runtime + 30 min analysis
- Phase 8 (Refactor): 0-60 minutes (if needed)
- Phase 9 (Re-run): 90 seconds runtime + 20 min analysis
- Phase 10 (Cleanup): 10 minutes

**Total**: 4-5 hours (assuming 1-2 refactor cycles)

## References

- Anthropic Best Practices: `.claude/skills/writing-skills/anthropic-best-practices.md`
- Writing Skills: `.claude/skills/writing-skills/SKILL.md`
- Testing Skills: `.claude/skills/testing-skills-with-subagents/SKILL.md`
- Previous Split Analysis: Session context (5 approaches, p-values)

## Notes

- Follow TDD religiously: tests before implementation
- Monitor token usage in logs to verify efficiency gains
- Discovery optimization is critical - affects all future skill usage
- Progressive disclosure validated through actual agent behavior, not assumptions
