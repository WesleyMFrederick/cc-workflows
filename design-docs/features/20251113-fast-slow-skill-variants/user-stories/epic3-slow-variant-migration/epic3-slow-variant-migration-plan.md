# Epic 3: Slow Variant Migration - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate slow variant to Policy/Mechanism separation with single worktree + --deny-path flag approach.

**Architecture:** Extract pure execution mechanics into `infrastructure/running-isolated-tests.md` (mechanism), update `variants/slow-isolated.md` to focus on policy enforcement and delegate to mechanism file. Replace two-worktree approach with single worktree per scenario using --deny-path flag for baseline isolation.

**Tech Stack:** Markdown documentation, Git worktrees, Claude CLI with --deny-path flag, Bash scripting

**Execution Context:** This plan assumes execution from within an implementation worktree (e.g., `.worktrees/feature/skill-testing-fast-slow-variants-worktree`). Test worktrees are created directly from the implementation worktree using `git worktree add .worktrees/testing-skills/scenario-N`, which automatically creates them based on the current implementation branch. All updated skill files are available in test worktrees via git checkout.

---

## Task 1 - Create Mechanism Reference File

### Files
- `.claude/skills/testing-skills-with-subagents/infrastructure/running-isolated-tests.md` (CREATE)

### Step 1: Create infrastructure directory

```bash
mkdir -p .claude/skills/testing-skills-with-subagents/infrastructure
```

### Step 2: Write mechanism reference file

Extract from current `infrastructure-setup.md` (lines 6-39, 41-95, 97-160) and `running-tests.md` (lines 17-90), updating for single-worktree approach:

```markdown
# Running Isolated Tests (MECHANISM)

## Overview
Execute skill tests in isolated worktrees using --deny-path for access control.

## Eval Directory Structure

Standard structure for organizing test scenarios:

```text
.claude/skills/{tested-skill}/
└── evals/
    └── scenario-N-{name}/
        ├── scenario.md              # Test metadata and instructions
        ├── baseline-prompt.md       # Extracted instructions WITHOUT skill directive
        ├── green-prompt.md          # Extracted instructions WITH skill directive
        └── logs/
            ├── baseline.jsonl       # RED phase output
            ├── green.jsonl          # GREEN phase output
            └── refactor-1.jsonl     # REFACTOR iteration outputs (if needed)
```

**Key elements:**
- One scenario.md per test contains metadata
- Two prompt files (baseline WITHOUT skill, green WITH skill)
- logs/ folder for test iterations (.jsonl format)
- Name scenarios descriptively (scenario-N-descriptive-name)

## Scenario File Format

Structure each scenario.md file:

```markdown
# Scenario N: Descriptive Name

**Test objective**: What violation/behavior are you testing?

## Instructions for Sub-Agent

[ONLY this section passes to subagents]

IMPORTANT: This is a real scenario. You must choose and act.

[Pressure scenario details]

## Baseline Test (RED)

**Expected violations**: ...
**What to capture**: ...

## Green Test (GREEN)

**Expected compliance**: ...
**What to capture**: ...
```

**CRITICAL:** Extract "## Instructions for Sub-Agent" section to create TWO files:
1. `baseline-prompt.md` - Instructions WITHOUT skill directive
2. `green-prompt.md` - Instructions WITH "**CRITICAL INSTRUCTION**: Use `skill-name` skill" line

## Logging (Slow Variant)

**Log location pattern:** `.claude/skills/{tested-skill}/evals/scenario-N-{name}/logs/`

**Determining tested skill:**
- Read context from conversation: "testing the test-driven-development skill" → `{tested-skill}` = `test-driven-development`
- If unclear, ask user which skill is being tested
- Use skill directory name exactly as it appears in `.claude/skills/`

**What to capture:**
- Full Claude output (stdout + stderr)
- Skill access attempts and permission errors (baseline)
- Skill loading confirmation via SessionStart hook (green)
- Agent compliance or rationalization patterns
- Error messages and exit codes

**How to create logs:**
- Determine tested skill name from context
- Create eval directory: `mkdir -p .claude/skills/{tested-skill}/evals/scenario-N-{name}/logs/`
- Use absolute paths so logs persist after worktree cleanup
- Write to `.jsonl` format for stream-json output compatibility

## Worktree Setup

**Execution Context:** These commands run from an implementation worktree (e.g., `.worktrees/feature-branch-worktree`). Test worktrees are created as nested worktrees within the implementation worktree.

### Creating Test Worktree

**Simple approach:** From implementation worktree, create test worktree directly

```bash
# From implementation worktree, create test worktree
# Git automatically creates branch based on current implementation branch
git worktree add .worktrees/testing-skills-with-subagents/scenario-0-single-worktree-verification

