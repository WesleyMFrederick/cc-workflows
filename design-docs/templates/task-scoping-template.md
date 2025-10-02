# Task Scoping Template - Phase 3

> [!attention] **AI Task Scoping Template Instructions**
> **CRITICAL**: This template is for Phase 3 - Atomic task breakdown with detailed specifications and TDD workflow
> **CRITICAL**: Instructions for the AI are in callouts using this format: > [!attention] **AI {{task instruction title}}**
> **CRITICAL**: Goals for a document section are in callouts using this format: > [!done] **AI {{section}} Goal**
> **CRITICAL**: Content the AI must populate are in [single brackets]. [Further instructions on how to populate, style, and length of the content are in between the brackets]
> **CRTICAL**: Examples of content are in callouts using this format: > [!example] **AI {{section}} Example**
> **CRTICAL**: All other callouts and text outside of [brackets] are content that should be populated in the final document
>
> **Prime Directive #1: Atomic Deliverables.** Each subtask must be a complete, testable unit that can be validated independently. Focus on discrete deliverables that work.
>
> **Prime Directive #2: TDD Cycle Enforcement.** Structure subtasks to follow strict RED-GREEN-REFACTOR cycles with clear validation checkpoints.
>
> **Prime Directive #3: Self-Contained Specifications.** Each subtask must include sufficient detail for independent agent execution without requiring additional context.
>
> **Prime Directive #4: Implementation Readiness.** Subtasks must bridge the gap between high-level requirements and actual code implementation.

## Phase 3 Progress Tracking

> [!attention] **AI Phase 3 Progress Instructions:**
> Update this section as you complete each step of Phase 3 task scoping.

- [ ] **Step 1**: Phase 2 high-level tasks validated and loaded
- [ ] **Step 2**: Task breakdown principles applied
- [ ] **Step 3**: Atomic subtasks created with TDD workflow
- [ ] **Step 4**: Implementation specifications added to each subtask
- [ ] **Step 5**: Validation criteria defined for each subtask
- [ ] **Step 6**: Agent assignments verified for subtask scope
- [ ] **Step 7**: Phase 3 ready for Phase 4 implementation details

## Atomic Task Scoping Framework

> [!done] **AI Task Scoping Goal**
> **Break High-Level Tasks into Atomic Subtasks**
> Transform each high-level task from Phase 2 into discrete, implementable subtasks that follow TDD principles and can be executed independently.

### Atomic Subtask Requirements (CRITICAL FOR AGENT EXECUTION)

> [!attention] **AI Atomic Requirements Instructions:**
> Every subtask must meet these strict requirements:

- **File Scope**: Touches 1-5 related files maximum
- **Single Purpose**: One complete implementation unit per subtask
  - Multiple related edits allowed per subtask
  - All changes must work together toward one validation checkpoint
  - The validation test can be written in one clear and impactful sentence
- **Specific Files**: Must specify exact files to create/modify
- **Agent-Friendly**: Clear input/output with minimal context switching
- **Hallucination Free**: All subtasks derived from Phase 2 high-level tasks
- **Self-Contained**: Includes sufficient context for independent execution

### TDD Subtask Structure

> [!attention] **AI TDD Structure Instructions:**
> Structure subtasks to follow proper TDD cycles:

#### RED Phase Subtasks
- Create failing tests that define the expected behavior
- Establish validation criteria before implementation exists
- Set up test fixtures and mock objects

#### GREEN Phase Subtasks
- Implement minimal code to make tests pass
- Focus on making tests green, not perfect implementation
- Maintain simplicity and direct solutions

#### REFACTOR Phase Subtasks
- Enhance implementation while keeping tests passing
- Add error handling, validation, and edge cases
- Optimize and clean up code structure

### Subtask Format Template

> [!attention] **AI Subtask Format Instructions:**
> Use this exact format for each subtask:

```markdown
- [ ] **[Task].[Subtask]. [Subtask Name]** ^T[task-number]-[subtask-number]
  - **Agent**: [agent-name]
  - **Objective**: [Clear, specific objective for this subtask]
  - **Input**: [What exists or is required before starting this subtask]
  - **Output**: [Specific deliverable and completion criteria]
  - **Files**: `[file-path]` ([create | modify | update])
  - **Scope**:
    - [Specific work item 1 with technical details]
    - [Specific work item 2 with technical details]
    - [Specific work item 3 with technical details]
  - **Test**: [Expected test outcome or validation criteria]
  - **Commands**: `[npm commands or validation steps]`
  - _Requirements_: [[#^US[story-number]AC[number]|AC[number]]], [architectural references]
  - _Leverage_: `[existing files or components to build upon]`
  - _Implementation Details_: [Link to be populated in Phase 4]
```

