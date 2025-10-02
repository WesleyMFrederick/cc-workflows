# Phase 3: Task Scoping Prompt

## Executive Summary

This prompt guides AI agents through Phase 3 of the 4-phase user story system: breaking down high-level milestones from Phase 2 into atomic, implementable subtasks that follow strict TDD workflow and can be executed independently by specialized agents.

**CRITICAL DISTINCTION**: Phase 2 created digestible milestones without file constraints. Phase 3 is where atomic requirements (1-5 files, single purpose) are enforced. This is the phase where we transform conceptual milestones into detailed, implementable subtasks.

## Mission Context

**Objective**: Transform each high-level milestone from Phase 2 into discrete, implementable subtasks with detailed specifications and TDD workflow structure.

**Input**: Story file from Phase 2 with high-level milestones and agent type assignments (NOT atomic tasks)
**Output**: Story file updated with atomic subtasks using `task-scoping-template.md` patterns (STRICTLY atomic - 1-5 files per subtask)

**Key Transformation**: 1 Phase 2 milestone → 3-7 Phase 3 atomic subtasks

## Phase 3 Execution Framework

### Pre-Execution Requirements

Before beginning Phase 3, ensure you have:

1. **Completed Phase 2**: Story file with validated high-level tasks and agent assignments
2. **Template Access**: The `task-scoping-template.md` loaded for reference
3. **TDD Expertise**: Deep understanding of RED-GREEN-REFACTOR cycles and atomic task principles
4. **Agent Workflow Knowledge**: Clear understanding of how agents hand off work and validate deliverables

### Execution Workflow

#### Step 1: Validate Phase 2 Milestones

1. **Load Story File**: Open the story file with completed high-level milestones from Phase 2
2. **Verify Completion**: Confirm Phase 2 completion checklist is 100% complete
3. **Review Milestone Structure**: Understand all high-level milestones, agent type assignments, and requirements
4. **Analyze Milestone Scope**: Assess each milestone to plan atomic subtask breakdown (typically 3-7 subtasks per milestone)
5. **Understand Constraints**: Remember that Phase 2 milestones are NOT atomic - they may span many files
6. **Update Progress**: Mark Step 1 complete in Phase 3 Progress Tracking section

#### Step 2: Apply Atomic Subtask Requirements

1. **Review Atomic Principles**: Ensure understanding of subtask requirements:
   - **File Scope**: Touches 1-5 related files maximum
   - **Single Purpose**: One complete implementation unit per subtask
   - **Specific Files**: Must specify exact files to create/modify
   - **Agent-Friendly**: Clear input/output with minimal context switching
   - **Self-Contained**: Includes sufficient context for independent execution
2. **Study TDD Structure**: Plan RED-GREEN-REFACTOR subtask organization
3. **Update Progress**: Mark Step 2 complete in Phase 3 Progress Tracking section

#### Step 3: Break Down Each High-Level Milestone

For each high-level milestone from Phase 2:

1. **Analyze Milestone Scope**: Determine how to break into atomic subtasks (typically 2-7 subtasks per milestone)
2. **Assess TDD Appropriateness**: Determine if TDD workflow applies using these criteria:

   **Use TDD when:**
   - Behavior will be repeatedly tested/modified over time
   - High risk of breaking with future changes
   - Complex logic crossing interfaces or system boundaries
   - Reusable components that other code will depend on

   **Skip TDD when:**
   - One-off tasks (initial setup, migration, scaffolding)
   - Low risk of breaking with future work
   - Simple configuration or documentation changes
   - Tasks that are "done once and maintained rarely"

   **When Uncertain:**
   - Ask the user: "This milestone involves [description]. Should we use TDD (RED-GREEN-REFACTOR) or direct implementation with validation?"
   - Default to asking rather than assuming TDD applies

3. **Create Subtask Sequence**: Based on TDD assessment:
   - **If TDD**: Create RED → GREEN → REFACTOR subtask sequence
   - **If Direct**: Create implementation → validation subtask sequence
