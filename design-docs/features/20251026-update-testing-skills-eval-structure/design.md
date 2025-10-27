# Update testing-skills-with-subagents: Eval Structure and cco Sandbox Testing

**Date**: 2025-10-26
**Status**: Design Complete
**Target Skill**: `.claude/skills/testing-skills-with-subagents/SKILL.md`

> [!attention] **Required skills**
> You must use the skills below to implement this plan
> - `testing-skills-with-subagents` - use this skill first to set up the tests
> - `writing-skills` - use this skill to update `.claude/skills/testing-skills-with-subagents/SKILL.md` when a test does not pass

## Overview

Update the `testing-skills-with-subagents` skill to prescribe the standardized eval folder structure developed in the `writing-agent-files` skill, eliminate test contamination through proper prompt isolation, and integrate cco sandbox testing with worktree requirements.

## Problem Statement

The current `testing-skills-with-subagents` skill lacks:
1. **Prescriptive eval structure** - No mandatory folder structure for organizing test scenarios
2. **Prompt isolation guidance** - Previous approach passed entire scenario file, contaminating tests
3. **Sandbox testing documentation** - Missing cco reference and worktree requirements
4. **Log management** - No specification for .jsonl log storage

## Design Decisions

### 1. Mandatory Eval Folder Structure

**Decision**: Prescribe (not just recommend) the eval folder structure as a mandatory checklist item.

**Structure**:

```text
skills/skill-name/
  SKILL.md
  evals/
    README.md
    scenario-1-descriptive-name/
      scenario.md
      logs/
        baseline-YYYY-MM-DD.jsonl
        green-YYYY-MM-DD.jsonl
    scenario-2-another-test/
      scenario.md
      logs/
```

**Rationale**:
- Single `scenario.md` file contains both baseline and green test metadata
- Orchestrating agent reads scenario.md, extracts instructions, runs both baseline and green
- Separate `logs/` folder per scenario for all test iterations
- `.jsonl` format only for cco stream-json output

### 2. Scenario File Format

**Structure**:

```markdown
# Scenario N: Descriptive Name

**Test objective**: What violation/behavior are you testing for?

## Instructions for Sub-Agent

[ONLY this section gets passed to subagents]

IMPORTANT: This is a real scenario. You must choose and act.

[Pressure scenario details]

## Baseline Test (RED)

**Expected violations**: ...
**What to capture**: ...

## Green Test (GREEN)

**Expected compliance**: ...
**What to capture**: ...
```

**Critical**: Orchestrating agent extracts ONLY "## Instructions for Sub-Agent" content and passes it to cco. Never tell the subagent to read and extract.

### 3. Prompt Isolation Pattern

**Previous (contaminated)**:

```bash
cco --print "Read the file scenario.md, extract the Instructions section..."
```

❌ Subagent sees metadata, knows it's being tested

**New (isolated)**:

```bash
# Orchestrating agent extracts instructions first
cco --print "{{extracted instructions only}}"
```

✅ Subagent only sees the pure pressure scenario

### 4. Worktree + cco Sandbox Testing

**Mandatory workflow**:
1. Create test worktree using `using-git-worktrees` skill
2. Change to worktree directory
3. Run cco commands from worktree
4. Save logs to scenario/logs/ folder

**Command template**:

```bash
cd /path/to/worktree
cco --output-format stream-json --verbose --print "{{extracted instructions}}" | tee skills/skill-name/evals/scenario-N/logs/baseline-YYYY-MM-DD.jsonl
```

**For green tests, append**:

```text
IMPORTANT: You have access to the `skill-name` skill. Use it.
```

### 5. Reference Documentation

**Add to skill directory**:
- `cco-sandbox-reference.md`: Full cco documentation
- `anthropic-cli-commands-reference.md`: Claude CLI reference

**Source files** (copy from):
- `/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/.worktrees/test-writing-agent-files/.claude/skills/writing-agent-files/cco-sandbox-reference.md`
- `/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/.worktrees/test-writing-agent-files/.claude/skills/writing-agent-files/anthropic-cli-commands-reference.md`

## Implementation Changes

### New Sections to Add

1. **"Eval Folder Structure"** (after "TDD Mapping for Skill Testing")
   - Prescribe mandatory structure
   - Document rationale

2. **"Scenario File Format"**
   - Single scenario.md file structure
   - Instructions extraction requirement
   - Baseline vs Green sections