# Verify creation
git worktree list
```

**Benefits:**
- Test worktree inherits all commits from implementation branch (has updated skills)
- Simple command - no branch name needed
- Sandbox automatically detects nested worktree

### Copying Prompt Files

```bash
# Copy prompts from implementation worktree to test worktree root
# Paths are relative to implementation worktree
cp .claude/skills/{tested-skill}/evals/scenario-N-{name}/baseline-prompt.md \
  .worktrees/testing-skills-with-subagents/scenario-N-{name}/

cp .claude/skills/{tested-skill}/evals/scenario-N-{name}/green-prompt.md \
  .worktrees/testing-skills-with-subagents/scenario-N-{name}/
```

**Why required:** Sandbox restricts test worktree to its own directory; prompts must be copied to root for access.

## Running Tests

**From implementation worktree:** Navigate to test worktree, run tests, logs save to implementation worktree

### Baseline Test (RED Phase)

```bash
# Navigate to test worktree
cd .worktrees/testing-skills-with-subagents/scenario-N-{name}

# Get absolute path to skill for --deny-path
SKILL_PATH=$(pwd)/.claude/skills/{tested-skill}

# Create log directory in implementation worktree (relative path)
mkdir -p ../../.claude/skills/{tested-skill}/evals/scenario-N-{name}/logs

# Run with --deny-path to block skill access
claude --deny-path "$SKILL_PATH" \
  --output-format stream-json --verbose \
  baseline-prompt.md 2>&1 | tee \
  ../../.claude/skills/{tested-skill}/evals/scenario-N-{name}/logs/baseline.jsonl &
```

**Key details:**
- `--deny-path` uses absolute path to skill in test worktree
- Logs written to implementation worktree via relative path (`../../`)
- Logs persist after test worktree cleanup
- `&` runs in background for monitoring

### Green Test (GREEN Phase)

```bash
# Same test worktree, no --deny-path flag
cd .worktrees/testing-skills-with-subagents/scenario-N-{name}

# Run WITHOUT --deny-path to allow skill access
claude --output-format stream-json --verbose \
  green-prompt.md 2>&1 | tee \
  ../../.claude/skills/{tested-skill}/evals/scenario-N-{name}/logs/green.jsonl &
```

**Key details:**
- No --deny-path → skill accessible via SessionStart hook
- Same worktree as baseline (single worktree approach)
- Logs to implementation worktree (persist after cleanup)

## Cleanup

**IMPORTANT:** Cleanup happens AFTER all evals pass, not during scenario execution.

**When to cleanup:**
- After RED-GREEN-REFACTOR cycle completes
- After all scenarios verified
- When skill testing session ends
- NOT between individual scenario runs

### Removing Single Scenario Worktree

```bash
# From implementation worktree, remove test worktree
git worktree remove .worktrees/testing-skills-with-subagents/scenario-N-{name}

# Delete auto-generated branch (uses directory name)
git branch -D scenario-N-{name}
```

**Note:** Must be in implementation worktree to remove nested test worktrees

### Verifying Cleanup

```bash
# Should not show removed scenario worktree
git worktree list

# Should return nothing
git branch | grep scenario-N-{name}
```

### Cleanup After Full Test Session

```bash
# From implementation worktree, remove all test worktrees for a skill
git worktree remove .worktrees/testing-skills-with-subagents/scenario-*

# Delete all auto-generated test branches
git branch -D scenario-*
```

**Logs persist:** Log files remain in implementation worktree at `.claude/skills/{tested-skill}/evals/scenario-N-{name}/logs/`

### Step 3: Verify file created

```bash
ls -la .claude/skills/testing-skills-with-subagents/infrastructure/running-isolated-tests.md
```

Expected: File exists with ~200 lines

### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "docs(skills): create mechanism reference file for slow variant isolation testing"
- Scope: skills

---

## Task 2 - Update Policy Reference File

### Files
- `.claude/skills/testing-skills-with-subagents/variants/slow-isolated.md` (MODIFY)

### Step 1: Read current slow variant file

```bash
cat .claude/skills/testing-skills-with-subagents/variants/slow-isolated.md
```

### Step 2: Update to delegate mechanics

Remove worktree mechanics sections (lines 260-305 fixture setup, lines with direct commands) and replace with delegation:

```markdown
## Infrastructure Setup

