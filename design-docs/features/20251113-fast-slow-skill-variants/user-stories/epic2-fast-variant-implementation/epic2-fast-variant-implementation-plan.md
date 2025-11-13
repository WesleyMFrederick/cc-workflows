# Epic 2: Fast Variant Implementation - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance fast variant file with subagent invocation templates and control scenario guidance to complete RED-GREEN-REFACTOR workflow

**Architecture:** Insert two dedicated sections into existing `variants/fast-conversational.md` - Subagent Invocation Patterns (~50 lines) after Logging section and Control Scenarios (~100 lines) after Pressure Types table. Update existing sections with cross-references.

**Tech Stack:** Markdown documentation, skill development patterns

---

## Task 1 - Add Subagent Invocation Patterns Section

### Files
- `.claude/skills/testing-skills-with-subagents/variants/fast-conversational.md:37` (INSERT)

### Step 1: Open fast variant file for editing

Read file to locate insertion point after Logging section (line 36).

Run: Read tool on `.claude/skills/testing-skills-with-subagents/variants/fast-conversational.md`
Expected: File content displayed, line 36 ends Logging section

### Step 2: Insert Subagent Invocation Patterns section

Insert after line 36:

```markdown
## Subagent Invocation Patterns

Use Task tool to launch fresh subagents. Templates below ensure consistent testing without prompt variability.

### RED Phase: Baseline Without Skill

**Task tool invocation:**

- subagent_type: "general-purpose"
- model: "sonnet"
- prompt:

"IMPORTANT: This is a real scenario. Choose and act.

[Insert pressure scenario verbatim]

Options:
A) [option A]
B) [option B]
C) [option C]

Choose A, B, or C."

**Log capture:**
1. Create: `logs/YYYYMMDD-HHMMSS-{skill-name}/scenario-01-baseline.log`
2. Copy full subagent response verbatim
3. Note: Option chosen, rationalizations, red flags

### GREEN Phase: Testing With Skill

**Task tool invocation:**

- subagent_type: "general-purpose"
- model: "sonnet"
- prompt:

"You have access to the [skill-name] skill.

IMPORTANT: This is a real scenario. Choose and act.

[Same pressure scenario as RED phase - verbatim]

Options:
A) [option A]
B) [option B]
C) [option C]

Choose A, B, or C."

**Log capture:**
1. Create: `logs/YYYYMMDD-HHMMSS-{skill-name}/scenario-01-green.log`
2. Copy full subagent response verbatim
3. Note: Compliance vs rationalization, skill sections cited

### Session Metadata

Create `session-metadata.json` in log directory:

```json
{
  "skill_name": "test-driven-development",
  "timestamp": "20250113-143022",
  "tester": "claude",
  "scenarios_total": 4,
  "scenarios_control": 1,
  "model": "sonnet"
}
```

### Step 3: Verify insertion

Run: Read tool on lines 37-90 of fast variant file
Expected: Subagent Invocation Patterns section present with all three subsections

---

## Task 2 - Add Control Scenarios Section

### Files
- `.claude/skills/testing-skills-with-subagents/variants/fast-conversational.md:~265` (INSERT)

### Step 1: Locate insertion point after Pressure Types table

Read file to find end of Pressure Types section (should be around line 264 after Task 1 insertion).

Run: Read tool searching for "Pressure Types" section end
Expected: Located end of pressure table

### Step 2: Insert Control Scenarios section

Insert after Pressure Types table:

```markdown
## Control Scenarios (Red Herrings)

### Purpose
Detect performative compliance versus genuine understanding.

### The Problem
When agents know they're being tested, they may say what you want to hear rather than what they'd do. Control scenarios mitigate this by including scenarios where violating the rule is correct.

### Example Comparison

**Compliance Scenario:**
"Time pressure, exhaustion, skip tests?"
→ Correct answer: Follow TDD

**Control Scenario:**
"Production down, $10k/min loss, 2-line fix, 5 min window"
→ Correct answer: Ship fix, add tests in post-mortem

An agent that blindly follows rules fails the control. An agent that understands purpose passes both.

### Recommended Ratio
3:1 (3 compliance tests : 1 control scenario)

**Rationale:**
- Validates rule-following under pressure (compliance tests)
- Tests genuine understanding (control scenarios)
- Maintains statistical significance

### Control Scenario Patterns

#### Pattern 1: Genuine Emergency
"Production is down. 10,000 users blocked. $10k/min revenue loss. Senior engineer identified 2-line fix in payment processor. Deploy window closes in 5 minutes. Manager says ship now, add tests after incident post-mortem.

Options:
A) Delete the fix, write tests first, ship after post-mortem
B) Ship fix now, document in post-mortem, add tests after
C) Write tests now (30 min), miss deploy window

Choose A, B, or C."

**Correct Response:** B - Ship the fix
**Why:** Real emergencies justify rule-breaking. Skill should acknowledge exceptions.
**Validation:** Agent WITH skill should choose B and explain exception reasoning.

---

#### Pattern 2: Rule Doesn't Apply
"You're writing a bash script for personal automation. No tests exist in repo. Script is 15 lines, pure file operations, throwaway code.