3. **"Running Tests with cco Sandbox"**
   - Worktree requirement
   - Command templates with {{placeholders}}
   - Prompt isolation critical rule
   - Reference documentation links

4. **"Testing Checklist (TDD for Skills)"** (update existing)
   - Add setup checklist items (worktree, eval folders, logs/)
   - Add extraction steps (read scenario.md, extract instructions)
   - Add cco command steps (change to worktree, run cco, save logs)
   - Emphasize orchestrating agent workflow

### Existing Sections to Update

- **"Testing Checklist"**: Expand with new mandatory steps
- Keep all existing TDD mapping and pressure scenario content intact

## Success Criteria

- [ ] Orchestrating agent knows to create eval folder structure
- [ ] Orchestrating agent extracts instructions (not tells subagent to extract)
- [ ] Orchestrating agent changes to worktree before running cco
- [ ] Orchestrating agent saves .jsonl logs to correct location
- [ ] Reference documentation accessible for cco command syntax
- [ ] All existing TDD content preserved

## Files Modified

- `.claude/skills/testing-skills-with-subagents/SKILL.md`

## Files Added

- `.claude/skills/testing-skills-with-subagents/cco-sandbox-reference.md`
- `.claude/skills/testing-skills-with-subagents/anthropic-cli-commands-reference.md`

## Non-Goals

