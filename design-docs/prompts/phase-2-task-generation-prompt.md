# Phase 2: Task Generation Prompt

## Executive Summary

This prompt guides AI agents through Phase 2 of the 4-phase user story system: transforming the architectural context and acceptance criteria from Phase 1 into a structured task breakdown with agent assignments.

## Mission Context

**Objective**: Convert the comprehensive story shell from Phase 1 into high-level, agent-friendly tasks that follow TDD principles and atomic requirements.

**Input**: Completed story file from Phase 1 with full architectural context
**Output**: Story file updated with high-level tasks using `task-framework-template.md` patterns

## Phase 2 Execution Framework

### Pre-Execution Requirements

Before beginning Phase 2, ensure you have:

1. **Completed Phase 1**: Story shell with validated architectural context and citations
2. **Template Access**: The [`task-framework-template.md`](../templates/task-framework-template.md) loaded for reference
3. **Agent Understanding**: Clear knowledge of available agents and their capabilities
4. **TDD Knowledge**: Understanding of RED-GREEN-REFACTOR cycles and atomic task principles

### Execution Workflow

#### Step 1: Validate Phase 1 Context

1. **Load Story File**: Open the completed story file from Phase 1
2. **Verify Completion**: Confirm Phase 1 completion checklist is 100% complete
3. **Review Architectural Context**: Understand all components, dependencies, and constraints
4. **Analyze Acceptance Criteria**: Review all ACs to understand validation requirements
5. **Update Progress**: Mark Step 1 complete in Phase 2 Progress Tracking section

#### Step 2: Apply Task Generation Principles

1. **Review Atomic Requirements**: Ensure understanding of 1-5 file maximum per task
 1. Atomic Task Requirements (CRITICAL FOR AGENT EXECUTION)
  - **File Scope**: Touches 1-5 related files maximum
  - **Single Purpose**: One complete implementation unit per task
      - Multiple related edits allowed per task
      - All changes must work together toward one validation checkpoint
      - The validation test can be written in one clear and impactful sentence
  - **Specific Files**: Must specify exact files to create/modify
  - **Agent-Friendly**: Clear input/output with minimal context switching
  - **Coding Task Focused**: Excludes any task that cannot be completed through writing/modifying/testing code
  - **Hallucination Free**: All tasks and sub-tasks are derived from Phase 1 architectural context
2. **Study Agent Capabilities**: Map task types to appropriate agents:
   - `test-writer`: Test infrastructure, test creation, TDD setup, validation test implementation
   - `code-developer-agent`: Core implementation, class creation, method implementation, integration code
   - `application-tech-lead`: Architecture validation, pattern compliance, quality gates, course corrections
   - `qa-validation`: End-to-end validation, acceptance criteria verification, final testing
3. **Plan TDD Sequencing**: Structure tasks to follow proper Test-Driven Development cycles
4. **Update Progress**: Mark Step 2 complete in Phase 2 Progress Tracking section

#### Step 3: Create High-Level Task Structure

1. **Map Acceptance Criteria**: Identify which ACs each task will address
2. **Design Phase Organization**: Structure tasks into logical phases:
   - **Phase A**: Test Infrastructure Setup
   - **Phase B**: Primary Feature Implementation
   - **Phase C**: Secondary Feature Implementation (if needed)
   - **Phase D**: Integration and Validation
3. **Apply Task Format**: Use the exact task format template for consistency
4. **Assign Agents**: Match each task to the most appropriate agent
5. **Update Progress**: Mark Step 3 complete in Phase 2 Progress Tracking section

#### Step 4: Generate Infrastructure Tasks (Phase A)

1. **Test Framework Setup**: Create tasks for test configuration and utilities
2. **Mock Setup**: Define tasks for creating test fixtures and mock objects
3. **Environment Preparation**: Include tasks for test environment setup
4. **Validation Utilities**: Create tasks for test helper functions and utilities
5. **Update Progress**: Mark Step 4 complete in Phase 2 Progress Tracking section

#### Step 5: Generate Feature Implementation Tasks (Phase B/C)

1. **Follow TDD Cycles**: For each major feature, create RED-GREEN-REFACTOR task sequence:
   - **RED**: Create failing tests that define behavior
   - **GREEN**: Implement minimal code to pass tests
   - **REFACTOR**: Enhance implementation while maintaining tests
2. **Specify File Scope**: Ensure each task touches 1-5 files maximum
3. **Define Clear Objectives**: Each task must have specific, measurable objectives
4. **Include Integration Points**: Address how components connect and interact
5. **Update Progress**: Mark Step 5 complete in Phase 2 Progress Tracking section

#### Step 6: Generate Validation Tasks (Phase D)