4. **Apply Subtask Format**: Use exact subtask format template for consistency
5. **Assign Specific Agents**: Each subtask gets a specific agent based on work type and validation needs
6. **Enforce Atomic Requirements**: EVERY subtask must touch 1-5 files maximum with single validation checkpoint
7. **Update Progress**: Mark Step 3 complete in Phase 3 Progress Tracking section

#### Step 4: Create Subtasks Based on Workflow Choice

**For TDD Workflow (when appropriate):**

1. **RED Phase Subtasks**: Create failing tests that define expected behavior
   - Test definition, test infrastructure, mock creation, interface definition via tests
2. **GREEN Phase Subtasks**: Implement minimal code to pass tests
   - Minimal implementation, interface satisfaction, core logic, basic integration
3. **REFACTOR Phase Subtasks**: Enhance while keeping tests passing
   - Error handling, edge cases, performance optimization, code quality improvements

**For Direct Implementation Workflow:**

1. **Implementation Subtasks**: Create subtasks for direct code/config changes
   - Single-purpose changes (config updates, file creation, simple transformations)
   - Each touching 1-5 files with clear validation criteria
2. **Validation Subtasks**: Manual or automated verification
   - CLI testing, integration verification, manual review

**Update Progress**: Mark Step 4 complete in Phase 3 Progress Tracking section

#### Step 5: (Intentionally Left Blank - Consolidated into Step 4)

#### Step 6: (Intentionally Left Blank - Consolidated into Step 4)

#### Step 7: Define Subtask Dependencies

1. **Map Sequential Dependencies**: Identify which subtasks must complete before others can start
2. **Identify Parallel Groups**: Determine which subtasks can be executed simultaneously
3. **Define Agent Handoff Points**: Specify clear transition points between different agents
4. **Include Validation Gates**: Create quality checkpoints between agent workflows
5. **Update Progress**: Mark Step 7 complete in Phase 3 Progress Tracking section

#### Step 8: Validate Subtask Quality

1. **Atomic Requirements Check**: Verify each subtask meets strict atomic requirements
2. **Agent Compatibility**: Confirm subtask scope matches assigned agent capabilities
3. **Implementation Readiness**: Ensure sufficient technical detail for independent execution
4. **TDD Alignment**: Verify subtasks follow proper RED-GREEN-REFACTOR structure
5. **Validation Criteria**: Confirm each subtask has specific success/failure criteria
6. **Mark Phase Complete**: Check "Phase 3 Ready for Phase 4" in completion checklist
7. **Update Progress**: Mark Step 8 complete in Phase 3 Progress Tracking section

## Subtask Creation Patterns

### Atomic Subtask Requirements (CRITICAL - ENFORCED HERE IN PHASE 3)

**THIS IS WHERE ATOMIC REQUIREMENTS ARE ENFORCED** - Phase 2 milestones were NOT atomic. Phase 3 subtasks MUST BE atomic.

Every subtask must meet these STRICT requirements:

- **File Scope**: Touches 1-5 related files maximum (STRICTLY ENFORCED)
- **Single Purpose**: One complete implementation unit per subtask
  - Multiple related edits allowed per subtask
  - All changes must work together toward one validation checkpoint
  - The validation test can be written in one clear and impactful sentence
- **Specific Files**: Must specify exact files to create/modify with full paths
- **Agent-Friendly**: Clear input/output with minimal context switching
- **Derivation**: All subtasks derived from Phase 2 high-level milestones
- **Self-Contained**: Includes sufficient context for independent execution
- **Workflow Choice**: Each subtask follows either TDD workflow (RED/GREEN/REFACTOR) OR direct implementation workflow based on story characteristics

**Transformation Rule**: Each Phase 2 milestone (which may span many files) becomes 2-7 Phase 3 atomic subtasks (each touching 1-5 files)