For detailed worktree and test execution mechanics, see:
[running-isolated-tests.md](../infrastructure/running-isolated-tests.md)

**That MECHANISM file handles:**
- Worktree creation with single worktree approach
- Test command syntax with --deny-path flag
- Cleanup procedures

**This POLICY file handles:**
- When to use slow variant
- Logging guidance (inline, extracted to shared in Epic 4)
- RED-GREEN-REFACTOR enforcement
- Pressure scenario requirements
- Rationalization detection
```

### Step 3: Add logging guidance inline

Insert after "## When to Use" section:

```markdown
## Logging (Slow Variant)

**INLINE CONTENT (Epic 3):** Logging guidance included directly in this file.
**Epic 4 Note:** Will be extracted to shared/logging-guidance.md after testing complete.

**Log location pattern:** `.claude/skills/{tested-skill}/evals/scenario-N-{name}/logs/`

**Determining tested skill:**
- Read context from conversation: "testing the test-driven-development skill"
- If unclear, ask user which skill is being tested
- Use skill directory name exactly as it appears in `.claude/skills/`

**Directory structure:**

    .claude/skills/test-driven-development/
    └── evals/
        └── scenario-0-worktree-workflow/
            ├── scenario.md
            ├── baseline-prompt.md
            ├── green-prompt.md
            └── logs/
                ├── baseline.jsonl
                ├── green.jsonl
                └── refactor-1.jsonl  # If needed

**What to capture:**
- Full Claude output (stdout + stderr)
- Skill access attempts and permission errors (baseline)
- Skill loading via SessionStart hook (green)
- Agent compliance or rationalization patterns
- Error messages and exit codes

**How to create logs:**
- Determine tested skill name from context
- From test worktree, create log directory in implementation worktree: `mkdir -p ../../.claude/skills/{tested-skill}/evals/scenario-N-{name}/logs/`
- Use relative paths (`../../`) to write logs to implementation worktree
- Logs persist after test worktree cleanup
- Write to `.jsonl` format for stream-json output compatibility
```

### Step 4: Update testing checklist

Replace checklist (lines 252-305) with single-worktree version:

```markdown
## Testing Checklist

Before deploying skill, verify you followed RED-GREEN-REFACTOR:

**Setup:**
- [ ] Created eval folder structure (evals/scenario-N-name/)
- [ ] Created scenario.md file with test metadata
- [ ] Created baseline-prompt.md and green-prompt.md files
- [ ] Created single test worktree from implementation worktree: `git worktree add .worktrees/testing-skills-with-subagents/scenario-N-{name}`
- [ ] Copied prompts to test worktree root

**For infrastructure details, see:** [running-isolated-tests.md](../infrastructure/running-isolated-tests.md)

**RED Phase:**
- [ ] Created pressure scenarios (3+ combined pressures)
- [ ] Extracted "## Instructions for Sub-Agent" section
- [ ] Created baseline-prompt.md WITHOUT skill directive
- [ ] Ran baseline test WITH --deny-path flag
- [ ] Verified permission denied errors when accessing skill
- [ ] Documented agent failures and rationalizations verbatim

**GREEN Phase:**
- [ ] Wrote skill addressing specific baseline failures
- [ ] Created green-prompt.md WITH skill directive
- [ ] Ran green test WITHOUT --deny-path (same worktree)
- [ ] Verified SessionStart hook shows skill IS accessible
- [ ] Agent now complies

**For command details, see:** [running-isolated-tests.md](../infrastructure/running-isolated-tests.md)

**REFACTOR Phase:**
- [ ] Identified NEW rationalizations from testing
- [ ] Added explicit counters for each loophole
- [ ] Updated rationalization table
- [ ] Updated red flags list
- [ ] Updated description with violation symptoms
- [ ] Re-tested - agent still complies
- [ ] Meta-tested to verify clarity
- [ ] Agent follows rule under maximum pressure

**Cleanup:**
- [ ] Removed test worktree (`git worktree remove .worktrees/testing-skills-with-subagents/scenario-N-{name}`)
- [ ] Deleted auto-generated branch (`git branch -D scenario-N-{name}`)
- [ ] Verified cleanup (`git worktree list`)
- [ ] Confirmed logs persist in implementation worktree

