# User Story Orchestrator - 4-Phase Master Workflow

## Executive Summary

This prompt serves as the master orchestrator for the complete 4-phase user story system, managing phase transitions, citation validation, progress tracking, and quality gates to ensure comprehensive story development from epic requirements to implementation-ready specifications.

## Mission Context

**Objective**: Orchestrate the complete transformation of epic requirements into implementation-ready user stories through a structured 4-phase workflow with built-in quality assurance and resumability.

**Input**: Epic source document or requirements with story definition and acceptance criteria
**Output**: Complete user story with atomic subtasks and implementation details files ready for agent execution

## 4-Phase System Overview

The user story system operates in 4 distinct phases, each with specific objectives and deliverables:

1. **Phase 1 - Story Creation**: Create comprehensive story shell with architectural context
2. **Phase 2 - Task Generation**: Transform story into high-level tasks with agent assignments
3. **Phase 3 - Task Scoping**: Break down tasks into atomic subtasks with TDD workflow
4. **Phase 4 - Implementation Details**: Create self-contained implementation specification files

### Phase Transition Requirements

Each phase must be 100% complete before proceeding to the next phase. The orchestrator enforces quality gates and validation checkpoints to ensure completeness and quality.

## Orchestrator Execution Framework

### Pre-Execution Assessment

Before beginning orchestration, assess the current state:

1. **Determine Starting Phase**: Identify which phase to begin or resume from
2. **Validate Prerequisites**: Ensure all required inputs and templates are available
3. **Check Citation Manager**: Verify citation validation tools are functional
4. **Initialize Progress Tracking**: Set up todo lists and progress monitoring

### Phase 1 Orchestration - Story Creation

**Trigger**: New story creation from epic requirements
**Prompt**: `phase-1-story-creation-prompt.md`
**Template**: `story-shell-template.md`

#### Phase 1 Execution Steps

1. **Initialize Story Creation**
   - Load epic source document or requirements
   - Create new story file using naming convention
   - Load story-shell-template for population

2. **Execute Phase 1 Workflow**
   - Extract story definition and acceptance criteria from epic
   - Gather complete architectural context using C4 methodology
   - Document technical details, design principles, and testing requirements
   - Define agent workflow sequence for implementation

3. **Phase 1 Quality Gates**
   - Story definition copied exactly from epic with proper citation
   - Acceptance criteria copied exactly from epic with anchor references
   - All affected components identified with architectural citations
   - Technical details include file paths, dependencies, and constraints
   - Design principles identified with application guidance
   - Testing requirements framework and specifications defined
   - Agent workflow sequence documented

4. **Phase 1 Validation Checkpoint**
   - Run citation validation: `npm run citation:validate <story-file-path>`
   - Verify Phase 1 completion checklist is 100% complete
   - Confirm "Phase 1 Ready for Phase 2" is checked
   - Validate all architectural references are accessible

#### Phase 1 Success Criteria

- [ ] Story shell template fully populated with relevant architectural context
- [ ] All citations validated and working
- [ ] Epic requirements exactly copied with proper source attribution
- [ ] Technical details provide sufficient context for task generation
- [ ] Agent workflow clearly defined for subsequent phases
- [ ] Phase 1 completion checklist 100% complete

### Phase 2 Orchestration - Task Generation

**Trigger**: Phase 1 completion validation passed
**Prompt**: `phase-2-task-generation-prompt.md`
**Template**: `task-framework-template.md` patterns

#### Phase 2 Execution Steps

1. **Validate Phase 1 Context**
   - Confirm Phase 1 completion checklist is 100% complete
   - Review architectural context and acceptance criteria
   - Understand component dependencies and constraints

2. **Execute Phase 2 Workflow**
   - Apply atomic task requirements and TDD sequencing principles
   - Create high-level task structure organized by implementation phases
   - Generate infrastructure, feature implementation, and validation tasks
   - Assign appropriate agents to each task based on capabilities

3. **Phase 2 Quality Gates**
   - All high-level tasks created with proper format and agent assignments
   - Every acceptance criterion mapped to specific tasks
   - Task sequence follows proper TDD workflow (RED-GREEN-REFACTOR)
   - All tasks meet atomic requirements (1-5 files, single purpose)
   - Architectural alignment maintained with Phase 1 context
   - File specifications exact with clear actions (create/modify)

4. **Phase 2 Validation Checkpoint**
   - Verify all acceptance criteria have corresponding tasks
   - Confirm agent assignments match task complexity and scope
   - Validate task format template consistency
   - Check Phase 2 completion checklist is 100% complete

#### Phase 2 Success Criteria