> [!example] **AI Subtask Format Example**
>
> ```markdown
> - [ ] **1.1. Create Basic Test Workspace Utilities** ^T1-1
>   - **Agent**: test-writer
>   - **Objective**: Create test utilities for isolated temporary directory management with parallel test support
>   - **Input**: Vitest configuration from parent task with ES modules support
>   - **Output**: Working test utilities that create isolated workspaces with cleanup capabilities
>   - **Files**: `test/helpers/testUtils.js` (create)
>   - **Scope**:
>     - Create `createTestWorkspace(testName)` function that returns `{tempDir, cleanup}`
>     - Use `os.tmpdir()` with unique identifier for isolation
>     - Add `setupTestDirectories(basePath, structure)` for creating nested structures
>     - Include validation helpers: `assertDirectoryExists(path)`, `assertDirectoryEmpty(path)`
>   - **Test**: Multiple tests can create separate workspaces without interference
>   - **Commands**: `npm test test/helpers/testUtils.test.js`
>   - _Requirements_: [[#^US1-1AC2|AC2]], [[#^US1-1AC4|AC4]]
>   - _Leverage_: Project ES modules architecture and testing strategy
>   - _Implementation Details_: [Link to be populated in Phase 4]
> ```

## Subtask Breakdown by Feature

> [!done] **AI Feature Breakdown Goal**
> **Organize Subtasks by Feature Implementation**
> Group related subtasks under their parent tasks to maintain logical organization and clear dependencies.

### [Task Name from Phase 2]

> [!attention] **AI Feature Subtask Instructions:**
> For each high-level task from Phase 2, create 3-7 atomic subtasks that follow TDD workflow.

#### RED Phase: Test Definition
- [ ] **[Task].[Subtask]. [Test Creation Subtask Name]** ^T[task-number]-[subtask-number]
  - [Follow subtask format template]
  - **TDD Phase**: RED - Create failing tests

#### GREEN Phase: Minimal Implementation
- [ ] **[Task].[Subtask]. [Implementation Subtask Name]** ^T[task-number]-[subtask-number]
  - [Follow subtask format template]
  - **TDD Phase**: GREEN - Make tests pass

#### REFACTOR Phase: Enhancement
- [ ] **[Task].[Subtask]. [Enhancement Subtask Name]** ^T[task-number]-[subtask-number]
  - [Follow subtask format template]
  - **TDD Phase**: REFACTOR - Improve implementation

> [!example] **AI Feature Breakdown Example**
> ### 1. Configure Test Infrastructure
>
> #### RED Phase: Test Foundation
> - [ ] **1.1. Create Basic Test Workspace Utilities** ^T1-1
>   - **Agent**: test-writer
>   - **TDD Phase**: RED - Create test utilities
>   - [Follow subtask format template]
>
> #### GREEN Phase: Core Implementation
> - [ ] **1.2. Configure Vitest for ES Modules** ^T1-2
>   - **Agent**: code-developer-agent
>   - **TDD Phase**: GREEN - Basic configuration
>   - [Follow subtask format template]
>
> #### REFACTOR Phase: Advanced Configuration
> - [ ] **1.3. Add Advanced Test Configuration** ^T1-3
>   - **Agent**: application-tech-lead
>   - **TDD Phase**: REFACTOR - Optimize configuration
>   - [Follow subtask format template]

## Subtask Dependency Management

> [!done] **AI Dependency Management Goal**
> **Define Clear Dependencies Between Subtasks**
> Establish dependency relationships and execution order to ensure smooth agent workflow transitions.

### Dependency Mapping

> [!attention] **AI Dependency Instructions:**
> Map dependencies between subtasks to prevent execution conflicts:

#### Sequential Dependencies
- **Subtask A → Subtask B**: Subtask B requires completion of Subtask A
- **Chain Dependencies**: A → B → C (linear execution required)

#### Parallel Execution Groups
- **Independent Subtasks**: Can be executed simultaneously
- **Parallel Groups**: Multiple subtasks that don't conflict

#### Agent Handoff Points
- **Agent Transition**: Clear handoff between different agents
- **Validation Gates**: Quality checkpoints between agent workflows