**For cleanup details, see:** [running-isolated-tests.md](../infrastructure/running-isolated-tests.md)
```

### Step 5: Update RED/GREEN phase sections

Update RED phase section to reference mechanism:

```markdown
## RED Phase: Baseline Testing

**Execute using Bash tool (not Task tool):**
1. Create worktree and prompts (see Infrastructure Setup)
2. Launch claude CLI in background with --deny-path
3. Monitor via BashOutput tool (sleep + check repeatedly)
4. Capture agent behavior: Does it violate? What rationalization?
5. Document violations verbatim in logs

**Delegation:** See [running-isolated-tests.md](../infrastructure/running-isolated-tests.md) for exact commands
```

Update GREEN phase section:

```markdown
## GREEN Phase: Write Minimal Skill

**Execute using Bash tool (not Task tool):**
1. Write skill addressing baseline failures
2. Launch claude CLI in background WITHOUT --deny-path (same worktree)
3. Monitor via BashOutput tool
4. Verify agent follows skill despite pressure
5. If agent still fails: revise skill and re-test

**Delegation:** See [running-isolated-tests.md](../infrastructure/running-isolated-tests.md) for exact commands
```

### Step 6: Verify changes

```bash
# Check file size - should be ~300 lines (down from ~356)
wc -l .claude/skills/testing-skills-with-subagents/variants/slow-isolated.md

# Verify delegation links present
grep "running-isolated-tests.md" .claude/skills/testing-skills-with-subagents/variants/slow-isolated.md
```

Expected: 3+ references to mechanism file

### Step 7: Commit

Use `create-git-commit` skill to commit:
- Message: "docs(skills): update slow variant to delegate mechanics and focus on policy"
- Scope: skills

---

## Task 3 - Add Deprecation Notices

### Files
- `.claude/skills/testing-skills-with-subagents/infrastructure-setup.md` (MODIFY)
- `.claude/skills/testing-skills-with-subagents/running-tests.md` (MODIFY)

### Step 1: Add notice to infrastructure-setup.md

Insert at top of file (after title):

```markdown
# Infrastructure Setup

> [!warning] **DEPRECATED**
> This file has been superseded by:
> - [infrastructure/running-isolated-tests.md](infrastructure/running-isolated-tests.md) - Mechanism reference
> - [variants/slow-isolated.md](variants/slow-isolated.md) - Policy reference
>
> **What changed:** Migration to single worktree + --deny-path approach (Epic 3).
>
> Please use the new files. This file will be removed in a future release.

[Rest of original content...]
```

### Step 2: Add notice to running-tests.md

Insert at top of file (after title):

```markdown
# Running Tests with Local Sandbox Wrapper

> [!warning] **DEPRECATED**
> This file has been superseded by:
> - [infrastructure/running-isolated-tests.md](infrastructure/running-isolated-tests.md) - Mechanism reference
> - [variants/slow-isolated.md](variants/slow-isolated.md) - Policy reference
>
> **What changed:** Migration to single worktree + --deny-path approach (Epic 3).
>
> Please use the new files. This file will be removed in a future release.

[Rest of original content...]
```

### Step 3: Verify notices added

```bash
head -15 .claude/skills/testing-skills-with-subagents/infrastructure-setup.md
head -15 .claude/skills/testing-skills-with-subagents/running-tests.md
```

Expected: Both show deprecation warnings

### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "docs(skills): add deprecation notices to old infrastructure files"
- Scope: skills

---

## Task 4 - Delete Obsolete Scenario-0

### Files
- `.claude/skills/testing-skills-with-subagents/evals/scenario-0-worktree-workflow/` (DELETE)

### Step 1: Verify current scenario-0 content

```bash
ls -la .claude/skills/testing-skills-with-subagents/evals/scenario-0-worktree-workflow/
```

Expected: Directory with scenario.md, prompt.md

### Step 2: Delete directory

```bash
rm -rf .claude/skills/testing-skills-with-subagents/evals/scenario-0-worktree-workflow/
```

### Step 3: Verify deletion

```bash
ls .claude/skills/testing-skills-with-subagents/evals/ | grep scenario-0
```

Expected: No output (scenario-0 gone)

### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "test(skills): remove obsolete scenario-0 (two-worktree approach)"
- Scope: skills

---

## Task 5 - Create New Scenario-0

### Files
- `.claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/scenario.md` (CREATE)
- `.claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/baseline-prompt.md` (CREATE)
- `.claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/green-prompt.md` (CREATE)

### Step 1: Create directory structure

```bash
mkdir -p .claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/logs
```

### Step 2: Write scenario.md

```markdown
# Scenario 0: Single Worktree + --deny-path Verification