**TDD Decision Criteria**: Use TDD for repeatable behavior with risk of breaking. Skip TDD for one-off tasks. When uncertain, ask the user.

### Subtask Format Template

Use this exact format for each subtask:

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

### Subtask Workflow Patterns

#### TDD Workflow (Use for repeatable behavior with risk of breaking)

**RED Phase Subtasks:**
- Create failing tests that define the expected behavior
- Establish validation criteria before implementation exists
- Set up test fixtures and mock objects
- Define interfaces through test contracts

**GREEN Phase Subtasks:**
- Implement minimal code to make tests pass
- Focus on making tests green, not perfect implementation
- Maintain simplicity and direct solutions
- Satisfy interface contracts established in RED phase

**REFACTOR Phase Subtasks:**
- Enhance implementation while keeping tests passing
- Add error handling, validation, and edge cases
- Optimize and clean up code structure
- Improve patterns while maintaining functionality

#### Direct Implementation Workflow (Use for one-off tasks with low risk)

**Implementation Subtasks:**
- Make direct code or configuration changes
- Single-purpose modifications (update config, create file, simple transformation)
- Each subtask touches 1-5 files with clear purpose

**Validation Subtasks:**
- Manual CLI testing or verification
- Integration checks
- Review and confirmation of changes

**When to Use Each:**
- **TDD**: Business logic, reusable components, code crossing interfaces, high modification risk
- **Direct**: Infrastructure setup, one-off migrations, simple config changes, low maintenance needs

## Phase 2 → Phase 3 Transformation Examples

### Example 1: TDD Workflow Transformation (Code-Heavy Feature)

**Phase 2 Milestone (High-Level, NOT Atomic):**
```markdown
- [ ] **1. Set up project structure and core interfaces**
  - **Description**: Establish the foundational architecture and define system boundaries
  - **Agent Type**: code-developer-agent
  - **Scope**:
    - Create directory structure for models, services, repositories
    - Define interfaces that establish system boundaries
    - Set up base TypeScript configuration
  - **Deliverables**: Project structure ready for implementation, core interfaces defined
  - _Requirements_: AC1.1, AC3.3
```

**Phase 3 Atomic Breakdown (STRICTLY Atomic):**
```markdown
- [ ] **1.1 Create base directory structure** ^T1-1
  - **Agent**: code-developer-agent
  - **Objective**: Create empty directory structure with index files
  - **Input**: Empty project workspace
  - **Output**: Directory structure created with barrel exports
  - **Files**:
    - `src/models/index.ts` (create)
    - `src/services/index.ts` (create)
    - `src/repositories/index.ts` (create)
  - **Scope**:
    - Create models/, services/, repositories/ directories
    - Add index.ts barrel files with "// Export declarations here" comments
    - Ensure proper TypeScript module resolution
  - **Test**: Directory structure exists and index files are importable
  - **Commands**: `npm run build` (should succeed with no errors)
  - _Requirements_: AC1.1

- [ ] **1.2 Define base model interfaces (RED)** ^T1-2
  - **Agent**: test-writer
  - **Objective**: Create failing tests for core data model interfaces
  - **Input**: Directory structure from 1.1
  - **Output**: Test file with failing interface tests (RED phase)
  - **Files**: `src/models/__tests__/base.test.ts` (create)
  - **Scope**:
    - Write tests expecting BaseModel interface with id, createdAt, updatedAt
    - Write tests expecting validation interface structure
    - Tests should fail because interfaces don't exist yet
  - **Test**: Tests fail with "Cannot find module" errors
  - **Commands**: `npm test base.test` (should fail)
  - _Requirements_: AC3.3

- [ ] **1.3 Implement base model interfaces (GREEN)** ^T1-3
  - **Agent**: code-developer-agent
  - **Objective**: Implement interfaces to make tests pass
  - **Input**: Failing tests from 1.2
  - **Output**: TypeScript interfaces that satisfy test requirements (GREEN phase)
  - **Files**: `src/models/base.ts` (create)
  - **Scope**:
    - Create BaseModel interface with id, createdAt, updatedAt fields
    - Create Validation interface structure
    - Export from models/index.ts
  - **Test**: Tests from 1.2 now pass
  - **Commands**: `npm test base.test` (should pass)
  - _Requirements_: AC3.3
  - _Leverage_: Tests from 1.2

- [ ] **1.4 Add interface documentation (REFACTOR)** ^T1-4
  - **Agent**: code-developer-agent
  - **Objective**: Enhance interfaces with JSDoc comments and usage examples
  - **Input**: Working interfaces from 1.3
  - **Output**: Documented interfaces with examples (REFACTOR phase)
  - **Files**: `src/models/base.ts` (modify)
  - **Scope**:
    - Add JSDoc comments to all interfaces
    - Include usage examples in comments
    - Add type guards if needed
  - **Test**: Tests from 1.2 still pass, documentation renders in IDE
  - **Commands**: `npm test base.test` (should still pass)
  - _Requirements_: AC3.3
```

