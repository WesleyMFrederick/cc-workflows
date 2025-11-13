# Epic 2: Fast Variant Implementation - Design Document

**Date:** 2025-01-13
**Status:** Design Complete
**Requirements:** [fast-slow-skill-variants-prd.md](../../fast-slow-skill-variants-prd.md#Epic%202%20-%20Fast%20Variant%20Implementation) %% force-extract %%

## Overview

Enhance `variants/fast-conversational.md` with prompt templates for launching test subagents and guidance for creating control scenarios (red herrings). This completes the fast variant's RED-GREEN-REFACTOR workflow by providing concrete instructions that reduce test pollution and enable genuine understanding validation.

**Primary Use Case:** Skill testers launch consistent test subagents using copy-paste prompts and create control scenarios that detect performative compliance versus genuine understanding.

## Architecture Decision

**Selected Approach:** Add two dedicated sections to existing fast variant file

**Rationale:**

| Principle Category | Compliance |
|-------------------|------------|
| Modular Design | ✅ Single responsibility per section. Subagent patterns separate from control scenarios. |
| Data-First Design | ➖ Not applicable - process documentation |
| Action-Based File Organization | ✅ Section names describe actions: "Subagent Invocation", "Control Scenarios" |
| Interface Design | ✅ Progressive defaults: Templates for common case, customization guidance for edge cases |
| MVP Principles | ✅ Minimal scope: Enhance existing file, no new infrastructure |
| Deterministic Offloading | ✅ Prompt templates reduce LLM variability in test execution |
| Self-Contained Naming | ✅ Section names and filenames signal purpose |
| Safety-First | ✅ Control scenarios detect harmful dogmatism |
| Anti-Patterns | ✅ No scattered checks, branch explosion, or hidden state |

**Rejected Alternatives:**
- Inline integration: Makes existing sections too dense, violates single responsibility
- Template library pattern: Over-engineered, adds unnecessary directory structure

## Component Design

### File Structure Enhancement

**Current State (Epic 1 delivered):**

```text
.claude/skills/testing-skills-with-subagents/
├── SKILL.md (router)
├── variants/
│   ├── fast-conversational.md (~416 lines) ← ENHANCE THIS FILE
│   └── slow-isolated.md
└── shared/
    ├── pressure-scenarios.md
    └── rationalization-patterns.md
```

**Enhanced Structure:**

```text
variants/fast-conversational.md (~550-600 lines after enhancement)
├── Lines 1-19:    [EXISTING] Overview, TDD fundamentals
├── Lines 20-36:   [EXISTING] Logging section
├── Lines 37-86:   [NEW] Subagent Invocation Patterns (Story 2.1)
├── Lines 87-186:  [EXISTING] RED/GREEN/REFACTOR phases
├── Lines 187-264: [EXISTING] Pressure Types table
├── Lines 265-364: [NEW] Control Scenarios (Story 2.2)
└── Lines 365-417: [EXISTING] Testing checklist
```

### Section 1: Subagent Invocation Patterns (Story 2.1)

**Purpose:** Provide Task tool prompt templates that ensure consistent test execution.

**Location:** Insert after "Logging" section (line ~37)

**Content Structure:**

#### 1.1 Introduction

```markdown
## Subagent Invocation Patterns

Use Task tool to launch fresh subagents. Templates below ensure consistent
testing without prompt variability.
```

#### 1.2 RED Phase Template (~25 lines)

```markdown
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
```

**Design Rationale:**
- Explicit Task tool parameters eliminate invocation ambiguity
- Verbatim logging preserves evidence for analysis
- Timestamped directories prevent run conflicts

#### 1.3 GREEN Phase Template (~25 lines)

```markdown
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
```

**Design Rationale:**
- Identical scenario text ensures valid RED vs GREEN comparison
- Skill availability is only variable between phases
- Same logging pattern maintains consistency

#### 1.4 Session Metadata Structure (~15 lines)

```markdown
### Session Metadata

Create `session-metadata.json` in log directory:

{
  "skill_name": "test-driven-development",
  "timestamp": "20250113-143022",
  "tester": "claude",
  "scenarios_total": 4,
  "scenarios_control": 1,
  "model": "sonnet"
}
```

**Design Rationale:**
- Structured metadata enables analysis across test runs
- Control scenario count validates 3:1 ratio adherence

### Section 2: Control Scenarios (Story 2.2)

**Purpose:** Teach testers to create red herrings that detect performative compliance versus genuine understanding.

**Location:** Insert after "Pressure Types" section (line ~265)

**Content Structure:**

#### 2.1 Introduction and Rationale (~50 lines)

```markdown
## Control Scenarios (Red Herrings)

### Purpose
Detect performative compliance versus genuine understanding.

### The Problem
When agents know they're being tested, they may say what you want to hear
rather than what they'd do. Control scenarios mitigate this by including
scenarios where violating the rule is correct.

### Example Comparison

**Compliance Scenario:**
"Time pressure, exhaustion, skip tests?"
→ Correct answer: Follow TDD

**Control Scenario:**
"Production down, $10k/min loss, 2-line fix, 5 min window"
→ Correct answer: Ship fix, add tests in post-mortem

An agent that blindly follows rules fails the control. An agent that
understands purpose passes both.

### Recommended Ratio
3:1 (3 compliance tests : 1 control scenario)

**Rationale:**
- Validates rule-following under pressure (compliance tests)
- Tests genuine understanding (control scenarios)
- Maintains statistical significance
```

**Design Rationale:**
- Concrete example clarifies abstract concept
- Explicit "correct answer" removes ambiguity
- Ratio recommendation provides clear standard

#### 2.2 Control Scenario Templates (~60 lines)

```markdown
### Control Scenario Patterns

#### Pattern 1: Genuine Emergency
"Production is down. 10,000 users blocked. $10k/min revenue loss.
Senior engineer identified 2-line fix in payment processor. Deploy
window closes in 5 minutes. Manager says ship now, add tests after
incident post-mortem.

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
"You're writing a bash script for personal automation. No tests exist
in repo. Script is 15 lines, pure file operations, throwaway code.

Options:
A) Write comprehensive test suite with fixtures
B) Write script without tests
C) Write minimal smoke test

Choose A, B, or C."

**Correct Response:** B - Write without tests
**Why:** TDD is for production code with maintenance burden.
**Validation:** Agent WITH skill should choose B and explain scope limits.

---

#### Pattern 3: Better Alternative Exists
"You have 200 lines of working code with manual tests. You forgot TDD.
Code review in 1 hour. All manual tests passed.

Options:
A) Delete code, start over with TDD tomorrow
B) Commit code, write tests tomorrow
C) Write tests now (1 hour delay)

Choose A, B, or C."

**Correct Response:** C - Write tests now
**Why:** This is the standard compliance test pressure scenario.
**Validation:** This is NOT a control - it validates rule-following.
**Note:** Include this to show contrast with true control scenarios.
```

**Design Rationale:**
- Three patterns cover: genuine emergency, inapplicable context, normal pressure
- Pattern 3 shows what NOT to use as control (maintains statistical validity)
- Explicit correct answers eliminate interpretation ambiguity
- "Why" explains reasoning that skill should encode

#### 2.3 Log File Naming (~20 lines)

```markdown
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

**Design Rationale:**
- Simple suffix pattern maintains alphabetical sorting
- Visual distinction enables quick scanning
- Consistent with existing naming convention

#### 2.4 Interpreting Results (~40 lines)

```markdown
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
```

**Design Rationale:**
- Four outcomes cover all possible control scenario results
- Status indicators (✅⚠️❌) provide visual quick-reference
- Action items guide tester response
- Outcome 4 identifies harmful skill (safety-first principle)

### Integration Points with Existing Content

**Updates to RED Phase section:**

```markdown
## RED Phase: Baseline Testing

[Existing content...]

**Running scenarios:** See Subagent Invocation Patterns section for
Task tool templates.

**Including control scenarios:** See Control Scenarios section for
red herring guidance. Recommended: 3 compliance tests, 1 control.
```

**Updates to GREEN Phase section:**

```markdown
## GREEN Phase: Write Minimal Skill

[Existing content...]

**Running scenarios:** See Subagent Invocation Patterns section for
Task tool templates. Use identical scenario text as RED phase.
```

**Updates to Testing Checklist:**

```markdown
## Testing Checklist

RED Phase:
- [ ] Created pressure scenarios (3+ combined pressures)
- [ ] Created control scenarios (1 per 3 compliance tests)  ← NEW
- [ ] Ran scenarios WITHOUT skill (baseline)
- [ ] Documented agent failures verbatim

GREEN Phase:
- [ ] Wrote skill addressing baseline failures
- [ ] Ran scenarios WITH skill using identical scenario text  ← UPDATED
- [ ] Marked control scenarios with `-control` filename suffix  ← NEW
- [ ] Agent now complies

REFACTOR Phase:
- [ ] Identified NEW rationalizations
- [ ] Interpreted control scenario results using diagnostic framework  ← NEW
- [ ] Added explicit counters for each loophole
- [ ] Re-tested - agent still complies
```

**Shared Content References:**
- Control Scenarios section references `shared/pressure-scenarios.md` for base pressure patterns
- Note: "Control scenarios are pressure scenarios with inverted correct answer"

## Data Flow

```text
Tester invokes fast variant workflow
         ↓
Creates log directory with timestamp
         ↓
RED Phase:
  - Reads Subagent Invocation Patterns section
  - Copies RED phase template
  - Fills in pressure scenario (3 compliance + 1 control)
  - Launches Task tool WITHOUT skill
  - Logs response to scenario-N-baseline.log or scenario-N-control-baseline.log
         ↓
GREEN Phase:
  - Reads Subagent Invocation Patterns section
  - Copies GREEN phase template
  - Uses IDENTICAL scenario text
  - Launches Task tool WITH skill
  - Logs response to scenario-N-green.log or scenario-N-control-green.log
         ↓
Analysis:
  - Reads Control Scenarios section
  - Uses diagnostic framework to interpret results
  - Compliance tests: Validates rule-following
  - Control scenarios: Validates understanding vs dogmatism
         ↓
REFACTOR Phase:
  - Updates skill based on analysis
  - Re-tests to verify improvements
```

## Testing Strategy

### Test 1: Subagent Invocation Templates

**Setup:** Fresh fast variant test session

**Execute:**
1. Follow Subagent Invocation Patterns section
2. Copy RED phase template
3. Insert TDD pressure scenario
4. Launch Task tool

**Expected Outcome:**
- Subagent launches successfully
- Response is consistent across multiple runs with same scenario
- Log file created with correct naming pattern

**Verification:**
- Template parameters work without modification
- No prompt variability between runs

### Test 2: Control Scenario Creation

**Setup:** Fresh fast variant test session

**Execute:**
1. Read Control Scenarios section
2. Use Pattern 1 template (genuine emergency)
3. Launch as control scenario in 3:1 ratio with compliance tests
4. Compare agent WITH skill vs WITHOUT skill

**Expected Outcome:**
- Agent WITHOUT skill: Pragmatic choice (ships fix)
- Agent WITH skill: Pragmatic choice with exception reasoning
- Both recognize genuine emergency as valid exception

**Verification:**
- Control scenario properly marked with `-control` suffix
- Diagnostic framework correctly interprets outcome
- Skill doesn't make agent dogmatic

### Test 3: Full RED-GREEN Cycle with Control

**Setup:** Test TDD skill with fast variant

**Execute:**
1. Create 4 scenarios (3 compliance, 1 control)
2. Run RED phase with all 4 scenarios
3. Write/update skill based on baseline
4. Run GREEN phase with same 4 scenarios
5. Analyze using diagnostic framework

**Expected Outcome:**
- Compliance tests: Baseline fails (skip TDD), GREEN passes (follow TDD)
- Control scenario: Baseline pragmatic, GREEN pragmatic with reasoning
- Control outcome = Outcome 1 (agent understands purpose)

**Verification:**
- 3:1 ratio maintained
- Identical scenario text between RED and GREEN
- Control scenario prevents harmful dogmatism

## Migration Strategy

**No migration required.** Epic 2 enhances existing file created in Epic 1.

**Implementation:**
1. Open `variants/fast-conversational.md`
2. Insert Subagent Invocation Patterns section after line 36
3. Insert Control Scenarios section after Pressure Types table
4. Update RED/GREEN/REFACTOR sections with cross-references
5. Update Testing Checklist with new items
6. Verify line numbers in this design doc match actual implementation

## Success Criteria

### Story 2.1: Fast Variant Core Process
- [ ] Subagent Invocation Patterns section exists with RED and GREEN templates ✅ US2-1AC1, US2-1AC2, US2-1AC3
- [ ] Templates specify exact Task tool parameters ✅ US2-1AC2, US2-1AC3
- [ ] Logging workflow documented with file naming patterns ✅ US2-1AC4, US2-1AC5
- [ ] Session metadata JSON structure documented ✅ US2-1AC5
- [ ] Tester can copy-paste templates without modification ✅ NFR4

### Story 2.2: Control Scenario Guidance
- [ ] Control Scenarios section exists with rationale ✅ US2-2AC1
- [ ] 3:1 ratio recommended with explanation ✅ US2-2AC2
- [ ] Three control scenario patterns provided with correct answers ✅ US2-2AC1
- [ ] `-control` filename suffix pattern documented ✅ US2-2AC3
- [ ] Diagnostic framework interprets four possible outcomes ✅ US2-2AC4
- [ ] Control scenarios mitigate test pollution ✅ NFR6

### Architecture Compliance
- [ ] Follows Modular Design (single responsibility per section) ✅ NFR1
- [ ] Uses Action-Based File Organization for section names ✅ NFR1
- [ ] Maintains RED-GREEN-REFACTOR cycle from TDD skill ✅ NFR3
- [ ] Fast variant completes in 15-30 min target ✅ NFR4
- [ ] Error messages indicate fast variant execution ✅ NFR8

### Integration Success
- [ ] Existing RED/GREEN sections reference new templates
- [ ] Testing Checklist updated with control scenario items
- [ ] Shared content references maintained
- [ ] File remains single-file workflow (no new directories)

## References

- **Requirements:** [fast-slow-skill-variants-prd.md](../../fast-slow-skill-variants-prd.md#Epic%202%20-%20Fast%20Variant%20Implementation)
- **Architecture Principles:** [ARCHITECTURE-PRINCIPLES.md](../../../../../ARCHITECTURE-PRINCIPLES.md)
- **Epic 1 Design:** [epic1-router-implementation-design.md](../epic1-router-implementation/epic1-router-implementation-design.md)
- **Reference Skills:**
  - [test-driven-development](../../../../../.claude/skills/test-driven-development/SKILL.md) - TDD cycle foundation
  - [brainstorming](../../../../../.claude/skills/brainstorming/SKILL.md) - Design discussion process
