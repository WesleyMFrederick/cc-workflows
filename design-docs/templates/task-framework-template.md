# Task Framework Template - Phase 2

> [!attention] **AI Task Framework Template Instructions**
> **CRITICAL**: This template is for Phase 2 - High-level task generation with agent assignments
> **CRITICAL**: Instructions for the AI are in callouts using this format: > [!attention] **AI {{task instruction title}}**
> **CRITICAL**: Goals for a document section are in callouts using this format: > [!done] **AI {{section}} Goal**
> **CRITICAL**: Content the AI must populate are in [single brackets]. [Further instructions on how to populate, style, and length of the content are in between the brackets]
> **CRTICAL**: Examples of content are in callouts using this format: > [!example] **AI {{section}} Example**
> **CRTICAL**: All other callouts and text outside of [brackets] are content that should be populated in the final document
>
> **Prime Directive #1: Agent-Centric Design.** Structure tasks to leverage specific agent capabilities. Match task complexity and scope to agent strengths.
>
> **Prime Directive #2: TDD Foundation.** Always lead with test infrastructure and testing tasks before implementation tasks. Follow RED-GREEN-REFACTOR cycles.
>
> **Prime Directive #3: Atomic Task Requirements.** Each task must be a complete, testable unit with specific file scope (1-5 files maximum) and single purpose.
>
> **Prime Directive #4: Architectural Alignment.** Ensure all tasks align with architectural context and design principles from Phase 1.

## Phase 2 Progress Tracking

> [!attention] **AI Phase 2 Progress Instructions:**
> Update this section as you complete each step of Phase 2 task generation.

- [ ] **Step 1**: Phase 1 story context validated and loaded
- [ ] **Step 2**: Acceptance criteria analyzed for task generation
- [ ] **Step 3**: Architectural context reviewed for implementation approach
- [ ] **Step 4**: Task generation principles applied
- [ ] **Step 5**: High-level tasks created with agent assignments
- [ ] **Step 6**: Task validation completed against acceptance criteria
- [ ] **Step 7**: Phase 2 ready for Phase 3 task scoping

## Task Generation Framework

> [!done] **AI Task Generation Goal**
> **Convert Story into Agent-Friendly Task List**
> Transform the architectural context and acceptance criteria from Phase 1 into a structured task breakdown that leverages specific agent capabilities.

### Task Generation Principles

> [!attention] **AI Task Generation Principles Instructions:**
> Apply these principles when creating tasks:

#### Atomic Task Requirements (CRITICAL FOR AGENT EXECUTION)
- **File Scope**: Touches 1-5 related files maximum
- **Single Purpose**: One complete implementation unit per task
  - Multiple related edits allowed per task
  - All changes must work together toward one validation checkpoint
  - The validation test can be written in one clear and impactful sentence
- **Specific Files**: Must specify exact files to create/modify
- **Agent-Friendly**: Clear input/output with minimal context switching
- **Coding Task Focused**: Excludes any task that cannot be completed through writing/modifying/testing code
- **Hallucination Free**: All tasks and sub-tasks are derived from Phase 1 architectural context

#### Agent Assignment Guidelines

> [!attention] **AI Agent Assignment Instructions:**
> Match tasks to appropriate agents based on their capabilities:

- **`test-writer` Agent**: Test infrastructure, test creation, TDD setup, validation test implementation
- **`code-developer-agent` Agent**: Core implementation, class creation, method implementation, integration code
- **`application-tech-lead` Agent**: Architecture validation, pattern compliance, quality gates, course corrections
- **`qa-validation` Agent**: End-to-end validation, acceptance criteria verification, final testing

#### TDD Task Sequencing

> [!attention] **AI TDD Sequencing Instructions:**
> Structure tasks to follow proper Test-Driven Development cycles:

1. **Infrastructure Phase**: Test framework setup, utilities, mock creation
2. **Feature Phases**: For each major feature, follow RED-GREEN-REFACTOR:
   - RED: Create failing tests that define behavior
   - GREEN: Implement minimal code to pass tests
   - REFACTOR: Enhance implementation while maintaining tests
3. **Integration Phase**: End-to-end validation and quality gates

## High-Level Task Structure

> [!done] **AI Task Structure Goal**
> **Create Organized Task Breakdown**
> Structure tasks in logical phases that build progressively from infrastructure through feature implementation to validation.

### Task Format Template

> [!attention] **AI Task Format Instructions:**
> Use this exact format for each task:

```markdown
- [ ] **[Task Number]. [Task Name]** ^US[story-number]T[task-number]
  - **Agent**: [agent-name]
  - **Objective**: [Clear, specific objective for this task]
  - **Input**: [What exists or is required before starting this task]
  - **Output**: [Specific deliverable and completion criteria]
  - **Files**: 
    - `[file-path]` ([create | modify | update])
    - `[file-path]` ([create | modify | update])
  - **Scope**:
    - [Specific work item 1]
    - [Specific work item 2]
    - [Specific work item 3]
  - **Test**: [Expected test outcome or validation criteria]
  - **Commands**: `[npm commands or validation steps]`
  - _Requirements_: [[#^US[story-number]AC[number]|AC[number]]], [architectural references]
  - _Leverage_: `[existing files or components to build upon]`
  - _Implementation Details_: [Will be populated in Phase 4]
```