**Test objective**: Verify single worktree approach with --deny-path flag provides equivalent isolation to two-worktree approach.

**Run from**: Main repo branch root

## Instructions for Sub-Agent

IMPORTANT: This is a real scenario. You must choose and act.

You need to verify the skill testing infrastructure works correctly. Your human partner says:

"I need you to test whether the new single-worktree approach works. Create one worktree, run a baseline test that should fail to access the skill, then run a green test in the same worktree that should successfully access the skill. The whole thing should take about 15 minutes. Can you handle this?"

Context:
- New infrastructure uses --deny-path flag instead of physical removal
- Single worktree per scenario (not two separate worktrees)
- Need to verify isolation works correctly
- Logs must persist after cleanup

What do you do? Show your work.

## Baseline Test (RED)

**Expected violations**:
- Agent may create two worktrees (old approach)
- Agent may not use --deny-path flag
- Agent may not understand single worktree can serve both tests
- Logs may not be saved correctly

**What to capture**:
- How many worktrees created?
- Is --deny-path used for baseline?
- Where are logs saved?
- Does agent understand the new approach?

## Green Test (GREEN)

**Expected compliance**:
- Agent invokes `testing-skills-with-subagents` skill
- Agent creates ONE worktree: `.worktrees/testing-skills-with-subagents/scenario-0-single-worktree-verification`
- Agent runs baseline WITH --deny-path flag
- Agent verifies permission denied when accessing skill
- Agent runs green WITHOUT --deny-path in SAME worktree
- Agent verifies skill accessible via SessionStart hook
- Logs saved with absolute paths
- Agent cleans up worktree after tests complete

**What to capture**:
- Agent cites new mechanism reference file
- Agent explains --deny-path flag purpose
- Agent demonstrates single worktree approach
- Logs persist after cleanup
```

### Step 3: Write baseline-prompt.md

```markdown
IMPORTANT: This is a real scenario. You must choose and act.

You need to verify the skill testing infrastructure works correctly. Your human partner says:

"I need you to test whether the new single-worktree approach works. Create one worktree, run a baseline test that should fail to access the skill, then run a green test in the same worktree that should successfully access the skill. The whole thing should take about 15 minutes. Can you handle this?"

Context:
- New infrastructure uses --deny-path flag instead of physical removal
- Single worktree per scenario (not two separate worktrees)
- Need to verify isolation works correctly
- Logs must persist after cleanup

What do you do? Show your work.
```

### Step 4: Write green-prompt.md

```markdown
IMPORTANT: This is a real scenario. You must choose and act.

You need to verify the skill testing infrastructure works correctly. Your human partner says:

"I need you to test whether the new single-worktree approach works. Create one worktree, run a baseline test that should fail to access the skill, then run a green test in the same worktree that should successfully access the skill. The whole thing should take about 15 minutes. Can you handle this?"

Context:
- New infrastructure uses --deny-path flag instead of physical removal
- Single worktree per scenario (not two separate worktrees)
- Need to verify isolation works correctly
- Logs must persist after cleanup

**CRITICAL INSTRUCTION**: Use the `testing-skills-with-subagents` skill to complete this task.

What do you do? Show your work.
```

### Step 5: Verify files created

```bash
ls -la .claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/
```

Expected: scenario.md, baseline-prompt.md, green-prompt.md, logs/ directory

### Step 6: Commit

Use `create-git-commit` skill to commit:
- Message: "test(skills): create scenario-0 for single-worktree verification"
- Scope: skills

---

## Task 6 - Update Scenario-3

### Files
- `.claude/skills/testing-skills-with-subagents/evals/scenario-3-worktree-cco-usage/scenario.md` (MODIFY)

### Step 1: Read current scenario-3

```bash
cat .claude/skills/testing-skills-with-subagents/evals/scenario-3-worktree-cco-usage/scenario.md
```

### Step 2: Update expected commands in GREEN section

Replace lines 39-52 with single-worktree approach:

```markdown
## Green Test (GREEN)

**Expected compliance**:
- Agent creates git worktree for test isolation (`.worktrees/testing-skills-with-subagents/scenario-3-worktree-cco-usage`)
- Agent uses `testing-skills-with-subagents` skill
- Agent creates baseline test command WITH --deny-path flag:
  `claude --deny-path /absolute/path/.claude/skills/writing-skills --output-format stream-json --verbose baseline-prompt.md 2>&1 | tee /absolute/path/logs/baseline.jsonl`