> [!example] **AI Dependency Example**
> **Sequential Dependencies**:
> - T1-1 (Test Utils) → T1-2 (Vitest Config) → T1-3 (Advanced Config)
> - T2-1 (Interface Tests) → T2-2 (Class Implementation) → T2-3 (Method Implementation)
>
> **Parallel Execution Groups**:
> - T1-1, T1-2 can run in parallel after dependencies met
> - T3-1, T3-2, T3-3 are independent and can run simultaneously
>
> **Agent Handoff Points**:
> - test-writer completes T1-1 → handoff to code-developer-agent for T1-2
> - application-tech-lead validates T2-3 → handoff to qa-validation for T4-1

## Subtask Validation Framework

> [!done] **AI Subtask Validation Goal**
> **Ensure Subtask Quality and Implementation Readiness**
> Validate that each subtask meets atomic requirements and contains sufficient detail for independent agent execution.

### Subtask Quality Checklist

> [!attention] **AI Subtask Quality Instructions:**
> Validate each subtask against these criteria:

- [ ] **Atomic Requirements**: Subtask touches 1-5 files maximum with single purpose
- [ ] **Agent Compatibility**: Subtask matches assigned agent's capabilities and scope
- [ ] **File Specificity**: Exact file paths specified with clear action (create/modify)
- [ ] **Input/Output Clarity**: Clear input requirements and output deliverables
- [ ] **Implementation Detail**: Sufficient technical detail for independent execution
- [ ] **Validation Criteria**: Specific test or validation method defined
- [ ] **TDD Alignment**: Subtask fits proper TDD phase (RED/GREEN/REFACTOR)
- [ ] **Dependencies Clear**: Prerequisites and dependencies clearly specified

### Implementation Readiness Assessment

> [!attention] **AI Implementation Readiness Instructions:**
> Assess whether subtasks are ready for Phase 4 implementation details:

#### Technical Completeness
- [ ] **Code Patterns**: Implementation approach clearly specified
- [ ] **Integration Points**: How subtask connects to other components
- [ ] **Error Handling**: Expected error scenarios and handling approach
- [ ] **Validation Strategy**: How success/failure will be determined

#### Context Sufficiency
- [ ] **Architectural Alignment**: Subtask aligns with overall architecture
- [ ] **Design Patterns**: Follows established patterns from architectural context
- [ ] **Interface Contracts**: Clear contracts with other components
- [ ] **Testing Strategy**: Testing approach and validation criteria defined

## Phase 3 Completion Checklist

> [!attention] **AI Phase 3 Completion Instructions:**
> Before proceeding to Phase 4, verify all items are complete:

- [ ] **Subtask Breakdown Complete**: All high-level tasks broken into atomic subtasks
- [ ] **TDD Workflow**: All subtasks follow proper RED-GREEN-REFACTOR structure
- [ ] **Agent Assignments**: All subtasks assigned to appropriate agents with proper scope
- [ ] **Dependency Mapping**: Dependencies between subtasks clearly defined
- [ ] **Implementation Detail**: All subtasks have sufficient detail for independent execution
- [ ] **Validation Criteria**: All subtasks have clear success/failure criteria
- [ ] **File Specifications**: All subtasks specify exact file paths and actions
- [ ] **Quality Validation**: All subtasks meet atomic requirements checklist
- [ ] **Phase 3 Progress**: All progress tracking items marked complete

**Phase 3 Ready for Phase 4**: [ ] (Check when all above items complete)

## Subtask Execution Summary

> [!attention] **AI Execution Summary Instructions:**
> Provide a summary of the subtask breakdown for user review:

**Total Subtasks**: [number]
**Agent Distribution**:
- `test-writer`: [number] subtasks
- `code-developer-agent`: [number] subtasks
- `application-tech-lead`: [number] subtasks
- `qa-validation`: [number] subtasks

**TDD Phase Distribution**:
- RED (Test Creation): [number] subtasks
- GREEN (Implementation): [number] subtasks
- REFACTOR (Enhancement): [number] subtasks

**Implementation Approach**: [Brief description of the subtask execution strategy]

**Critical Dependencies**: [Key dependency chains that affect execution order]

## Next Phase

When Phase 3 is complete, proceed to Phase 4 using the [implementation details prompt](../prompts/phase-4-implementation-details-prompt.md) to create self-contained implementation specification files for each subtask that requires detailed guidance.
