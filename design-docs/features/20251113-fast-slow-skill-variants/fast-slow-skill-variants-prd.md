# Fast and Slow Variants for Skill Testing - Requirements

<critical-instruction>
- Run `citation-manager extract links` when first reading this file to gather context from related links.
- Use Read tool to read non-markdown related files
</critical-instruction>

## Introduction

Add fast and slow testing variants to the testing-skills-with-subagents skill to support different testing workflows. The fast variant enables rapid iteration through conversational testing with subagents and lightweight logging, while the slow variant provides rigorous validation through worktree-based isolation and full infrastructure.

**Solution**: Create an explicit choice router in the main SKILL.md that asks users to choose between fast and slow variants, then routes to the appropriate variant implementation file. Both variants share common content (pressure scenarios, rationalization patterns) while implementing distinct testing approaches.

**Impact**: Enables developers to choose appropriate testing rigor based on development phase - fast iteration during skill development, rigorous validation before deployment - with clear trade-offs documented and explicit user control.

## Inputs

This requirements document depends on the following context:

### Existing Skills

- [testing-skills-with-subagents (project-local)](../../../.claude/skills/testing-skills-with-subagents/SKILL.md) - Current slow variant with worktree infrastructure
- **testing-skills-with-subagents (global)** at `~/.claude/plugins/cache/superpowers/skills/testing-skills-with-subagents/SKILL.md` - Current fast variant with conversational approach

### Architecture & Design