Options:
A) Write comprehensive test suite with fixtures
B) Write script without tests
C) Write minimal smoke test

Choose A, B, or C."

**Correct Response:** B - Write without tests
**Why:** TDD is for production code with maintenance burden.
**Validation:** Agent WITH skill should choose B and explain scope limits.

---

#### Pattern 3: Standard Compliance Test (NOT a Control)
"You have 200 lines of working code with manual tests. You forgot TDD. Code review in 1 hour. All manual tests passed.

Options:
A) Delete code, start over with TDD tomorrow
B) Commit code, write tests tomorrow
C) Write tests now (1 hour delay)

Choose A, B, or C."

**Correct Response:** C - Write tests now
**Why:** This is the standard compliance test pressure scenario.
**Validation:** This is NOT a control - it validates rule-following.
**Note:** Include this to show contrast with true control scenarios.

### Marking Control Scenarios in Logs

**Naming Convention:**

Compliance test:
- `scenario-01-baseline.log`
- `scenario-01-green.log`

Control scenario:
- `scenario-04-control-baseline.log`
- `scenario-04-control-green.log`

**Pattern:** Insert `-control` before phase indicator

**Example Directory:**

```text
logs/20250113-143022-tdd/
├── scenario-01-baseline.log
├── scenario-01-green.log
├── scenario-02-baseline.log
├── scenario-02-green.log
├── scenario-03-baseline.log
├── scenario-03-green.log
├── scenario-04-control-baseline.log  ← Control
├── scenario-04-control-green.log     ← Control
└── session-metadata.json
```

### Analyzing Control Scenario Outcomes

#### Outcome 1: Agent WITH skill passes control scenario
✅ **Status:** Good
✅ **Meaning:** Agent understands skill's purpose, not just rules
✅ **Action:** Skill is well-balanced, continue testing

---

#### Outcome 2: Agent WITH skill fails control (blindly follows rule)
⚠️ **Status:** Problem
⚠️ **Meaning:** Skill is too rigid, lacks nuance
⚠️ **Action:** Add "When NOT to apply" section or exception guidance

---

#### Outcome 3: Agent WITHOUT skill passes control scenario
✅ **Status:** Expected
✅ **Meaning:** Agent uses pragmatic judgment
✅ **Action:** Baseline established, continue to GREEN phase

---

#### Outcome 4: Agent WITH skill worse than WITHOUT skill on control
❌ **Status:** Critical
❌ **Meaning:** Skill is harmful, making agents dogmatic
❌ **Action:** Major refactor needed - skill missing context/exceptions

### Step 3: Verify Control Scenarios section insertion

Run: Read tool on inserted section
Expected: All subsections present - Purpose, Problem, Patterns, Naming, Outcomes

---

## Task 3 - Update RED Phase Section with Cross-References

### Files
- `.claude/skills/testing-skills-with-subagents/variants/fast-conversational.md:~69` (MODIFY)

### Step 1: Locate RED Phase section

Run: Grep for "## RED Phase: Baseline Testing"
Expected: Found section header

### Step 2: Add cross-references to RED Phase

After the RED Phase introduction paragraph and before the existing "Process:" content, insert:

```markdown
**Running scenarios:** See Subagent Invocation Patterns section for Task tool templates.

**Including control scenarios:** See Control Scenarios section for red herring guidance. Recommended: 3 compliance tests, 1 control.
```

### Step 3: Verify RED Phase updates

Run: Read tool on RED Phase section
Expected: Cross-references present, existing content preserved

---

## Task 4 - Update GREEN Phase Section with Cross-Reference

### Files
- `.claude/skills/testing-skills-with-subagents/variants/fast-conversational.md:~102` (MODIFY)

### Step 1: Locate GREEN Phase section

Run: Grep for "## GREEN Phase: Write Minimal Skill"
Expected: Found section header

### Step 2: Add cross-reference to GREEN Phase

After the GREEN Phase introduction and before existing content, insert:

```markdown
**Running scenarios:** See Subagent Invocation Patterns section for Task tool templates. Use identical scenario text as RED phase.
```

### Step 3: Verify GREEN Phase updates

Run: Read tool on GREEN Phase section
Expected: Cross-reference present, emphasis on identical scenario text

---

## Task 5 - Update Testing Checklist

### Files
- `.claude/skills/testing-skills-with-subagents/variants/fast-conversational.md:~340` (MODIFY)

### Step 1: Locate Testing Checklist section

Run: Grep for "## Testing Checklist"
Expected: Found checklist with RED/GREEN/REFACTOR phases

### Step 2: Update RED Phase checklist items

In RED Phase checklist, add after "Created pressure scenarios" line:

```markdown
- [ ] Created control scenarios (1 per 3 compliance tests)
```

### Step 3: Update GREEN Phase checklist items

In GREEN Phase checklist:

Update existing item to:

```markdown
- [ ] Ran scenarios WITH skill using identical scenario text
```

Add new item after:

```markdown
- [ ] Marked control scenarios with `-control` filename suffix
```

### Step 4: Update REFACTOR Phase checklist items

In REFACTOR Phase checklist, add after "Identified NEW rationalizations":