- [ ] All high-level tasks created with proper format and agent assignments
- [ ] Every acceptance criterion covered by specific tasks
- [ ] Task sequence follows proper TDD workflow with RED-GREEN-REFACTOR cycles
- [ ] All tasks meet atomic requirements (1-5 files, single purpose)
- [ ] Architectural alignment maintained with Phase 1 context
- [ ] Phase 2 completion checklist 100% complete

### Phase 3 Orchestration - Task Scoping

**Trigger**: Phase 2 completion validation passed
**Prompt**: `phase-3-task-scoping-prompt.md`
**Template**: `task-scoping-template.md` patterns

#### Phase 3 Execution Steps

1. **Validate Phase 2 Tasks**
   - Confirm Phase 2 completion checklist is 100% complete
   - Review all high-level tasks and agent assignments
   - Analyze task complexity for subtask breakdown requirements

2. **Execute Phase 3 Workflow**
   - Apply atomic subtask requirements to each high-level task
   - Create TDD subtask sequences (RED-GREEN-REFACTOR) for each feature
   - Define subtask dependencies and parallel execution groups
   - Specify agent handoff points and validation gates

3. **Phase 3 Quality Gates**
   - All high-level tasks broken down into atomic subtasks
   - Every subtask follows proper RED-GREEN-REFACTOR structure
   - All subtasks assigned to appropriate agents with proper scope
   - Dependencies between subtasks clearly mapped
   - All subtasks have sufficient detail for independent execution
   - Validation criteria clear for each subtask
   - File specifications exact with clear actions

4. **Phase 3 Validation Checkpoint**
   - Verify subtask breakdown completeness and TDD alignment
   - Confirm atomic requirements compliance for all subtasks
   - Validate dependency mapping and parallel execution identification
   - Check Phase 3 completion checklist is 100% complete

#### Phase 3 Success Criteria

- [ ] All high-level tasks broken down into atomic subtasks following TDD principles
- [ ] Every subtask meets strict atomic requirements (1-5 files, single purpose)
- [ ] Dependencies between subtasks clearly mapped with parallel execution identified
- [ ] All subtasks have sufficient technical detail for independent agent execution
- [ ] Agent assignments match subtask complexity and scope requirements
- [ ] Phase 3 completion checklist 100% complete

### Phase 4 Orchestration - Implementation Details

**Trigger**: Phase 3 completion validation passed
**Prompt**: `phase-4-implementation-details-prompt.md`
**Template**: `implementation-details-template.md` patterns

#### Phase 4 Execution Steps

1. **Validate Phase 3 Subtasks**
   - Confirm Phase 3 completion checklist is 100% complete
   - Review all atomic subtasks and dependency mapping
   - Identify critical subtasks requiring detailed implementation files

2. **Execute Phase 4 Workflow**
   - Create self-contained implementation specification files for critical subtasks
   - Populate implementation gap analysis (current vs required state)
   - Include complete background context and architectural references
   - Define specific validation commands and success indicators

3. **Phase 4 Quality Gates**
   - All critical subtasks have detailed implementation specification files
   - Each file contains complete context for independent agent execution
   - Implementation gap analysis clearly defines current vs required state
   - Technical specifications include concrete patterns and validation commands
   - All architectural references properly cited and validated
   - Story file updated with links to all implementation details files

4. **Phase 4 Validation Checkpoint**
   - Run citation validation on all implementation details files
   - Verify self-contained context completeness
   - Confirm implementation details links added to story subtasks
   - Check Phase 4 completion checklist is 100% complete

#### Phase 4 Success Criteria

- [ ] All critical subtasks have self-contained implementation specification files
- [ ] Each implementation details file provides complete context for independent agent execution
- [ ] Implementation gap analysis clearly defines current vs required state for each subtask
- [ ] Technical specifications include concrete patterns, examples, and validation commands
- [ ] All architectural references properly cited and validated
- [ ] Story file updated with links to all implementation details files

## Workflow Management Features

### Progress Tracking System

The orchestrator maintains comprehensive progress tracking across all phases:

1. **Phase-Level Progress**: Track completion of each major phase
2. **Step-Level Progress**: Monitor individual workflow steps within each phase
3. **Quality Gate Status**: Track validation checkpoint completion
4. **Citation Validation**: Monitor citation integrity across all phases

### Resume Capability

The orchestrator supports resuming from any phase boundary:

1. **Phase Assessment**: Determine current phase completion status
2. **Context Recovery**: Load existing work and validate completeness
3. **Continuation Planning**: Identify next steps and required inputs
4. **Quality Validation**: Ensure previous phases meet completion criteria

### Error Recovery