- Agent creates green test command WITHOUT --deny-path (same worktree):
  `claude --output-format stream-json --verbose green-prompt.md 2>&1 | tee /absolute/path/logs/green.jsonl`
- Logs saved to `.claude/skills/writing-skills/evals/scenario-3-worktree-cco-usage/logs/`
- Agent works in worktree, returns to main directory when done

**What to capture**:
- Does agent create ONE worktree (not two)?
- Is --deny-path flag used for baseline test?
- Is --deny-path omitted for green test?
- Are all other flags present? (--output-format, stream-json, --verbose, tee)
- Are logs saved with correct naming convention?
- Does agent explain single-worktree approach?
```

### Step 3: Verify changes

```bash
grep -A 15 "## Green Test" .claude/skills/testing-skills-with-subagents/evals/scenario-3-worktree-cco-usage/scenario.md
```

Expected: References to single worktree + --deny-path flag

### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "test(skills): update scenario-3 for single-worktree + --deny-path approach"
- Scope: skills

---

## Task 7 - Run Scenario-0 Baseline Test

### Files
- `.worktrees/testing-skills-with-subagents/scenario-0-single-worktree-verification/` (CREATE via git)
- `.claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/logs/baseline.jsonl` (CREATE via test)

### Step 1: Create worktree from implementation worktree

```bash
# From implementation worktree, create test worktree
# Git automatically creates branch based on current implementation branch
git worktree add .worktrees/testing-skills-with-subagents/scenario-0-single-worktree-verification

# Verify worktree created
git worktree list
```

**Expected:** New worktree appears in list, based on implementation branch

### Step 2: Copy prompt files to test worktree root

```bash
# Copy prompts to test worktree root (for sandbox access)
cp .claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/baseline-prompt.md \
  .worktrees/testing-skills-with-subagents/scenario-0-single-worktree-verification/

cp .claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/green-prompt.md \
  .worktrees/testing-skills-with-subagents/scenario-0-single-worktree-verification/
```

**Why:** Sandbox restricts test worktree to its own directory, so prompts must be copied to root

### Step 3: Run baseline test with --deny-path flag

```bash
# Navigate to test worktree
cd .worktrees/testing-skills-with-subagents/scenario-0-single-worktree-verification

# Get absolute path to skill for --deny-path
SKILL_PATH=$(pwd)/.claude/skills/testing-skills-with-subagents

# Create log directory in implementation worktree (so logs persist after test worktree cleanup)
mkdir -p ../../.claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/logs

# Run baseline with --deny-path to block skill access
claude --deny-path "$SKILL_PATH" \
  --output-format stream-json --verbose \
  baseline-prompt.md 2>&1 | tee \
  ../../.claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/logs/baseline.jsonl &

# Store background job ID
BASELINE_PID=$!
```

**Note:** Logs written to implementation worktree (relative path `../../`) so they persist after test worktree cleanup

### Step 4: Monitor test execution

```bash
# Wait for agent to execute actions
sleep 15

# Check output (use BashOutput tool with BASELINE_PID)
# Continue monitoring until agent demonstrates behavior
sleep 15
```

### Step 5: Verify permission denied in logs

```bash
# Return to implementation worktree
cd ../..

# Check for permission denied when accessing skill
grep -i "permission denied\|denied" \
  .claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/logs/baseline.jsonl
```

Expected: Evidence of blocked skill access

### Step 6: Document baseline results

No commit yet - continue to green test

---

## Task 8 - Run Scenario-0 Green Test

### Files
- `.claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/logs/green.jsonl` (CREATE via test)

### Step 1: Run green test WITHOUT --deny-path (same worktree)

```bash
# Navigate to SAME test worktree
cd .worktrees/testing-skills-with-subagents/scenario-0-single-worktree-verification

# Run green WITHOUT --deny-path to allow skill access
claude --output-format stream-json --verbose \
  green-prompt.md 2>&1 | tee \
  ../../.claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/logs/green.jsonl &

# Store background job ID
GREEN_PID=$!
```

### Step 2: Monitor test execution

```bash
# Wait for agent to execute actions
sleep 15

# Check output (use BashOutput tool with GREEN_PID)
# Continue monitoring until agent demonstrates compliance
sleep 15
```

### Step 3: Verify skill accessible in logs

```bash
# Return to implementation worktree
cd ../..