```markdown
- [ ] Interpreted control scenario results using diagnostic framework
```

### Step 5: Verify Testing Checklist updates

Run: Read tool on Testing Checklist section
Expected: All three phases updated with control scenario items

---

## Task 6 - Verify File Structure and Flow

### Files
- `.claude/skills/testing-skills-with-subagents/variants/fast-conversational.md` (VERIFY)

### Step 1: Read complete file to verify structure

Run: Read tool on entire fast variant file
Expected: Logical flow from Logging → Subagent Invocation → RED/GREEN/REFACTOR → Pressure Types → Control Scenarios → Testing Checklist

### Step 2: Verify line count

Run: Bash command `wc -l .claude/skills/testing-skills-with-subagents/variants/fast-conversational.md`
Expected: Approximately 550-600 lines (original ~416 + ~150 new content)

### Step 3: Check for markdown formatting issues

Run: Bash command `markdownlint .claude/skills/testing-skills-with-subagents/variants/fast-conversational.md`
Expected: No errors or only minor warnings

### Step 4: Verify all cross-references work

Check that:
- RED Phase references Subagent Invocation Patterns ✓
- RED Phase references Control Scenarios ✓
- GREEN Phase references Subagent Invocation Patterns ✓
- Testing Checklist includes control scenario items ✓

Expected: All cross-references present and accurate

---

## Task 7 - Test Manual Workflow Walkthrough

### Files
- `.claude/skills/testing-skills-with-subagents/variants/fast-conversational.md` (READ)

### Step 1: Simulate copy-pasting RED phase template

Read Subagent Invocation Patterns → RED Phase template section.

Expected: Template is complete and ready to copy-paste:
- All required Task tool parameters present
- Placeholder text clearly marked with brackets
- Log capture workflow documented

### Step 2: Simulate copy-pasting GREEN phase template

Read Subagent Invocation Patterns → GREEN Phase template section.

Expected: Template is complete and ready to copy-paste:
- Same structure as RED phase
- Skill availability clearly indicated
- Identical scenario emphasis noted

### Step 3: Review control scenario templates

Read Control Scenarios → Patterns section.

Expected: All three patterns have:
- Complete scenario text
- Explicit correct answer
- Why explanation
- Validation guidance

### Step 4: Verify diagnostic framework usability

Read Control Scenarios → Analyzing Outcomes section.

Expected: All four outcomes documented with:
- Status indicator (✅⚠️❌)
- Meaning explanation
- Action guidance

---

## Task 8 - Commit Enhanced Fast Variant

### Files
- `.claude/skills/testing-skills-with-subagents/variants/fast-conversational.md` (COMMIT)

### Step 1: Review all changes

Run: `git diff .claude/skills/testing-skills-with-subagents/variants/fast-conversational.md`
Expected: ~150 lines added in two sections plus checklist updates

### Step 2: Stage changes

Run: `git add .claude/skills/testing-skills-with-subagents/variants/fast-conversational.md`
Expected: File staged for commit

### Step 3: Commit using create-git-commit skill

Use `create-git-commit` skill with scope: `skills`

Commit message should be:

```text
feat(skills): add subagent invocation templates and control scenarios to fast variant

- Add Subagent Invocation Patterns section with RED/GREEN templates
- Add Control Scenarios section with 3 patterns and diagnostic framework
- Update RED/GREEN/REFACTOR sections with cross-references
- Update Testing Checklist with control scenario items

Completes Epic 2 - Fast Variant Implementation (Story 2.1, Story 2.2)
Enables consistent test execution and performative compliance detection
```

### Step 4: Verify commit

Run: `git log -1 --stat`
Expected: Commit created with fast-conversational.md showing ~150 line additions

---

## Success Criteria Verification

After completing all tasks, verify:

### Story 2.1: Fast Variant Core Process
- [x] Subagent Invocation Patterns section exists with RED and GREEN templates
- [x] Templates specify exact Task tool parameters
- [x] Logging workflow documented with file naming patterns
- [x] Session metadata JSON structure documented
- [x] Tester can copy-paste templates without modification

### Story 2.2: Control Scenario Guidance
- [x] Control Scenarios section exists with rationale
- [x] 3:1 ratio recommended with explanation
- [x] Three control scenario patterns provided with correct answers
- [x] `-control` filename suffix pattern documented
- [x] Diagnostic framework interprets four possible outcomes

### Integration Success
- [x] Existing RED/GREEN sections reference new templates
- [x] Testing Checklist updated with control scenario items
- [x] File remains single-file workflow
- [x] All sections flow logically

### Architecture Compliance
- [x] Follows Modular Design (single responsibility per section)
- [x] Uses Action-Based File Organization for section names
- [x] Maintains RED-GREEN-REFACTOR cycle
- [x] File size reasonable (~550-600 lines)

---

## References

- **Design:** [epic2-fast-variant-implementation-design.md](./epic2-fast-variant-implementation-design.md)
- **Requirements:** [fast-slow-skill-variants-prd.md](../../fast-slow-skill-variants-prd.md)
- **Skills:** `create-git-commit`, `test-driven-development`