1. **End-to-End Testing**: Create tasks for complete workflow validation
2. **Acceptance Criteria Verification**: Map tasks directly to story ACs
3. **Integration Testing**: Include tasks for component interaction testing
4. **Quality Gates**: Define tasks for architecture compliance validation
5. **Update Progress**: Mark Step 6 complete in Phase 2 Progress Tracking section

#### Step 7: Validate Task Quality

1. **Atomic Requirements Check**: Verify each task meets 1-5 file maximum
2. **Agent Compatibility**: Confirm task assignments match agent capabilities
3. **File Specificity**: Ensure exact file paths are specified with clear actions
4. **Validation Criteria**: Verify each task has specific test/validation methods
5. **Requirements Coverage**: Confirm all acceptance criteria are covered
6. **Update Progress**: Mark Step 7 complete in Phase 2 Progress Tracking section

#### Step 8: Finalize and Prepare for Phase 3

1. **Task Sequence Summary**: Create summary of task distribution and phases
2. **Dependency Analysis**: Note any critical dependencies between tasks
3. **Quality Validation**: Run through Task Quality Checklist
4. **Mark Phase Complete**: Check "Phase 2 Ready for Phase 3" in completion checklist
5. **Update Progress**: Mark Step 8 complete in Phase 2 Progress Tracking section

## Task Generation Patterns

### High-Level Milestone Requirements

Every milestone must meet these requirements:

- **Conceptual Scope**: Represents a complete feature, capability, or logical grouping of work
- **Digestible Size**: Can be understood and communicated clearly (typically 5-10 milestones per story)
- **No File Limits**: Milestones may span multiple files, directories, and components
- **Requirements Mapping**: Maps to one or more acceptance criteria from Phase 1
- **Agent Type**: Identifies the primary agent type that will handle the milestone's subtasks
- **Coding Task Focused**: Excludes any task that cannot be completed through writing/modifying/testing code
- **Context-Driven**: All milestones derived from Phase 1 architectural context

### Milestone Format Template

Use this exact format for each high-level milestone:

```markdown
- [ ] **[Number]. [Milestone Name]**
  - **Description**: [High-level description of what this milestone accomplishes]
  - **Agent Type**: [primary agent type that will handle subtasks - test-writer, code-developer-agent, application-tech-lead, or qa-validation]
  - **Scope**:
    - [Conceptual work item 1]
    - [Conceptual work item 2]
    - [Conceptual work item 3]
  - **Deliverables**: [High-level outcomes when milestone is complete]
  - _Requirements_: [[#^US[story-number]AC[number]|AC[number]]], [AC references]
  - _Leverage_: `[existing files or components to build upon]`
  - _Note_: This milestone will be broken into atomic subtasks in Phase 3

**Example:**
- [ ] **1. Set up project structure and core interfaces**
  - **Description**: Establish the foundational architecture and define system boundaries
  - **Agent Type**: code-developer-agent
  - **Scope**:
    - Create directory structure for models, services, repositories
    - Define interfaces that establish system boundaries
    - Set up base TypeScript configuration
  - **Deliverables**: Project structure ready for implementation, core interfaces defined
  - _Requirements_: AC1.1, AC3.3
  - _Note_: This milestone will be broken into atomic subtasks in Phase 3
```

### Agent Type Assignment Guidelines

Use these guidelines to determine the primary agent type for each milestone:

#### `test-writer` Milestones
- Test infrastructure and framework setup
- Comprehensive test suite creation
- Test validation and coverage milestones
- Test utility and helper development
- Mock and fixture infrastructure

#### `code-developer-agent` Milestones
- Core feature implementation
- Class and service development
- Integration development
- Configuration and setup
- Primary business logic implementation

#### `application-tech-lead` Milestones
- Architecture definition and validation
- Design pattern establishment
- Quality standards definition
- Complex integration architecture
- Technical debt resolution

#### `qa-validation` Milestones
- End-to-end validation workflows
- Acceptance criteria verification
- Integration testing coordination
- Quality assurance checkpoints
- Story completion validation

**Note**: The agent type identified here represents the _primary_ type. In Phase 3, individual subtasks may use different specialized agents following TDD cycles (test-writer for RED, code-developer-agent for GREEN, application-tech-lead for REFACTOR).

### Milestone Sequencing and Organization

Structure milestones to support Test-Driven Development workflow:

1. **Infrastructure Milestones**: Test framework setup, project scaffolding, core utilities
2. **Feature Milestones**: For each major feature or capability, create a milestone that will support TDD cycles in Phase 3
3. **Integration Milestones**: Component integration, end-to-end validation, and quality gates
4. **Validation Milestones**: Acceptance criteria verification and story completion

**Note**: The detailed RED-GREEN-REFACTOR cycles will be applied when breaking down these milestones into atomic subtasks in Phase 3. At this phase, focus on organizing work into digestible conceptual groupings.

## Critical Success Factors