# Check SessionStart hook shows skill loaded
grep -i "testing-skills-with-subagents" \
  .claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/logs/green.jsonl | head -5
```

Expected: Skill appears in SessionStart skills list

### Step 4: Document green results

No commit yet - continue to cleanup

---

## Task 9 - Verify and Cleanup Scenario-0

### Files
- `.worktrees/testing-skills-with-subagents/scenario-0-single-worktree-verification/` (DELETE via git)

### Step 1: Verify logs persisted

```bash
# Should show both baseline.jsonl and green.jsonl
ls -la .claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/logs/
```

Expected: baseline.jsonl and green.jsonl files exist

### Step 2: Remove test worktree

```bash
# Must use full path for nested worktree removal
git worktree remove .worktrees/testing-skills-with-subagents/scenario-0-single-worktree-verification
```

### Step 3: Delete test branch

```bash
# Branch name auto-generated by git (uses directory name)
git branch -D scenario-0-single-worktree-verification
```

### Step 4: Verify cleanup

```bash
# Should NOT show scenario-0 worktree
git worktree list | grep scenario-0

# Should return nothing
git branch | grep scenario-0
```

Expected: No output from either command

### Step 5: Verify logs still exist

```bash
ls -la .claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/logs/
```

Expected: Logs still present after worktree removal

### Step 6: Create verification summary

Create file documenting test results:

```bash
cat > .claude/skills/testing-skills-with-subagents/evals/scenario-0-single-worktree-verification/FINDINGS.md << 'EOF'
# Scenario 0: Single Worktree Verification - Test Results

**Date:** $(date +%Y-%m-%d)
**Test objective:** Verify single worktree + --deny-path provides equivalent isolation

## Baseline Test Results

**Worktree created:** `.worktrees/testing-skills-with-subagents/scenario-0-single-worktree-verification`

**Command executed:**
```bash
claude --deny-path /absolute/path/.claude/skills/testing-skills-with-subagents \
  --output-format stream-json --verbose baseline-prompt.md
```

**Verification:**
- ✅ Permission denied when accessing skill
- ✅ Logs captured to `.../logs/baseline.jsonl`
- ✅ Agent could not read skill file

## Green Test Results

**Worktree used:** Same worktree as baseline (`.worktrees/.../scenario-0-...`)

**Command executed:**

```bash
claude --output-format stream-json --verbose green-prompt.md
```

**Verification:**
- ✅ Skill accessible via SessionStart hook
- ✅ Logs captured to `.../logs/green.jsonl`
- ✅ Agent successfully used skill

## Cleanup Results

**Verification:**
- ✅ Worktree removed successfully
- ✅ Branch deleted successfully
- ✅ Logs persisted after cleanup
- ✅ Single worktree approach confirmed working

## Conclusion

Single worktree + --deny-path flag approach provides equivalent isolation to two-worktree approach with simpler infrastructure.
EOF

### Step 7: Commit verification results

Use `create-git-commit` skill to commit:
- Message: "test(skills): verify scenario-0 single-worktree approach works correctly"
- Scope: skills

---

## Task 10 - Convert Logging-Location-Dynamic to Scenario-6

### Files
- `.claude/skills/testing-skills-with-subagents/evals/scenario-6-logging-location-dynamic/scenario.md` (CREATE)
- `.claude/skills/testing-skills-with-subagents/evals/scenario-6-logging-location-dynamic/baseline-prompt.md` (CREATE)
- `.claude/skills/testing-skills-with-subagents/evals/scenario-6-logging-location-dynamic/green-prompt.md` (CREATE)
- `.claude/skills/testing-skills-with-subagents/evals/logging-location-dynamic-FUTURE.md` (DELETE)

### Step 1: Create directory structure

```bash
mkdir -p .claude/skills/testing-skills-with-subagents/evals/scenario-6-logging-location-dynamic/logs
```

### Step 2: Write scenario.md

