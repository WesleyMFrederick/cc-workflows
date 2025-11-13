# Epic 3: Slow Variant Migration - Design Plan

**Date:** 2025-01-13
**Status:** Design Complete
**Requirements:** [fast-slow-skill-variants-prd.md](../../fast-slow-skill-variants-prd.md)

## Overview

Migrate the slow variant to use Policy/Mechanism separation with single worktree + --deny-path flag.

**Core changes:**
1. Single worktree per scenario replaces two worktrees
2. Worktree naming pattern enables concurrent scenario testing
3. --deny-path flag blocks skill access (baseline tests)
4. Policy/Mechanism separation reduces file size
5. Clearer separation of "when/why" from "how"

## Critical Difference from Fast Variant

**Fast variant:** Uses Task tool to launch subagents within current session (conversational testing)

**Slow variant:** Invokes `claude` CLI directly from command line in isolated worktrees (deployment testing)

**Why this matters:**
- Slow variant tests actual deployment scenario (separate claude process)
- Uses sandbox wrapper with --deny-path flag (production-like isolation)
- Logs captured via shell redirection (not Task tool output)
- Background processes monitored via BashOutput tool
- Requires git worktree infrastructure (fast variant doesn't)

**Testing execution:**

```bash
# Fast variant (Task tool)
Task tool → Launches subagent → Captures response in conversation

# Slow variant (CLI invocation)
Bash tool → claude CLI in worktree → Redirects to log file → Monitor with BashOutput
```

## Architecture Decision

**Selected Approach:** Policy/Mechanism Separation + Single Worktree with --deny-path

**Rationale:**
- **Policy/Mechanism pattern** reduces duplication, improves reusability
- **Single worktree per scenario** simplifies infrastructure (one worktree vs two)
- **Scoped worktree naming** (`.worktrees/{skill-name}/scenario-N-{name}`) enables concurrent testing
- **--deny-path flag** provides same isolation as physical removal
- **Already implemented** in sandbox package (packages/sandbox/conditional-claude.sh)

**Rejected Alternatives:**
- Keep two worktrees: More complex, slower, more disk usage
- Monolithic variant file: 400+ lines, harder to maintain
- No separation: Duplicates mechanics across variants

## Component Design

### Component 1: Mechanism Reference File

**File:** `.claude/skills/testing-skills-with-subagents/infrastructure/running-isolated-tests.md`

**Purpose:** Document worktree creation, test execution, cleanup mechanics

**Responsibility:** Pure execution mechanics (no policy enforcement)

**Content Structure (~200 lines):**

~~~markdown
# Running Isolated Tests (MECHANISM)

## Overview
Execute skill tests in isolated worktrees using --deny-path for access control.

## Eval Directory Structure
[Standard structure with scenario.md, prompts, logs/]

## Scenario File Format
[How to structure scenario.md with instructions section]

## Worktree Setup

### Creating Test Worktree

```bash
// Boundary: Git worktree creation with skill-scoped naming
// Pattern: .worktrees/{skill-name}/scenario-N-{name} enables concurrent scenarios
git worktree add .worktrees/testing-skills-with-subagents/scenario-0-worktree-workflow \
  -b test/testing-skills-with-subagents/scenario-0-worktree-workflow
```


### Copying Prompt Files

```bash
// Boundary: File system copy to make prompts accessible in sandbox
cp baseline-prompt.md .worktrees/testing-skills-with-subagents/scenario-0-worktree-workflow/
cp green-prompt.md .worktrees/testing-skills-with-subagents/scenario-0-worktree-workflow/
```

## Logging (Slow Variant)

**Log location pattern:** `.claude/skills/{tested-skill}/evals/scenario-N-{name}/logs/`

**Determining tested skill:**
- Read context from conversation: "testing the test-driven-development skill" → `{tested-skill}` = `test-driven-development`
- If unclear, ask user which skill is being tested
- Use skill directory name exactly as it appears in `.claude/skills/`

**Directory structure:**

```text
.claude/skills/test-driven-development/
└── evals/
    └── scenario-0-worktree-workflow/
        ├── scenario.md              # Test metadata and instructions
        ├── baseline-prompt.md       # Extracted instructions WITHOUT skill directive
        ├── green-prompt.md          # Extracted instructions WITH skill directive
        └── logs/
            ├── baseline.jsonl       # RED phase output
            ├── green.jsonl          # GREEN phase output
            └── refactor-1.jsonl     # REFACTOR iteration outputs (if needed)
```

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

## Running Tests

### Baseline Test (RED Phase)

```bash
// Integration: Uses --deny-path flag from sandbox wrapper
// Pattern: Logs colocated with skill being tested (same as fast variant)
// Boundary: Absolute path to main repo ensures logs persist after worktree cleanup
cd .worktrees/testing-skills-with-subagents/scenario-0-worktree-workflow
claude --deny-path /absolute/path/.claude/skills/test-driven-development \
  --output-format stream-json --verbose \
  baseline-prompt.md 2>&1 | tee \
  /absolute/path/main-repo/.claude/skills/test-driven-development/evals/scenario-0-worktree-workflow/logs/baseline.jsonl
```

### Green Test (GREEN Phase)

```bash
// Pattern: No --deny-path flag allows skill access
// Integration: SessionStart hook loads skill, visible in output
cd .worktrees/testing-skills-with-subagents/scenario-0-worktree-workflow
claude --output-format stream-json --verbose \
  green-prompt.md 2>&1 | tee \
  /absolute/path/main-repo/.claude/skills/test-driven-development/evals/scenario-0-worktree-workflow/logs/green.jsonl
```

## Cleanup

**IMPORTANT:** Cleanup happens AFTER all evals pass, not during scenario execution.

**When to cleanup:**
- After RED-GREEN-REFACTOR cycle completes
- After all scenarios verified
- When skill testing session ends
- NOT between individual scenario runs

### Removing Single Scenario Worktree

```bash
// Boundary: Navigate to main repo before cleanup
// Decision: Only cleanup after verification complete
cd /path/to/main-repo
git worktree remove --force .worktrees/testing-skills-with-subagents/scenario-0-worktree-workflow
git branch -D test/testing-skills-with-subagents/scenario-0-worktree-workflow
```

### Verifying Cleanup

```bash
git worktree list  // Should not show removed scenario worktree
```

### Cleanup After Full Test Session

```bash
// Pattern: Remove all scenario worktrees for a skill after session complete
// Decision: Bulk cleanup when all testing finished
cd /path/to/main-repo
git worktree remove --force .worktrees/testing-skills-with-subagents/scenario-*
git branch -D test/testing-skills-with-subagents/scenario-*
```

**Key Details:**
- No enforcement logic (that lives in policy file)
- No rationalization counters (that lives in policy file)
- Pure mechanics: how to create, run, cleanup
- Reusable by other workflows
~~~


### Component 2: Policy Reference File

**File:** `.claude/skills/testing-skills-with-subagents/variants/slow-isolated.md`

**Purpose:** Define when to use slow variant, enforce RED-GREEN-REFACTOR workflow

**Responsibility:** Policy enforcement, rationalization prevention, workflow guidance

**Content Structure (~300 lines):**

~~~markdown
# Testing Skills With Subagents (Slow Variant)

## Overview
Rigorous validation using isolated worktrees before deployment.

**Core principle:** Physical isolation + --deny-path = high confidence validation.

## When to Use
- Pre-deployment validation
- Testing critical skills
- Need deployment-ready confidence
- Time available: 45-90 minutes

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
- Create eval directory: `mkdir -p .claude/skills/{tested-skill}/evals/scenario-N-{name}/logs/`
- Use absolute paths so logs persist after worktree cleanup
- Write to `.jsonl` format for stream-json output compatibility

## TDD Mapping for Skill Testing
[Table mapping RED-GREEN-REFACTOR to skill testing]

## Infrastructure Setup

For worktree creation, test execution, and cleanup mechanics, see:
[running-isolated-tests.md](../infrastructure/running-isolated-tests.md)

**That mechanism file handles:**
- Worktree creation with single worktree approach
- Test command syntax with --deny-path flag
- Cleanup procedures

**This policy file handles:**
- When to use slow variant
- Logging guidance (inline, extracted to shared in Epic 4)
- RED-GREEN-REFACTOR enforcement
- Pressure scenario requirements
- Rationalization detection

## RED Phase: Baseline Testing

**Execute using Bash tool (not Task tool):**
1. Create worktree and prompts (see Infrastructure Setup)
2. Launch claude CLI in background with --deny-path
3. Monitor via BashOutput tool (sleep + check repeatedly)
4. Capture agent behavior: Does it violate? What rationalization?
5. Document violations verbatim in logs

**Delegation:** See [running-isolated-tests.md](../infrastructure/running-isolated-tests.md) for exact commands

## GREEN Phase: Write Minimal Skill

**Execute using Bash tool (not Task tool):**
1. Write skill addressing baseline failures
2. Launch claude CLI in background WITHOUT --deny-path
3. Monitor via BashOutput tool
4. Verify agent follows skill despite pressure
5. If agent still fails: revise skill and re-test

**Delegation:** See [running-isolated-tests.md](../infrastructure/running-isolated-tests.md) for exact commands

## REFACTOR Phase: Close Loopholes

**Execute using Bash tool (not Task tool):**
1. Identify new rationalizations from green test
2. Update skill with explicit counters
3. Re-run green test to verify compliance
4. Repeat until bulletproof

[Rationalization tables, red flags, counters]

## Testing Checklist
- [ ] Created eval directory structure
- [ ] Created ONE test worktree (not two)
- [ ] Ran baseline test WITH --deny-path flag
- [ ] Verified permission denied errors
- [ ] Ran green test WITHOUT --deny-path
- [ ] Verified skill accessible
- [ ] Cleaned up worktree

~~~

**Key Details:**
- References mechanism file for "how"
- Contains all enforcement logic
- Contains rationalization tables
- Contains RED-GREEN-REFACTOR workflow

## Data Flow

### Baseline Test Execution

```text
User invokes slow variant
    ↓
Policy file: Determines need for baseline test
    ↓
Mechanism file: Provides worktree creation commands
    ↓
Create worktree: .worktrees/testing-skills-with-subagents/scenario-0-worktree-workflow
    ↓
Copy prompts to worktree
    ↓
Run baseline test:
  cd .worktrees/testing-skills-with-subagents/scenario-0-worktree-workflow
  claude --deny-path /absolute/path/to/skill baseline-prompt.md
    ↓
--deny-path flag parsed by conditional-claude.sh
    ↓
DENY_PATHS exported to environment
    ↓
claude-worktree-sandbox.sh generates Seatbelt deny rules:
  (deny file-read* (literal "/path/to/skill/SKILL.md"))
    ↓
Claude attempts to access skill → Permission denied
    ↓
Log output to /absolute/path/logs/baseline.jsonl
```

### Green Test Execution

```text
Policy file: Determines need for green test
    ↓
Mechanism file: Provides test command (no --deny-path)
    ↓
Run green test:
  cd .worktrees/testing-skills-with-subagents/scenario-0-worktree-workflow
  claude green-prompt.md
    ↓
No --deny-path flag → No DENY_PATHS in environment
    ↓
Skill accessible via SessionStart hook
    ↓
Claude loads and uses skill
    ↓
Log output to /absolute/path/logs/green.jsonl
```

## File Structure After Migration

```text
.claude/skills/testing-skills-with-subagents/
├── SKILL.md (router)
├── variants/
│   ├── fast-conversational.md (policy reference)
│   └── slow-isolated.md (policy reference - UPDATED)
├── infrastructure/
│   └── running-isolated-tests.md (mechanism reference - NEW)
├── shared/
│   ├── pressure-scenarios.md
│   └── rationalization-patterns.md
├── [DEPRECATED]
│   ├── infrastructure-setup.md
│   └── running-tests.md
```

## Key Differences from Current Implementation

| Aspect | Current (2 Worktrees) | New (1 Worktree + --deny-path) |
|--------|----------------------|--------------------------------|
| **Worktrees** | 2 (baseline, green) | 1 per scenario |
| **Naming** | `.worktrees/scenario-N-{baseline\|green}` | `.worktrees/{skill}/scenario-N-{name}` |
| **Isolation** | Physical removal (`rm -rf`) | --deny-path flag |
| **Commands** | Different directories | Same directory, different flags |
| **Cleanup** | 2 worktrees to remove | 1 worktree to remove |
| **Branches** | 2 branches to delete | 1 branch to delete |
| **Concurrent testing** | Not possible (name conflicts) | Possible (scoped naming) |
| **Verification** | SessionStart shows absent/present | Permission denied vs accessible |
| **File organization** | Monolithic 356 lines | Policy (~250) + Mechanism (~200) |

## Implementation Approach

### Phase 1: Extract Mechanism Reference File

**Create:** `infrastructure/running-isolated-tests.md`

**Extract from current files:**
- Eval directory structure (infrastructure-setup.md lines 6-39)
- Scenario file format (infrastructure-setup.md lines 41-95)
- Worktree setup commands (infrastructure-setup.md lines 97-160)
- Test execution commands (running-tests.md lines 17-90)
- Cleanup procedures (infrastructure-setup.md lines 162-229)

**Update for single worktree with scoped naming:**

- Change naming pattern: `.worktrees/{skill-name}/scenario-N-{name}`
- Example: `.worktrees/testing-skills-with-subagents/scenario-0-worktree-workflow`
- Remove physical skill removal (`rm -rf`)
- Add --deny-path flag to baseline commands
- Remove --deny-path from green commands
- Update cleanup to remove one worktree per scenario
- Add bulk cleanup pattern for all scenarios of a skill

### Phase 2: Update Policy Reference File

**Update:** `variants/slow-isolated.md`

**Changes:**
- Remove worktree mechanics (now in mechanism file)
- Add delegation link to mechanism file
- Update testing checklist for single worktree
- Update references from "two worktrees" to "single worktree"
- Keep all RED-GREEN-REFACTOR enforcement
- Keep all rationalization tables
- Keep all pressure scenario guidance

**Delegation pattern:**

```markdown
## Infrastructure Setup

For detailed worktree and test execution mechanics, see:
[running-isolated-tests.md](../infrastructure/running-isolated-tests.md)

This MECHANISM file handles:
- Worktree creation and configuration
- Test command syntax with --deny-path flag
- Cleanup procedures

This POLICY file handles:
- When to use slow variant
- RED-GREEN-REFACTOR enforcement
- Pressure scenario requirements
- Rationalization detection
```

### Phase 3: Deprecate Old Files

**Add deprecation notice to:**
- `infrastructure-setup.md`
- `running-tests.md`

**Notice format:**

```markdown
> [!warning] **DEPRECATED**
> This file has been superseded by:
> - [infrastructure/running-isolated-tests.md](infrastructure/running-isolated-tests.md) - Mechanism reference
> - [variants/slow-isolated.md](variants/slow-isolated.md) - Policy reference
>
> Please use the new files. This file will be removed in a future release.
```

## Testing Strategy

### Verify Mechanism File Standalone

**Test:** Can mechanism file be followed independently?

1. Create eval directory structure
2. Follow mechanism file to create worktree
3. Follow mechanism file to run baseline test with --deny-path
4. Verify permission denied when accessing skill
5. Follow mechanism file to run green test without --deny-path
6. Verify skill accessible
7. Follow mechanism file to cleanup

**Success criteria:** Can complete test cycle using only mechanism file

### Verify Policy File Delegates Correctly

**Test:** Does policy file reference mechanism appropriately?

1. Read policy file
2. Verify links to mechanism file present
3. Verify no duplicate mechanics in policy file
4. Verify all enforcement logic in policy file
5. Verify rationalization tables in policy file

**Success criteria:** Clear separation of concerns

### Verify Single Worktree Approach

**Test:** Does --deny-path provide same isolation as physical removal?

**Baseline test:**

```bash
cd .worktrees/testing-skills-with-subagents/scenario-0-worktree-workflow
claude --deny-path /absolute/path/.claude/skills/test-skill \
  baseline-prompt.md
# Expected: Permission denied when accessing skill
```

**Green test:**

```bash
cd .worktrees/testing-skills-with-subagents/scenario-0-worktree-workflow
claude green-prompt.md
# Expected: Skill loads and is accessible
```

**Success criteria:** Same verification guarantees as two-worktree approach

## Benefits

1. **Simpler infrastructure:** One worktree per scenario instead of two
2. **Concurrent testing:** Scoped naming enables parallel scenario execution
3. **Faster execution:** Less disk I/O, fewer git operations
4. **Clearer separation:** Policy (when/why) vs Mechanism (how)
5. **Better reusability:** Mechanism file usable by other workflows
6. **Smaller files:** Policy ~250 lines, Mechanism ~200 lines (vs monolithic 356)
7. **Leverages existing implementation:** --deny-path already tested and working
8. **Better organization:** Skill-scoped directories keep worktrees organized

## Risks and Mitigations

**Risk 1:** --deny-path doesn't fully block skill access

**Mitigation:** Already tested in sandbox package evals
- Test: evals/scenario-1-eval-structure/FINDINGS.md
- Result: Confirmed to block both filesystem and git access
- Action: Verify during testing phase

**Risk 2:** Breaking existing workflows

**Mitigation:** Maintain verification guarantees
- Same isolation (permission denied vs physical absence)
- Same log format (absolute paths to main repo)
- Same cleanup pattern (worktree removal)
- Action: Acceptance criteria verify equivalence

**Risk 3:** Mechanism file too flexible, loses enforcement

**Mitigation:** Policy file maintains all enforcement
- Rationalization tables stay in policy
- RED-GREEN-REFACTOR workflow stays in policy
- Pressure scenario requirements stay in policy
- Action: Verify during code review

## Success Criteria

1. ✅ PRD updated with new requirements
2. ⏳ Policy reference file (~250 lines) delegates to mechanism
3. ⏳ Mechanism reference file (~200 lines) contains pure mechanics
4. ⏳ Single worktree approach verified equivalent to two-worktree
5. ⏳ --deny-path blocking verified in baseline tests
6. ⏳ Skill accessibility verified in green tests
7. ⏳ Deprecation notices added to old files

## References

- **Requirements:** [fast-slow-skill-variants-prd.md](../../fast-slow-skill-variants-prd.md)
- **Sandbox --deny-path:** [packages/sandbox/design-docs/features/20251113-deny-path-support/](../../../../../packages/sandbox/design-docs/features/20251113-deny-path-support/)
- **Policy/Mechanism Pattern:** [writing-skills skill](~/.claude/plugins/cache/superpowers/skills/writing-skills/SKILL.md)
- **Architecture Principles:** [ARCHITECTURE-PRINCIPLES.md](../../../../../ARCHITECTURE-PRINCIPLES.md)