### Requirements Coverage Validation

- **AC Mapping**: Every acceptance criterion must map to specific tasks
- **Happy Path Coverage**: Tasks must address successful execution scenarios
- **Error Scenarios**: Include tasks for failure case handling
- **Integration Points**: Address component interaction requirements

### Milestone Quality Assurance

- **Conceptual Clarity**: Each milestone represents a clear, understandable feature or capability
- **Digestible Scope**: Milestone can be communicated in 1-2 sentences
- **Agent Type Match**: Milestone work aligns with identified agent type capabilities
- **Clear Deliverables**: High-level outcomes clearly defined
- **Requirements Mapping**: Milestone maps to specific acceptance criteria
- **No Atomic Constraints**: Milestones may span many files - atomic breakdown happens in Phase 3

### Architectural Alignment

- **Component Integration**: Tasks align with Phase 1 architectural context
- **File Path Accuracy**: Exact paths from Phase 1 technical details
- **Design Principle Adherence**: Tasks support identified design principles
- **Technology Stack Compliance**: Tasks use specified technologies and dependencies

## Common Pitfalls and Solutions

### Pitfall: Milestones Too Granular or Too Vague
**Solution**: Create 5-10 digestible milestones per story. Each should represent a complete feature or capability that can be understood quickly. Don't worry about file counts - that's for Phase 3.

### Pitfall: Poor Agent Type Assignment
**Solution**: Match milestone theme to primary agent type. Test infrastructure → test-writer, core features → code-developer-agent, architecture → application-tech-lead, validation → qa-validation.

### Pitfall: Trying to Define Atomic Tasks
**Solution**: Resist the urge to break down into detailed tasks. Keep milestones high-level and conceptual. Atomic breakdown happens in Phase 3.

### Pitfall: Incomplete Requirements Coverage
**Solution**: Map every acceptance criterion to at least one milestone. Ensure both happy path and error scenarios are represented across milestones.

### Pitfall: Over-Specifying Implementation Details
**Solution**: Use the milestone format template. Focus on "what" needs to be accomplished, not "how". Implementation details come in Phase 3 and Phase 4.

## Phase 2 Completion Validation

Before proceeding to Phase 3, verify:

- [ ] **Milestone Generation Complete**: All high-level milestones created using proper format
- [ ] **Agent Type Assignments**: All milestones have primary agent type identified
- [ ] **Requirements Coverage**: All acceptance criteria mapped to specific milestones
- [ ] **Architectural Alignment**: All milestones align with Phase 1 architectural context
- [ ] **Digestible Organization**: Story broken into 5-10 clear, understandable milestones
- [ ] **Conceptual Clarity**: Each milestone represents a complete feature or capability
- [ ] **No Premature Atomization**: Milestones remain high-level without implementation details
- [ ] **Phase 2 Progress**: All progress tracking items marked complete

## Next Phase Transition

When Phase 2 is complete:

1. **Verify Completion**: Ensure all validation items are checked
2. **Review Milestone Summary**: Confirm milestone distribution and agent type assignments
3. **Proceed to Phase 3**: Use `phase-3-task-scoping-prompt.md` to break down each milestone into atomic subtasks
4. **Maintain Context**: The milestone list becomes input for Phase 3 atomic task breakdown

**Key Handoff to Phase 3**: Phase 2 provides digestible milestones. Phase 3 will transform each milestone into 3-7 atomic subtasks following TDD principles (RED-GREEN-REFACTOR) with strict file limits (1-5 files per subtask).

## Agent-Specific Guidance

### For User-Story-Manager Agent

- Focus on requirements mapping and acceptance criteria coverage
- Ensure milestone definitions align with story objectives at a high level
- Validate that all milestones derive from Phase 1 architectural context
- Maintain traceability between ACs and milestone assignments
- Keep milestones digestible and conceptual - resist premature task breakdown

### For Application-Tech-Lead Agent

- Emphasize architectural alignment at the milestone level
- Structure milestones to support TDD workflow (detailed cycles come in Phase 3)
- Ensure agent type assignments match milestone themes and scope
- Define quality gates and validation milestones
- Focus on "what" needs to be accomplished, not "how" it will be implemented

### Quality Assurance Checkpoint

Phase 2 is considered complete when:

1. All high-level milestones are created using proper format with agent type assignments
2. Every acceptance criterion is covered by specific milestones
3. Story is organized into 5-10 digestible milestones that support TDD workflow
4. Milestones remain conceptual without premature atomic breakdown (no file count constraints)
5. Architectural alignment is maintained with Phase 1 context
6. Phase 2 completion checklist is 100% complete

The updated story file with high-level milestones becomes the input for Phase 3, where each milestone will be broken down into atomic subtasks (1-5 files each) following RED-GREEN-REFACTOR cycles.
