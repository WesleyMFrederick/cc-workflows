# Phase 4: Implementation Details Prompt

## Executive Summary

This prompt guides AI agents through Phase 4 of the 4-phase user story system: creating self-contained implementation specification files for atomic subtasks that provide complete context for independent agent execution.

## Mission Context

**Objective**: Transform atomic subtasks from Phase 3 into detailed, self-contained implementation specification files that enable independent agent execution without requiring additional context.

**Input**: Story file from Phase 3 with atomic subtasks and TDD workflow structure
**Output**: Individual implementation details files for each subtask using `implementation-details-template.md` patterns

## Phase 4 Execution Framework

### Pre-Execution Requirements

Before beginning Phase 4, ensure you have:

1. **Completed Phase 3**: Story file with validated atomic subtasks and dependency mapping
2. **Template Access**: The `implementation-details-template.md` loaded for reference
3. **Architecture Context**: Complete understanding of architectural context from Phase 1
4. **Citation Manager**: Ability to validate citations and architectural references

### Execution Workflow

#### Step 1: Analyze Subtask Requirements

1. **Load Story File**: Open the story file with completed atomic subtasks from Phase 3
2. **Verify Completion**: Confirm Phase 3 completion checklist is 100% complete
3. **Review Subtask Structure**: Understand all atomic subtasks, dependencies, and TDD phases
4. **Identify Critical Subtasks**: Determine which subtasks require detailed implementation files
5. **Update Progress**: Mark Step 1 complete in Phase 4 Progress Tracking section

#### Step 2: Prioritize Implementation Details Creation

1. **Assess Complexity**: Identify subtasks that need detailed implementation specifications
2. **Consider Dependencies**: Prioritize subtasks that other subtasks depend on
3. **Evaluate Agent Needs**: Focus on subtasks where agents need additional implementation context
4. **Plan Creation Sequence**: Order implementation details creation for maximum efficiency
5. **Update Progress**: Mark Step 2 complete in Phase 4 Progress Tracking section

#### Step 3: Create Implementation Details Files

For each prioritized subtask:

1. **Create New File**: Use naming convention: `[phase-number]-[task-number]-[subtask-number]-[subtask-slug]-us[story-number].md`
2. **Populate Template**: Use `implementation-details-template.md` as starting structure
3. **Define Implementation Gap**: Clearly articulate current vs required state for the subtask
4. **Include Background Context**: Gather all architectural context needed for implementation
5. **Update Progress**: Mark Step 3 complete in Phase 4 Progress Tracking section

#### Step 4: Populate Implementation Gap Analysis

For each implementation details file:

1. **Define Objective**: Copy subtask objective exactly from Phase 3
2. **Describe Current State**: Detail what exists before this subtask begins
3. **Specify Required State**: Define what must exist after successful completion
4. **Identify Integration Requirements**: How this subtask integrates with existing components
5. **Update Progress**: Mark Step 4 complete in Phase 4 Progress Tracking section

#### Step 5: Gather Background Context

For each implementation details file:

1. **Extract Architectural Context**: Include relevant architectural information from Phase 1
2. **Map Dependencies**: List prerequisite subtasks and their outcomes
3. **Define Available Assets**: Document what files, classes, or functionality is available
4. **Specify Integration Points**: Detail connection points with existing implementations
5. **Create Context Gathering Steps**: Provide specific instructions for agents to gather additional context
6. **Update Progress**: Mark Step 5 complete in Phase 4 Progress Tracking section

#### Step 6: Define Implementation Requirements

For each implementation details file:

1. **List Affected Files**: All files that will be created, modified, or affected
2. **Describe Change Patterns**: Specific implementation approaches and technical patterns
3. **Provide Code Examples**: Implementation pattern examples showing expected structure
4. **Define Critical Rules**: Non-negotiable requirements and constraints
5. **Update Progress**: Mark Step 6 complete in Phase 4 Progress Tracking section

#### Step 7: Specify Validation and Integration

For each implementation details file:

1. **Define Validation Commands**: Exact commands to validate successful implementation
2. **List Success Indicators**: Specific checks that confirm completion
3. **Document Integration Notes**: How implementation fits into broader system
4. **Include Follow-up Considerations**: Notes for subsequent subtasks or implementations
5. **Update Progress**: Mark Step 7 complete in Phase 4 Progress Tracking section

#### Step 8: Link Back to Story and Finalize

1. **Update Story File**: Add implementation details links to each subtask
2. **Validate All Citations**: Run citation validation on all implementation details files
3. **Cross-Reference Check**: Ensure all implementation details files reference each other appropriately
4. **Mark Phase Complete**: Check "Phase 4 Ready for Implementation" in completion checklist
5. **Update Progress**: Mark Step 8 complete in Phase 4 Progress Tracking section

## Implementation Details File Structure

### File Naming Convention

Use this exact naming pattern:

```plaintext
[phase-number]-[task-number]-[subtask-number]-[subtask-slug]-us[story-number].md
```

Examples:
- `02-1-2-directory-manager-class-structure-us1.1.md`
- `03-2-1-version-detection-integration-test-us1.1.md`
- `04-3-2-error-handling-enhancement-us1.1.md`

### Implementation Gap Analysis Requirements

Every implementation details file must include:

1. **Objective**: Clear, specific objective copied from subtask definition
2. **Current State**: Detailed description of what exists before this subtask begins
3. **Required State**: Detailed description of what must exist after successful completion
4. **Integration Requirement**: How this implementation integrates with existing components and architecture

### Background Context Requirements

1. **Architectural Context**: Brief description of component's role in overall architecture
2. **Previous Subtask Dependencies**: List of prerequisite subtasks and their outcomes
3. **Available Assets**: What files, classes, or functionality is available from previous subtasks
4. **Integration Points**: Specific connection points with existing implementations
5. **Context Gathering Steps**: Specific instructions for gathering additional context

### Implementation Requirements Specifications

1. **Files**: All files that will be created, modified, or affected with action type
2. **Change Patterns**: Specific implementation approaches with technical details
3. **Code Examples**: Implementation pattern examples showing expected code structure
4. **Critical Rules**: Non-negotiable requirements and constraints with justifications

### Validation Framework Requirements

1. **Validation Commands**: Exact bash commands to validate successful implementation
2. **Success Indicators**: Specific, checkable indicators that confirm completion
3. **Integration Notes**: How implementation fits into broader system context
4. **Follow-up Considerations**: Notes for subsequent subtasks or implementations

## Critical Success Factors

### Self-Contained Context

- **Complete Information**: Each file contains ALL information needed for agent execution
- **No External Dependencies**: Agents should not need to read other files for context
- **Clear Instructions**: Step-by-step guidance that agents can follow directly
- **Technical Specifications**: Concrete implementation patterns and code examples

### Implementation Gap Clarity

- **Current vs Required**: Crystal clear articulation of the implementation gap
- **Specific Deliverables**: Exact definition of what success looks like
- **Integration Points**: Clear understanding of how this fits with other components
- **Validation Criteria**: Unambiguous success/failure criteria

### Architectural Alignment

- **Citation Integrity**: All architectural references properly cited and validated
- **Pattern Compliance**: Implementation follows established architectural patterns
- **Design Principle Adherence**: Implementation aligns with identified design principles
- **Technology Stack Consistency**: Uses specified technologies and dependencies

### Agent Execution Readiness

- **Actionable Guidance**: Concrete steps that agents can execute immediately
- **Error Prevention**: Guidance that helps agents avoid common pitfalls
- **Validation Commands**: Specific commands agents can run to confirm success
- **Quality Checkpoints**: Clear criteria for validating completion

## Common Pitfalls and Solutions

### Pitfall: Insufficient Context
**Solution**: Include ALL architectural context needed. Agents should not need to read other files. Use the background context section extensively.

### Pitfall: Vague Implementation Guidance
**Solution**: Provide specific code examples, exact file paths, and concrete technical patterns. Include step-by-step implementation guidance.

### Pitfall: Missing Validation Criteria
**Solution**: Define exact commands agents can run to validate success. Include specific, checkable success indicators.

### Pitfall: Poor Integration Documentation
**Solution**: Clearly document how this implementation connects with other components. Include integration points and follow-up considerations.

### Pitfall: Weak Citation Links
**Solution**: Validate all citations using citation manager. Ensure architectural references are accurate and accessible.

## Phase 4 Completion Validation

Before considering Phase 4 complete, verify:

- [ ] **Implementation Details Created**: All critical subtasks have detailed implementation specification files
- [ ] **Self-Contained Context**: Each file contains complete information for independent execution
- [ ] **Implementation Gap Defined**: Current vs required state clearly articulated for each file
- [ ] **Background Context Complete**: All architectural context and dependencies documented
- [ ] **Technical Specifications**: Detailed implementation requirements with code examples
- [ ] **Validation Framework**: Specific commands and success indicators defined
- [ ] **Citation Validation**: All architectural references validated using citation manager
- [ ] **Story Integration**: Implementation details links added to subtasks in story file
- [ ] **Phase 4 Progress**: All progress tracking items marked complete

## Next Phase Transition

When Phase 4 is complete:

1. **Verify Completion**: Ensure all validation items are checked
2. **Prepare for Execution**: Implementation details files are ready for agent execution
3. **Begin Implementation**: Agents can now execute subtasks independently using implementation details
4. **Monitor Progress**: Track implementation progress using the detailed specifications

## Agent-Specific Guidance

### For User-Story-Manager Agent

- Focus on ensuring implementation details maintain traceability to story requirements
- Validate that all architectural context is properly cited and referenced
- Ensure implementation details provide sufficient context for independent execution
- Maintain alignment between implementation details and original story objectives

### For Application-Tech-Lead Agent

- Emphasize architectural alignment and technical specification accuracy
- Ensure implementation details follow established patterns and design principles
- Validate technical completeness and implementation readiness
- Define quality gates and validation criteria for execution phase

### Quality Assurance Checkpoint

Phase 4 is considered complete when:

1. All critical subtasks have self-contained implementation specification files
2. Each implementation details file provides complete context for independent agent execution
3. Implementation gap analysis clearly defines current vs required state for each subtask
4. Technical specifications include concrete patterns, examples, and validation commands
5. All architectural references are properly cited and validated
6. Story file is updated with links to all implementation details files

The implementation details files created in Phase 4 serve as the complete specification for agent execution and provide the foundation for independent, high-quality implementation of all story requirements.