- [ARCHITECTURE.md](../../../ARCHITECTURE.md#Code%20Organization%20and%20Structure) - File organization and naming conventions
- [ARCHITECTURE-PRINCIPLES.md](../../../ARCHITECTURE-PRINCIPLES.md) %% force-extract %% - Architecture patterns to follow

### Related Skills

- [test-driven-development](../../../.claude/skills/test-driven-development/SKILL.md) - Foundational RED-GREEN-REFACTOR cycle
- [brainstorming](../../../.claude/skills/brainstorming/SKILL.md) - Design discussion process used to create this PRD

## Functional Requirements

### Router Functionality

- **FR1**: The main SKILL.md SHALL use AskUserQuestion tool to present variant choice question. ^FR1
- **FR2**: The question SHALL ask for variant choice with options: "Fast: Conversational testing" and "Slow: Worktree-based testing". ^FR2
- **FR3**: The router SHALL include the selected variant's content after receiving user answer. ^FR3
- **FR4**: The router SHALL NOT make automatic routing decisions. ^FR4

### Fast Variant Requirements

- **FR6**: The fast variant SHALL create log directories in `.claude/skills/testing-skills-with-subagents/logs/YYYYMMDD-HHMMSS-{skill-name}/` format. ^FR6
- **FR7**: The fast variant SHALL launch subagents WITHOUT skill reference for RED phase baseline testing. ^FR7
- **FR8**: The fast variant SHALL launch subagents WITH skill reference for GREEN phase testing. ^FR8
- **FR9**: The fast variant SHALL include control scenarios (red herrings) at 1:3 ratio with compliance tests. ^FR9
- **FR10**: The fast variant SHALL log baseline responses to `baseline-scenario-N.log` files. ^FR10
- **FR11**: The fast variant SHALL log green responses to `green-scenario-N.log` files. ^FR11
- **FR12**: The fast variant SHALL capture session metadata including skill name, timestamp, and tester context. ^FR12

### Slow Variant Requirements

- **FR13**: The slow variant SHALL create eval directories in `evals/scenario-N-{name}/` format. ^FR13
- **FR14**: The slow variant SHALL create baseline worktrees using `git worktree add .worktrees/scenario-N-baseline`. ^FR14
- **FR15**: The slow variant SHALL create green worktrees using `git worktree add .worktrees/scenario-N-green`. ^FR15
- **FR16**: The slow variant SHALL remove the skill being tested from baseline worktrees. ^FR16
- **FR17**: The slow variant SHALL verify skill presence/absence via SessionStart hook output. ^FR17
- **FR18**: The slow variant SHALL run Claude in isolated worktrees with logs piped to main repo. ^FR18
- **FR19**: The slow variant SHALL provide cleanup commands to remove worktrees and branches after testing. ^FR19

### Shared Content Requirements

- **FR20**: Both variants SHALL reference shared pressure scenarios from `shared/pressure-scenarios.md`. ^FR20
- **FR21**: Both variants SHALL reference shared rationalization patterns from `shared/rationalization-patterns.md`. ^FR21
- **FR22**: Shared content SHALL eliminate duplication between variants. ^FR22

## Non-Functional Requirements

- **NFR1**: Follow Action-Based File Organization principle for variant file naming. ^NFR1
- **NFR2**: The router SHALL be transparent about which variant was chosen. ^NFR2
- **NFR3**: Both variants SHALL follow the same RED-GREEN-REFACTOR cycle from test-driven-development skill. ^NFR3
- **NFR4**: Fast variant SHALL complete RED-GREEN cycle in 15-30 minutes. ^NFR4
- **NFR5**: Slow variant SHALL complete RED-GREEN cycle in 45-90 minutes. ^NFR5
- **NFR6**: Control scenarios SHALL mitigate test pollution by testing genuine understanding vs performative compliance. ^NFR6
- **NFR7**: The design SHALL enable easy addition of new variants without modifying existing variants. ^NFR7
- **NFR8**: Error messages SHALL clearly indicate which variant is executing. ^NFR8

## Whiteboard: Design Discussion

### Architectural Approach: "Explicit Choice Router"

Based on the brainstorming session, we selected an explicit choice router pattern over automatic routing or layered validation approaches.

**Structure:**

```plaintext
.claude/skills/testing-skills-with-subagents/
├── SKILL.md (router with AskUserQuestion flow, ~150 lines)
├── variants/
│   ├── fast-conversational.md (~250 lines)
│   └── slow-isolated.md (~400 lines)
├── shared/
│   ├── pressure-scenarios.md
│   └── rationalization-patterns.md
└── design-docs/
    └── features/
        └── 20251113-fast-slow-variants/
            └── fast-slow-variants-prd.md (this file)
```

### Execution Flow

**Main SKILL.md orchestrates:**

1. **Skill announces usage** (per brainstorming skill pattern)
2. **Variant choice question:**

   ```yaml
   Question: "Which testing variant do you want to use?"
   Options:
     - "Fast: Conversational testing with control scenarios (quick iteration)"
     - "Slow: Worktree-based isolated testing (rigorous validation)"
   ```

3. **Route to variant file** - Include selected variant content
4. **Variant executes** its full RED-GREEN-REFACTOR process

### Router Responsibilities

**SKILL.md handles:**
- Announce skill usage
- Ask variant choice question
- Route to appropriate variant
- **Does NOT**: Make automatic decisions, analyze context, or inject logic

### Variant Responsibilities

**fast-conversational.md and slow-isolated.md handle:**
- Complete RED-GREEN-REFACTOR process
- Variant-specific infrastructure setup
- Success criteria and verification
- **Does NOT**: Ask routing questions (router handles that)

### Shared Content Strategy

**shared/pressure-scenarios.md contains:**
- Pressure types taxonomy (time, sunk cost, authority, economic, exhaustion, social, pragmatic)
- Template library for common scenarios
- Guidelines for combining 3+ pressures
- Red-herring scenario patterns for control testing

**shared/rationalization-patterns.md contains:**
- Common rationalization categories
- Counter-argument templates
- "Red flags" language patterns
- Meta-testing question templates

**Rationale:** Both variants use the same pressure patterns and rationalization detection - only the execution mechanism differs.

### Variant Trade-offs

| Aspect | Fast Variant | Slow Variant |
|--------|-------------|--------------|
| **Infrastructure** | Lightweight logging to `.claude/skills/.../logs/` | Full worktree + sandbox isolation |
| **Test Method** | Conversational: Ask subagent hypotheticals | Execution: Run subagent in isolated environment |
| **Pollution Mitigation** | Control scenarios (3:1 ratio) | True isolation prevents pollution |
| **Time Investment** | 15-30 min per iteration | 45-90 min per iteration |
| **Confidence Level** | Quick feedback, moderate confidence | High confidence, deployment-ready |
| **Best For** | Early iteration, hypothesis testing | Pre-deployment validation, critical skills |

### Control Scenario Pattern (Fast Variant)

To mitigate test pollution (subagents saying what they think you want vs. what they'd actually do), the fast variant uses control scenarios:

```markdown
Scenario Set Example:
1. [Compliance] TDD violation under time pressure → Should follow TDD
2. [Compliance] TDD violation with sunk cost → Should follow TDD
3. [Compliance] TDD violation with exhaustion → Should follow TDD
4. [Red Herring] Critical prod fix, tests would delay recovery → Breaking TDD is correct choice
```

**Rationale:** Red herrings test genuine understanding vs. performative compliance. An agent that blindly follows rules will fail the control scenario.

### Fast Variant Logging Format

```plaintext
logs/20250113-143022-tdd-skill/
├── session-metadata.json
├── baseline-scenario-1.log
├── baseline-scenario-2.log
├── baseline-scenario-3.log
├── baseline-scenario-4-control.log
├── green-scenario-1.log
├── green-scenario-2.log
├── green-scenario-3.log
├── green-scenario-4-control.log
└── refactor-iteration-1/
    ├── green-scenario-1.log
    └── ...
```

### Slow Variant Infrastructure

**Setup creates:**
- Eval directory: `evals/scenario-N-{name}/`
- Scenario metadata: `scenario.md`
- Baseline worktree: `.worktrees/scenario-N-baseline` (skill removed)
- Green worktree: `.worktrees/scenario-N-green` (skill present)

**Key difference from fast:** True filesystem isolation + separate Claude instances = no test pollution possible.

**Cleanup removes:**
- Worktrees via `git worktree remove --force`
- Branches via `git branch -D`
- Logs persist in main repo for analysis

### Design Rationale

**Why explicit choice vs. automatic routing?**
- User knows their time/risk constraints better than heuristics
- Teaches decision-making through repeated choices
- No "magic" that could route incorrectly
- Aligns with project's preference for explicit over implicit

**Why single question instead of multiple?**
- User knows what they need (fast iteration vs rigorous validation)
- Reduces friction - get to testing faster
- Variant descriptions contain enough information to choose appropriately
- Simpler implementation and user experience

**Why control scenarios for fast variant?**
- Mitigates test pollution (performative vs. genuine compliance)
- Tests understanding, not just rule-following
- Lightweight compared to full isolation
- 3:1 ratio provides good signal without excessive overhead

**Why separate variant files vs. conditional logic?**
- Cleaner separation of concerns
- Easier to maintain distinct processes
- Simpler to add new variants later
- No complex branching in main skill

### Migration Path

**From current project-local skill:**
- Current SKILL.md becomes `variants/slow-isolated.md` with minor updates
- Supporting files (infrastructure-setup.md, running-tests.md) move to slow variant

**From current global skill:**
- Extract conversational testing approach
- Add control scenario guidance
- Add lightweight logging infrastructure
- Becomes `variants/fast-conversational.md`

**New main SKILL.md:**
- Implements router with single AskUserQuestion call
- Routes to variants based on explicit choice
- Minimal orchestration logic

## Epic 1 - Router Implementation

Implement the main SKILL.md router that presents variant choice question, then routes to the appropriate variant file.

_Implement Plan_: [epic1-router-implementation-plan](user-stories/epic1-router-implementation/epic1-router-implementation-plan.md)
_git Commit_: 5072edeb25cc7f6c7cbbe2920acf7e1e182ae927
_Status_: ✅ Completed 11-13-2025

### Story 1.1: Create Router with Question Flow

**As a** skill tester,
**I want** the skill to ask me which variant to use,
**so that** I can explicitly choose the appropriate testing approach.

#### Acceptance Criteria

1. WHEN I invoke the skill, THEN it SHALL announce "I'm using the testing-skills-with-subagents skill". ^US1-1AC1
2. WHEN the skill starts, THEN it SHALL present the variant question with 2 options via AskUserQuestion tool. ^US1-1AC2
3. WHEN I select a variant, THEN the skill SHALL include the content from the selected variant file. ^US1-1AC3
4. IF the variant file doesn't exist, THEN the skill SHALL display a clear error message. ^US1-1AC4

_Depends On_: None
_Functional Requirements_: [[#^FR1|FR1]], [[#^FR2|FR2]], [[#^FR3|FR3]], [[#^FR4|FR4]]
_Non-Functional Requirements_: [[#^NFR2|NFR2]], [[#^NFR8|NFR8]]
_git Commit_: 5072edeb25cc7f6c7cbbe2920acf7e1e182ae927
_status_: ✅ Completed 11-13-2025

### Story 1.2: Create Variant Directory Structure

**As a** skill maintainer,
**I want** variant files organized in a dedicated directory,
**so that** the structure is clear and extensible.

#### Acceptance Criteria

1. WHEN the skill is deployed, THEN there SHALL be a `variants/` directory containing variant files. ^US1-2AC1
2. WHEN the skill is deployed, THEN there SHALL be a `shared/` directory containing common content. ^US1-2AC2
3. WHEN new variants are added, THEN they SHALL be placed in the `variants/` directory. ^US1-2AC3

_Depends On_: None
_Functional Requirements_: [[#^FR22|FR22]]
_Non-Functional Requirements_: [[#^NFR1|NFR1]], [[#^NFR7|NFR7]]
_git Commit_: 5072edeb25cc7f6c7cbbe2920acf7e1e182ae927
_status_: ✅ Completed 11-13-2025

## Epic 2 - Fast Variant Implementation

Implement the fast variant with conversational testing, control scenarios, and lightweight logging.

### Story 2.1: Implement Fast Variant Core Process

**As a** skill tester doing rapid iteration,
**I want** to test skills conversationally with quick turnaround,
**so that** I can iterate on skill content efficiently.

#### Acceptance Criteria

1. WHEN the fast variant executes, THEN it SHALL create a timestamped log directory. ^US2-1AC1
2. WHEN I run RED phase, THEN the variant SHALL launch subagents WITHOUT skill reference. ^US2-1AC2
3. WHEN I run GREEN phase, THEN the variant SHALL launch subagents WITH skill reference. ^US2-1AC3
4. WHEN subagent responses are captured, THEN they SHALL be saved to scenario-specific log files. ^US2-1AC4
5. WHEN the process completes, THEN I SHALL be able to review all logs in the timestamped directory. ^US2-1AC5

_Depends On_: [[#Story 1.1 Create Router with Question Flow|Story 1.1]]
_Functional Requirements_: [[#^FR6|FR6]], [[#^FR7|FR7]], [[#^FR8|FR8]], [[#^FR10|FR10]], [[#^FR11|FR11]], [[#^FR12|FR12]]
_Non-Functional Requirements_: [[#^NFR3|NFR3]], [[#^NFR4|NFR4]]

### Story 2.2: Add Control Scenario Guidance

**As a** skill tester using the fast variant,
**I want** guidance on creating control scenarios (red herrings),
**so that** I can detect performative compliance vs. genuine understanding.

#### Acceptance Criteria

1. WHEN I use the fast variant, THEN it SHALL include instructions for creating control scenarios. ^US2-2AC1
2. WHEN I create a scenario set, THEN the guidance SHALL recommend a 3:1 ratio of compliance tests to red herrings. ^US2-2AC2
3. WHEN I log control scenarios, THEN they SHALL be clearly marked as control scenarios in the filename. ^US2-2AC3
4. WHEN I analyze results, THEN the variant SHALL provide guidance on interpreting control scenario outcomes. ^US2-2AC4

_Depends On_: [[#Story 2.1 Implement Fast Variant Core Process|Story 2.1]]
_Functional Requirements_: [[#^FR9|FR9]]
_Non-Functional Requirements_: [[#^NFR6|NFR6]]

## Epic 3 - Slow Variant Implementation

Implement the slow variant with worktree isolation, full infrastructure, and rigorous validation.

### Story 3.1: Migrate Existing Slow Variant to New Structure

**As a** skill maintainer,
**I want** the existing project-local skill moved to the variants structure,
**so that** it integrates with the new router.

#### Acceptance Criteria

1. WHEN the migration is complete, THEN the current SKILL.md content SHALL exist in `variants/slow-isolated.md`. ^US3-1AC1
2. WHEN the slow variant executes, THEN it SHALL create eval directories and worktrees as before. ^US3-1AC2
3. WHEN supporting files are needed, THEN they SHALL be referenced from their current locations. ^US3-1AC3
4. WHEN the migration is complete, THEN existing tests SHALL pass without modification. ^US3-1AC4

_Depends On_: [[#Story 1.1 Create Router with Question Flow|Story 1.1]]
_Functional Requirements_: [[#^FR13|FR13]], [[#^FR14|FR14]], [[#^FR15|FR15]], [[#^FR16|FR16]], [[#^FR17|FR17]], [[#^FR18|FR18]], [[#^FR19|FR19]]
_Non-Functional Requirements_: [[#^NFR3|NFR3]], [[#^NFR5|NFR5]]

## Epic 4 - Shared Content

Extract and organize shared content used by both variants.

### Story 4.1: Create Shared Pressure Scenarios Library

**As a** skill tester using either variant,
**I want** access to a common library of pressure scenario patterns,
**so that** I can create effective tests without duplication.

#### Acceptance Criteria

1. WHEN I access either variant, THEN it SHALL reference `shared/pressure-scenarios.md`. ^US4-1AC1
2. WHEN I read the pressure scenarios file, THEN it SHALL contain pressure types taxonomy. ^US4-1AC2
3. WHEN I need scenario templates, THEN the file SHALL provide templates for common scenarios. ^US4-1AC3
4. WHEN I combine pressures, THEN the file SHALL provide guidelines for 3+ pressure combinations. ^US4-1AC4

_Depends On_: None
_Functional Requirements_: [[#^FR20|FR20]], [[#^FR22|FR22]]
_Non-Functional Requirements_: None

### Story 4.2: Create Shared Rationalization Patterns Library

**As a** skill tester using either variant,
**I want** access to common rationalization patterns and counters,
**so that** I can identify and address agent excuses consistently.

#### Acceptance Criteria

1. WHEN I access either variant, THEN it SHALL reference `shared/rationalization-patterns.md`. ^US4-2AC1
2. WHEN I need to identify rationalizations, THEN the file SHALL provide common rationalization categories. ^US4-2AC2
3. WHEN I need to counter rationalizations, THEN the file SHALL provide counter-argument templates. ^US4-2AC3
4. WHEN I need to detect rationalization language, THEN the file SHALL provide red flag patterns. ^US4-2AC4

_Depends On_: None
_Functional Requirements_: [[#^FR21|FR21]], [[#^FR22|FR22]]
_Non-Functional Requirements_: None