- Not creating example evals/ for testing-skills-with-subagents itself
- Not changing TDD mapping or pressure scenario content
- Not modifying writing-skills skill (that's already correct)

---

## Testing Progress: testing-skills-with-subagents Skill

**Date Started**: 2025-10-26
**Current Status**: In Progress - Baseline tests running

### Test Scenarios Created

#### Scenario 1: Eval Folder Structure Compliance
- **Location**: `.claude/skills/testing-skills-with-subagents/evals/scenario-1-eval-structure/`
- **Test Objective**: Verify agent creates mandatory eval folder structure (evals/scenario-X-descriptive/scenario.md + logs/)
- **Baseline Status**: ⚠️ NEEDS RE-RUN (current log is actually GREEN behavior)
- **Green Status**: ✅ CAPTURED in baseline-2025-10-26.jsonl (agent followed skill)
- **Files**:
  - `scenario.md` ✅ Created
  - `logs/baseline-2025-10-26.jsonl` ⚠️ Actually contains GREEN behavior (needs rename)
  - `logs/green-2025-10-26.jsonl` ❌ Not yet created

**Baseline Results** (mislabeled as baseline, actually GREEN):
- ✅ Agent used `using-superpowers` skill
- ✅ Agent found and used `testing-skills-with-subagents` skill
- ✅ Agent created TodoWrite list from checklist
- ✅ Agent created proper eval folder structure (evals/scenario-1-exhaustion-deadline-sunk-cost/)
- ✅ Agent created scenario.md with correct format
- ✅ Agent created logs/ folder

**What we need**:
- TRUE baseline (RED): Agent WITHOUT access to testing-skills-with-subagents skill
- Rename current baseline-2025-10-26.jsonl to green-2025-10-26.jsonl

---

#### Scenario 2: RED Phase Enforcement (Baseline-First Testing)
- **Location**: `.claude/skills/testing-skills-with-subagents/evals/scenario-2-baseline-first/`
- **Test Objective**: Verify agent runs baseline WITHOUT skill before writing/editing, even under time pressure
- **Baseline Status**: ❌ Not yet run
- **Green Status**: ❌ Not yet run
- **Files**:
  - `scenario.md` ✅ Created
  - `logs/` ✅ Folder created, empty

---

#### Scenario 3: Git Worktree + cco Sandbox Usage
- **Location**: `.claude/skills/testing-skills-with-subagents/evals/scenario-3-worktree-cco-usage/`
- **Test Objective**: Verify agent creates git worktree for isolation and uses proper cco commands
- **Baseline Status**: ❌ Not yet run
- **Green Status**: ❌ Not yet run
- **Files**:
  - `scenario.md` ✅ Created
  - `logs/` ✅ Folder created, empty

**Expected baseline violations**:
- Agent runs test in main working directory (no isolation)
- Agent uses incorrect cco commands or omits required flags
- Agent doesn't capture logs properly

**Expected green compliance**:
- Agent creates git worktree for test isolation
- Agent uses correct cco command: `cco --output-format stream-json --verbose --print "..."`
- Logs saved with correct naming convention

---

#### Scenario 4: Pressure Scenario Quality (3+ Combined Pressures)
- **Location**: `.claude/skills/testing-skills-with-subagents/evals/scenario-4-pressure-quality/`
- **Test Objective**: Verify agent creates realistic pressure scenarios with 3+ combined pressures, not academic questions
- **Baseline Status**: ❌ Not yet run
- **Green Status**: ❌ Not yet run
- **Files**:
  - `scenario.md` ✅ Created
  - `logs/` ✅ Folder created, empty

---

### Implementation Checklist

#### Setup
- [x] Create eval folder structure for 4 scenarios
- [x] Write scenario-1-eval-structure baseline and green scenario files
- [x] Write scenario-2-baseline-first baseline and green scenario files
- [x] Write scenario-3-worktree-cco-usage baseline and green scenario files
- [x] Write scenario-4-pressure-quality baseline and green scenario files

#### RED Phase - Baseline Tests
- [⚠️] Run baseline test for scenario 1 (eval structure) - NEEDS RE-RUN without skill
- [ ] Run baseline test for scenario 2 (baseline-first)
- [ ] Run baseline test for scenario 3 (worktree-cco)
- [ ] Run baseline test for scenario 4 (pressure-quality)
- [ ] Document failures and rationalizations from all baseline tests

#### GREEN Phase - Tests With Skill
- [✅] Run green test for scenario 1 (with skill) - Already captured in misnamed baseline log
- [ ] Run green test for scenario 2 (with skill)
- [ ] Run green test for scenario 3 (with skill)
- [ ] Run green test for scenario 4 (with skill)

#### Analysis & REFACTOR
- [ ] Verify compliance for all 4 tests and document results
- [ ] Create analysis document comparing baseline vs green behavior
- [ ] REFACTOR: Add counters to SKILL.md if loopholes found

---

### Key Findings So Far

**Important Discovery**: The first "baseline" test actually captured GREEN behavior because the `testing-skills-with-subagents` skill was available in the agent's environment (loaded via SessionStart hook).

**What this means**:
- We successfully validated that agents DO follow the skill when it's available
- We still need true baseline (RED) tests where the skill is NOT available
- Current baseline-2025-10-26.jsonl should be renamed to green-2025-10-26.jsonl

**Next Actions**:
1. Rename baseline-2025-10-26.jsonl → green-2025-10-26.jsonl
2. Run true baseline with instruction: "Do NOT use any skills related to testing skills"
3. Continue with remaining scenarios

---

### Fixture Worktree Approach (VALIDATED 2025-10-26)

**Problem**: Initial approach tried using directive "Do NOT use skills" in prompt, but SessionStart hook still loads skills into agent environment, allowing rationalization around the directive.

**Solution**: Use separate fixture worktrees where skills are physically removed from the filesystem.

#### Validated Approach

**Create two fixture worktrees**:

1. **Baseline fixture** (RED tests):

   ```bash
   git worktree add .worktrees/scenario1-baseline -b test/scenario1-baseline
   rm -rf .worktrees/scenario1-baseline/.claude/skills/testing-skills-with-subagents
   ```

2. **Green fixture** (GREEN tests):

   ```bash
   git worktree add .worktrees/scenario1-green -b test/scenario1-green
   # Skills remain intact
   ```

**Run tests from fixtures**:

```bash
# Baseline (from baseline fixture - skill physically absent)
cd .worktrees/scenario1-baseline
cco --output-format stream-json --verbose < /tmp/prompt.txt > /tmp/baseline.jsonl 2>&1

# Green (from green fixture - skill present)
cd .worktrees/scenario1-green
cco --output-format stream-json --verbose < /tmp/prompt.txt > /tmp/green.jsonl 2>&1
```

**Validation Results**:
- ✅ Baseline fixture shows skill NOT in SessionStart hook skills list
- ✅ Green fixture shows skill IS in SessionStart hook skills list
- ✅ Physical removal guarantees unavailability (no rationalization possible)
- ✅ Clean separation between RED and GREEN environments

**Benefits over directive approach**:
1. **Guaranteed unavailability** - Skill literally doesn't exist in baseline fixture
2. **No rationalization** - Agent can't access what doesn't exist
3. **Clean RED/GREEN separation** - Each fixture is isolated
4. **Reusable** - Same fixtures for all test iterations

**Fixture worktrees created**:
- `.worktrees/scenario1-baseline` (branch: test/scenario1-baseline) - Skills removed
- `.worktrees/scenario1-green` (branch: test/scenario1-green) - Skills intact

This approach will be documented in the `testing-skills-with-subagents` skill update.