> [!example] **AI Task Format Example**
>
> ```markdown
> - [ ] **1. Configure Test Infrastructure** ^US1-1T1
>   - **Agent**: test-writer
>   - **Objective**: Configure Vitest for ES modules and create test utilities for directory management
>   - **Input**: Project structure from Phase 1 architectural context
>   - **Output**: Working test configuration with utilities for isolated testing
>   - **Files**: 
> 	  - `vitest.config.js` (create)
> 	  - `test/helpers/testUtils.js` (create)
>   - **Scope**:
>     - Configure Vitest for ES modules support
>     - Create test workspace utilities for isolation
>     - Add test script to package.json
>   - **Test**: ES modules import works in Vitest with isolated test workspaces
>   - **Commands**: `npm test`
>   - _Requirements_: [[#^US1-1AC1|AC1]], [[#^US1-1AC2|AC2]]
>   - _Leverage_: ES modules architecture from Phase 1
>   - _Implementation Details_: [Will be populated in Phase 4]
> ```

### Phase-Based Task Organization

> [!attention] **AI Phase Organization Instructions:**
> Organize tasks into these standard phases:

#### **Phase A: Test Infrastructure Setup**
[Tasks focused on test framework configuration, utilities, and foundation setup]

- [ ] **A.[number]. [Infrastructure Task Name]** ^US[story-number]TA[number]
  - [Follow task format template]

#### **Phase B: [Primary Feature Name] Implementation**
[Tasks focused on the main feature implementation using TDD cycles]

- [ ] **B.[number]. [Feature Task Name]** ^US[story-number]TB[number]
  - [Follow task format template]

#### **Phase C: [Secondary Feature Name] Implementation**
[Tasks focused on additional features or enhancements]

- [ ] **C.[number]. [Enhancement Task Name]** ^US[story-number]TC[number]
  - [Follow task format template]

#### **Phase D: Integration and Validation**
[Tasks focused on end-to-end testing and acceptance criteria validation]

- [ ] **D.[number]. [Validation Task Name]** ^US[story-number]TD[number]
  - [Follow task format template]

### Task Generation Guidelines

> [!attention] **AI Task Generation Guidelines:**
> Follow these guidelines when creating tasks:

#### Requirements Mapping
- Map each acceptance criterion to specific tasks
- Ensure each AC has corresponding validation tasks
- Include both happy path and error scenario tasks

#### Architectural Integration
- Reference components identified in Phase 1
- Include file paths specified in Phase 1 technical details
- Follow design principles from Phase 1
- Leverage existing code identified in architectural context

#### Agent Workflow Optimization
- Sequence tasks to minimize context switching between agents
- Group related tasks for the same agent when possible
- Include clear handoff points between agents
- Specify validation criteria for agent transitions

## Task Validation Framework

> [!done] **AI Task Validation Goal**
> **Ensure Task Quality and Completeness**
> Validate that generated tasks meet atomic requirements, agent compatibility, and acceptance criteria coverage.

### Task Quality Checklist

> [!attention] **AI Task Quality Instructions:**
> Validate each task against these criteria:

- [ ] **Atomic Requirements**: Task touches 1-5 files maximum with single purpose
- [ ] **Agent Compatibility**: Task matches assigned agent's capabilities
- [ ] **File Specificity**: Exact file paths specified with clear action (create/modify)
- [ ] **Input/Output Clarity**: Clear input requirements and output deliverables
- [ ] **Validation Criteria**: Specific test or validation method defined
- [ ] **Architectural Alignment**: Task aligns with Phase 1 architectural context
- [ ] **Requirements Traceability**: Task clearly maps to acceptance criteria
- [ ] **Implementation Readiness**: Task has sufficient detail for agent execution

### Acceptance Criteria Coverage

> [!attention] **AI AC Coverage Instructions:**
> Ensure all acceptance criteria are covered by tasks:

- [ ] **AC1 Coverage**: [List tasks that address AC1]
- [ ] **AC2 Coverage**: [List tasks that address AC2]
- [ ] **AC[n] Coverage**: [List tasks that address each remaining AC]
- [ ] **Error Scenarios**: Tasks address failure cases from acceptance criteria
- [ ] **Happy Path**: Tasks address successful execution paths
- [ ] **Integration Points**: Tasks address component interactions

## Phase 2 Completion Checklist

> [!attention] **AI Phase 2 Completion Instructions:**
> Before proceeding to Phase 3, verify all items are complete:

- [ ] **Task Generation Complete**: All high-level tasks created with proper format
- [ ] **Agent Assignments**: All tasks assigned to appropriate agents
- [ ] **Requirements Coverage**: All acceptance criteria mapped to specific tasks
- [ ] **Architectural Alignment**: All tasks align with Phase 1 architectural context
- [ ] **File Specifications**: All tasks specify exact file paths and actions
- [ ] **Validation Criteria**: All tasks have clear test/validation methods
- [ ] **Task Quality**: All tasks meet atomic requirements and agent compatibility
- [ ] **Phase 2 Progress**: All progress tracking items marked complete

**Phase 2 Ready for Phase 3**: [ ] (Check when all above items complete)

## Task Sequence Summary

> [!attention] **AI Task Sequence Instructions:**
> Provide a brief summary of the task sequence for user review:

**Total Tasks**: [number]
**Agent Distribution**:
- `test-writer`: [number] tasks
- `code-developer-agent`: [number] tasks
- `application-tech-lead`: [number] tasks
- `qa-validation`: [number] tasks

**Phase Breakdown**:
- Phase A (Infrastructure): [number] tasks
- Phase B ([Feature Name]): [number] tasks
- Phase C ([Feature Name]): [number] tasks
- Phase D (Validation): [number] tasks

**Key Implementation Approach**: [Brief description of the overall implementation strategy]

## Next Phase

When Phase 2 is complete, proceed to Phase 3 using the [task scoping prompt](../prompts/phase-3-task-scoping-prompt.md) to break down high-level tasks into atomic subtasks with detailed implementation specifications.