**Key Observations:**
- Phase 2 milestone spans many aspects (directories, interfaces, config)
- Phase 3 breaks it into 4 atomic subtasks, each touching 1-3 files
- RED-GREEN-REFACTOR cycle clearly visible (1.2 RED → 1.3 GREEN → 1.4 REFACTOR)
- Each subtask has ONE clear validation checkpoint
- Specific agents assigned based on work type
- **TDD Chosen Because**: Core interfaces will be repeatedly used, high risk of breaking as system evolves

### Example 2: Direct Implementation Transformation (Infrastructure Setup)

**Phase 2 Milestone (High-Level, NOT Atomic):**
```markdown
- [ ] **1. Configure workspace NPM scripts**
  - **Description**: Set up root package.json scripts to execute citation-manager from new location
  - **Agent Type**: code-developer-agent
  - **Scope**:
    - Update citation:validate, citation:ast, citation:base-paths scripts
    - Create citation:fix script if doesn't exist
    - Ensure workspace-relative paths work from root
  - **Deliverables**: All citation commands executable via npm run
  - _Requirements_: AC1, AC3
```

**Phase 3 Atomic Breakdown (Direct Implementation - NO TDD):**
```markdown
- [ ] **1.1 Update root package.json citation scripts** ^T1-1
  - **Agent**: code-developer-agent
  - **Workflow**: DIRECT IMPLEMENTATION
  - **Objective**: Update all citation scripts to point to migrated location
  - **Input**: Root package.json with old script paths
  - **Output**: Updated package.json with scripts pointing to tools/citation-manager/src/
  - **Files**: `package.json` (modify)
  - **Scope**:
    - Update citation:validate to `node tools/citation-manager/src/citation-manager.js validate`
    - Update citation:ast to `node tools/citation-manager/src/citation-manager.js ast`
    - Update citation:base-paths to `node tools/citation-manager/src/citation-manager.js base-paths`
    - Create citation:fix script: `node tools/citation-manager/src/citation-manager.js fix`
  - **Test**: Scripts updated correctly in package.json
  - **Commands**: Verify with `cat package.json | grep citation:`
  - _Requirements_: AC1

- [ ] **1.2 Validate citation scripts execute correctly** ^T1-2
  - **Agent**: qa-validation
  - **Workflow**: MANUAL VALIDATION
  - **Objective**: Verify all citation commands work via npm run
  - **Input**: Updated package.json from 1.1
  - **Output**: Confirmation all scripts execute without module errors
  - **Files**: none (manual CLI testing)
  - **Scope**:
    - Run `npm run citation:validate -- --help` and verify help displays
    - Run `npm run citation:validate -- <test-file>` with real markdown
    - Run `npm run citation:base-paths -- <file> -- --format json`
    - Confirm no "Cannot find module" errors
  - **Test**: All citation commands execute successfully from workspace root
  - **Commands**: Manual execution of each npm run citation:* script
  - _Requirements_: AC1, AC2, AC3
```