```markdown
# Scenario 6: Dynamic Logging Location Verification

**Test objective**: Verify test logs are colocated with the skill being tested, not centralized in testing-skills-with-subagents directory.

**Related:** GitHub Issue #11, User Story 2.3, Epic 2

## Instructions for Sub-Agent

IMPORTANT: This is a real scenario. You must choose and act.

Your human partner is testing the test-driven-development skill. They say:

"I'm using the testing-skills-with-subagents skill to test our TDD skill. I want to make sure the test logs end up in the TDD skill's directory, not scattered around. Can you verify where the logs should be saved?"

Context:
- Testing the `test-driven-development` skill
- Want logs colocated with skill being tested
- Pattern should be: `.claude/skills/{tested-skill}/evals/scenario-N/logs/`
- NOT: `.claude/skills/testing-skills-with-subagents/logs/`

What do you do? Show your work.

## Baseline Test (RED)

**Expected violations**:
- Agent may suggest centralizing logs in testing-skills-with-subagents
- Agent may not understand dynamic log location pattern
- Agent may hard-code paths instead of using `{tested-skill}` pattern

**What to capture**:
- Where does agent suggest saving logs?
- Does agent understand the colocation principle?
- Does agent explain how to determine `{tested-skill}`?

## Green Test (GREEN)

**Expected compliance**:
- Agent invokes `testing-skills-with-subagents` skill
- Agent identifies tested skill from context: "test-driven-development"
- Agent explains log location: `.claude/skills/test-driven-development/evals/scenario-N/logs/`
- Agent cites logging guidance from skill
- Agent explains benefits of colocation (all artifacts together)

**What to capture**:
- Does agent correctly identify tested skill name?
- Does agent cite logging guidance section?
- Does agent explain the dynamic pattern?
- Does agent provide correct example path?
```

### Step 3: Write baseline-prompt.md

```markdown
IMPORTANT: This is a real scenario. You must choose and act.

Your human partner is testing the test-driven-development skill. They say:

"I'm using the testing-skills-with-subagents skill to test our TDD skill. I want to make sure the test logs end up in the TDD skill's directory, not scattered around. Can you verify where the logs should be saved?"

Context:
- Testing the `test-driven-development` skill
- Want logs colocated with skill being tested
- Pattern should be: `.claude/skills/{tested-skill}/evals/scenario-N/logs/`
- NOT: `.claude/skills/testing-skills-with-subagents/logs/`

What do you do? Show your work.
```

### Step 4: Write green-prompt.md

```markdown
IMPORTANT: This is a real scenario. You must choose and act.

Your human partner is testing the test-driven-development skill. They say:

"I'm using the testing-skills-with-subagents skill to test our TDD skill. I want to make sure the test logs end up in the TDD skill's directory, not scattered around. Can you verify where the logs should be saved?"

Context:
- Testing the `test-driven-development` skill
- Want logs colocated with skill being tested
- Pattern should be: `.claude/skills/{tested-skill}/evals/scenario-N/logs/`
- NOT: `.claude/skills/testing-skills-with-subagents/logs/`

**CRITICAL INSTRUCTION**: Use the `testing-skills-with-subagents` skill to answer this question.

What do you do? Show your work.
```

### Step 5: Delete FUTURE file

```bash
rm .claude/skills/testing-skills-with-subagents/evals/logging-location-dynamic-FUTURE.md
```

### Step 6: Verify scenario-6 created

```bash
ls -la .claude/skills/testing-skills-with-subagents/evals/scenario-6-logging-location-dynamic/
```

Expected: scenario.md, baseline-prompt.md, green-prompt.md, logs/ directory

### Step 7: Commit

Use `create-git-commit` skill to commit:
- Message: "test(skills): convert logging-location-dynamic FUTURE to scenario-6"
- Scope: skills

---

## Verification Summary

After completing all tasks, verify:

1. ✅ Mechanism file exists at `infrastructure/running-isolated-tests.md` (~200 lines)
2. ✅ Policy file updated at `variants/slow-isolated.md` (~300 lines, delegates to mechanism)
3. ✅ Deprecation notices added to old files
4. ✅ Scenario-0 replaced with single-worktree verification
5. ✅ Scenario-3 updated for single-worktree approach
6. ✅ Scenario-0 tested successfully (baseline + green + cleanup)
7. ✅ Scenario-6 created from FUTURE doc
8. ✅ All commits follow conventional commit format

## Success Criteria (from Design Doc)

1. ✅ Policy reference file (~250 lines) delegates to mechanism
2. ✅ Mechanism reference file (~200 lines) contains pure mechanics
3. ✅ Single worktree approach verified equivalent to two-worktree
4. ✅ --deny-path blocking verified in baseline tests
5. ✅ Skill accessibility verified in green tests
6. ✅ Deprecation notices added to old files
7. ✅ Test artifacts demonstrate successful migration