When errors or quality issues are detected:

1. **Issue Identification**: Clearly identify the specific problem and phase
2. **Remediation Guidance**: Provide specific steps to resolve the issue
3. **Validation Confirmation**: Ensure issue resolution before proceeding
4. **Context Preservation**: Maintain all valid work while fixing issues

## Orchestrator Commands and Usage

### Starting New Story Creation

```bash
# Begin Phase 1 with epic source
User: "Create a new user story from [epic source] using the 4-phase system"
```

The orchestrator will:
1. Load Phase 1 prompt and story shell template
2. Guide through complete Phase 1 workflow
3. Validate Phase 1 completion before proceeding
4. Continue through all 4 phases with quality gates

### Resuming from Specific Phase

```bash
# Resume from specific phase
User: "Resume the 4-phase workflow from Phase [N] for story [story-file]"
```

The orchestrator will:
1. Assess current story state and validate previous phases
2. Load appropriate phase prompt and templates
3. Continue from specified phase with full context
4. Ensure quality gates are maintained

### Quality Validation Commands

```bash
# Validate citations across all story files
npm run citation:validate <story-file-path>

# Extract and validate architectural base paths
npm run citation:base-paths <story-file-path> -- --format json

# Validate specific implementation details files
npm run citation:validate <implementation-details-file-path>
```

## Orchestrator Quality Assurance

### Comprehensive Validation Framework

The orchestrator enforces quality at multiple levels:

1. **Phase Completion**: All phase checklist items must be 100% complete
2. **Citation Integrity**: All architectural references validated via citation manager
3. **Template Compliance**: All files follow proper template structure and formatting
4. **Atomic Requirements**: All tasks and subtasks meet strict atomic requirements
5. **Agent Compatibility**: All assignments match agent capabilities and scope

### Quality Gate Enforcement

Each phase transition includes mandatory quality gates:

1. **Content Completeness**: All template sections properly populated
2. **Citation Validation**: All architectural references working and accessible
3. **Progress Tracking**: All progress items marked complete
4. **Checklist Validation**: Phase completion checklists 100% complete
5. **Next Phase Readiness**: Confirmation that next phase can begin

### Error Prevention Mechanisms

The orchestrator includes built-in error prevention:

1. **Template Validation**: Ensure proper template usage and formatting
2. **Citation Checking**: Validate architectural references before proceeding
3. **Atomic Compliance**: Verify task and subtask atomic requirements
4. **Agent Assignment**: Confirm agent assignments match capabilities
5. **Dependency Mapping**: Validate task and subtask dependencies

## Success Metrics and Completion Criteria

### System-Level Success Criteria

The 4-phase system is considered successful when:

1. **Complete Story Development**: Epic requirements transformed into implementation-ready specifications
2. **Quality Assurance**: All quality gates passed and validation checkpoints satisfied
3. **Agent Readiness**: All deliverables ready for independent agent execution
4. **Citation Integrity**: All architectural references validated and accessible
5. **Resume Capability**: System can be paused and resumed at any phase boundary

### Deliverable Quality Standards

All final deliverables must meet these standards:

1. **Story File**: Complete with architectural context, tasks, subtasks, and implementation links
2. **Implementation Details**: Self-contained files with complete execution context
3. **Citation Validation**: All references working and properly validated
4. **Agent Compatibility**: All assignments appropriate for agent capabilities
5. **TDD Compliance**: All workflows follow proper RED-GREEN-REFACTOR cycles

## Orchestrator Agent Assignments

### Primary Orchestrator Agents

- **User-Story-Manager Agent**: Lead orchestrator for story management and requirements traceability
- **Application-Tech-Lead Agent**: Technical orchestrator for architectural validation and quality gates

### Phase-Specific Agent Coordination

- **Phase 1**: User-Story-Manager with Application-Tech-Lead for architectural context
- **Phase 2**: Application-Tech-Lead with User-Story-Manager for requirements mapping
- **Phase 3**: User-Story-Manager with Application-Tech-Lead for TDD workflow design
- **Phase 4**: Application-Tech-Lead with User-Story-Manager for implementation specifications

## Next Steps After Orchestration

When the 4-phase system is complete:

1. **Implementation Readiness**: All subtasks and implementation details ready for agent execution
2. **Execution Planning**: Begin implementation using the generated specifications
3. **Progress Monitoring**: Track implementation progress against defined success criteria
4. **Quality Assurance**: Validate implementation results against acceptance criteria

The orchestrated 4-phase system provides a complete, quality-assured pathway from epic requirements to implementation-ready specifications, enabling efficient and effective user story development with built-in quality gates and resume capability.