**Key Observations:**
- Phase 2 milestone about NPM script configuration
- Phase 3 breaks into 2 atomic subtasks (implementation + validation)
- NO TDD - direct implementation followed by manual validation
- Simple config change that won't break with future modifications
- Each subtask has ONE clear validation checkpoint
- **TDD Skipped Because**: One-off infrastructure setup, low risk of breaking, won't be repeatedly modified

### Dependency Management Patterns

#### Sequential Dependencies
- **Subtask A → Subtask B**: Subtask B requires completion of Subtask A
- **Chain Dependencies**: A → B → C (linear execution required)
- **Feature Dependencies**: Core implementation must complete before enhancements

#### Parallel Execution Groups
- **Independent Subtasks**: Can be executed simultaneously without conflicts
- **Parallel Feature Groups**: Multiple features that don't interfere with each other
- **Test Parallel Groups**: Test creation subtasks that can run concurrently

#### Agent Handoff Points
- **Agent Transition**: Clear handoff between different agents with validation
- **Validation Gates**: Quality checkpoints between agent workflows
- **Context Transfer**: Sufficient information transfer between agent transitions

## Critical Success Factors

### Subtask Quality Assurance

- **Atomic Compliance**: Each subtask touches maximum 1-5 files with single purpose
- **Implementation Detail**: Sufficient technical detail for independent agent execution
- **Validation Methods**: Specific test or validation criteria defined for each subtask
- **TDD Alignment**: Proper RED-GREEN-REFACTOR phase assignment
- **Agent Match**: Subtask complexity and scope match assigned agent capabilities

### Workflow Optimization

- **Minimal Context Switching**: Subtasks grouped to reduce agent handoffs
- **Clear Dependencies**: Explicit dependency relationships defined
- **Validation Checkpoints**: Quality gates at critical transition points
- **Resume Capability**: Subtasks can be paused and resumed independently

### Technical Completeness

- **Code Patterns**: Implementation approach clearly specified with examples
- **Integration Points**: How subtasks connect to other components defined
- **Error Handling**: Expected error scenarios and handling approach included
- **Testing Strategy**: Testing approach and validation criteria specified

## Common Pitfalls and Solutions

### Pitfall: Subtasks Too Large (Forgetting Phase 2 Was Not Atomic)
**Solution**: Remember that Phase 2 milestones may span many files. Break down each milestone into 3-7 atomic subtasks with 1-5 files each. Each subtask should have ONE validation checkpoint described in a single sentence.

### Pitfall: Forcing TDD on Every Milestone
**Solution**: Assess each milestone for TDD appropriateness. Use TDD for repeatable behavior with breaking risk. Use direct implementation for one-off tasks. When uncertain, ask the user rather than defaulting to TDD.

### Pitfall: Missing the Transformation
**Solution**: Don't just add detail to Phase 2 milestones. TRANSFORM them. 1 conceptual milestone → 3-7 implementable atomic subtasks. Use the transformation examples as guidance.

### Pitfall: Poor Dependency Management
**Solution**: Map all dependencies explicitly. Identify parallel execution opportunities. Include clear agent handoff points with validation between TDD phases.

### Pitfall: Insufficient Implementation Detail
**Solution**: Include technical patterns, code examples, and specific integration guidance. Remember: Phase 2 said "what", Phase 3 says "how" in atomic chunks.

### Pitfall: Weak Validation Criteria
**Solution**: Define specific, measurable success criteria for each subtask. Every subtask must have a test command that can verify completion.

## Phase 3 Completion Validation

Before proceeding to Phase 4, verify:

- [ ] **Milestone Transformation Complete**: All Phase 2 milestones broken into atomic subtasks (2-7 subtasks per milestone)
- [ ] **Atomic Enforcement**: Every subtask touches 1-5 files maximum with single validation checkpoint
- [ ] **Workflow Appropriateness**: TDD used for repeatable behavior, direct implementation for one-off tasks, user consulted when uncertain
- [ ] **Workflow Structure**: Subtasks follow chosen workflow (RED-GREEN-REFACTOR for TDD OR implementation-validation for direct)
- [ ] **Agent Assignments**: All subtasks assigned to specific agents (not just agent types) based on workflow and work type
- [ ] **Dependency Mapping**: Dependencies between subtasks clearly defined with parallel opportunities identified
- [ ] **Implementation Detail**: All subtasks have sufficient technical detail for independent execution
- [ ] **Validation Criteria**: Every subtask has specific test command or validation method
- [ ] **File Specifications**: All subtasks specify exact file paths with create/modify actions
- [ ] **No Milestone Copying**: Subtasks are transformations, not just detailed versions of milestones
- [ ] **Phase 3 Progress**: All progress tracking items marked complete

## Next Phase Transition

When Phase 3 is complete:

1. **Verify Completion**: Ensure all validation items are checked, especially atomic enforcement
2. **Review Transformation**: Confirm each Phase 2 milestone was properly transformed into 2-7 atomic subtasks
3. **Validate Workflow Choice**: Verify appropriate workflow chosen (TDD for repeatable code, direct for one-off tasks)
4. **Check User Consultation**: If TDD appropriateness was uncertain, confirm user was consulted
5. **Proceed to Phase 4**: Use `phase-4-implementation-details-prompt.md` to create self-contained implementation specification files
6. **Maintain Context**: The atomic subtask breakdown becomes input for Phase 4 detailed specifications

**Key Achievement**: Phase 2 provided digestible milestones. Phase 3 has now transformed them into atomic, implementable subtasks (1-5 files each) with appropriate workflow (TDD or direct implementation). Phase 4 will add detailed implementation guidance to each subtask.

## Guidance

- Focus on transforming Phase 2 milestones into atomic subtask sequences
- Assess each milestone for TDD appropriateness (repeatable behavior vs one-off tasks)
- Ensure all subtasks derive logically from Phase 2 milestone breakdown (don't just copy milestones)
- Maintain clear dependency relationships appropriate to workflow choice
- Validate that every subtask meets strict atomic requirements (1-5 files)
- Verify transformation ratio: 1 milestone → 2-7 subtasks
- When uncertain about TDD applicability, ask the user
- Emphasize atomic enforcement and appropriate workflow selection at subtask level
- For TDD milestones: ensure proper development cycles (RED → GREEN → REFACTOR)
- For direct implementation: ensure clear implementation → validation sequence
- Define quality gates and validation checkpoints appropriate to workflow
- Validate technical completeness: each subtask must be independently implementable
- Focus on "how" to implement what Phase 2 milestones defined
- Don't force TDD on infrastructure or one-off tasks

### Quality Assurance Checkpoint

Phase 3 is considered complete when:

1. All Phase 2 milestones are transformed into atomic subtasks (2-7 subtasks per milestone)
2. Every subtask meets strict atomic requirements (1-5 files maximum, single validation checkpoint)
3. Appropriate workflow chosen for each milestone (TDD for repeatable behavior, direct for one-off tasks)
4. Workflow structure correctly applied (RED-GREEN-REFACTOR for TDD, implementation-validation for direct)
5. Dependencies between subtasks are clearly mapped with parallel execution opportunities identified
6. All subtasks have sufficient technical detail for independent agent execution
7. Specific agents (not just agent types) are assigned based on workflow choice and work type
8. Each subtask specifies exact file paths and validation commands
9. Subtasks are transformations, not just detailed copies of Phase 2 milestones
10. User was consulted when TDD appropriateness was uncertain
11. Phase 3 completion checklist is 100% complete

The story file with atomic subtask breakdown becomes the foundation for Phase 4 implementation detail files. Phase 2 provided the "what" (digestible milestones), Phase 3 provided the "how" (atomic subtasks with appropriate workflow), and Phase 4 will provide the "details" (implementation specifications).
