---
type: task
task-name: implement-story
description: Implement user story requirements by writing code that makes tests pass while following TDD principles and project conventions
required-inputs:
  - name: story-file
    description: Path to user story file containing acceptance criteria, tasks, and implementation requirements
    expected-type: user-story
    validation: file-exists
---

# Implement Story Task

## Purpose

Implement user story requirements by writing production code that makes existing tests pass. This task follows TDD principles by implementing the minimum code required to satisfy test requirements and acceptance criteria while maintaining code quality and project conventions.

## SEQUENTIAL Task Execution (Do not proceed until current Task is complete)

### 1. Read and Analyze Story Requirements

- Load user story from @{{input.user-story-path}}
- Read the complete user story file including:
  - Acceptance Criteria: Extract all implementation requirements and success criteria
  - Dev Notes: Review technical specifications, API requirements, and coding standards
  - Tasks/Subtasks: Identify specific implementation tasks assigned to the development agent
  - Testing section: Review existing tests to understand expected interfaces and behavior
- Identify key components, interfaces, and integration points that need implementation
- Note any existing code patterns, dependencies, or configuration requirements mentioned in story

### 2. Research Current Codebase and Test Requirements

- **Investigate existing code structure** using Read/LS/Glob tools:
  - Locate relevant source directories and existing implementations
  - Check for related components, utilities, and patterns to follow
  - Review existing interfaces, types, and API contracts
- **Analyze test expectations** using Grep/Read tools:
  - Find test files that need to pass with the implementation
  - Identify expected interfaces, method signatures, and return types
  - **CRITICAL**: Never assume interfaces - always verify actual test expectations

### 3. Design Implementation Strategy

- **Plan implementation approach** based on acceptance criteria and test requirements:
  - Identify minimum code needed to make tests pass (TDD red-to-green approach)
  - Follow existing code patterns and project conventions discovered in step 2
  - Plan integration points with existing systems and components
- **Design code structure**:
  - Use existing directory structure and naming conventions
  - Follow established patterns for error handling, logging, and configuration
  - Plan interfaces that satisfy both tests and acceptance criteria

### 4. Implement Code Following Project Standards

- **Create/modify implementation files** following discovered conventions:
  - Write minimum viable code to make tests pass
  - Follow naming conventions, code style, and architectural patterns
  - Use existing libraries, utilities, and established patterns
- **Write code using TDD approach**:
  - Focus on making existing tests pass (implementation phase of TDD)
  - Ensure acceptance criteria are satisfied through working code
  - Handle edge cases and error conditions appropriately
  - **ABSOLUTELY FORBIDDEN**: Modifying any test files, test directories, test infrastructure, or test logic
- **Ensure code quality**:
  - Follow TypeScript best practices and interface compliance
  - Use proper error handling with user-friendly messages
  - Add JSDoc comments for functions, classes, and interfaces
  - Maintain consistent code formatting and style

### 5. Validate Implementation and Execute Quality Gates

- **Validate implementation quality** (compilation and linting only):
  - Check for TypeScript compilation errors and fix interface mismatches
  - Run linting and formatting checks
  - **FORBIDDEN**: Do not run tests - this is handled by validation workflow
- **Run quality checks**:
  - Execute linting and type checking commands
  - Fix any code style, formatting, or type errors
  - Ensure all validations pass before marking tasks complete
- **Validation rule**: After 3 failures attempting to implement or fix something repeatedly:
  - HALT and request user guidance on approach or requirements

### 6. Update Story Documentation and Mark Tasks Complete

- **Update Tasks/Subtasks checkboxes** for completed implementation tasks (only those assigned to the development agent)
- **Update File List section** with all new, modified, or deleted source files
- **Add Dev Agent Record section** (if not exists) with:
  - Implementation approach and key technical decisions
  - Files created/modified and their purpose
  - Any challenges encountered and solutions applied
  - Integration points and dependencies utilized
  - **Handoff documentation for validation workflow**: Interface changes, expected behavior, fixture requirements
- **Mark story ready for test validation** when all implementation tasks complete:
  - Set story status to indicate handoff to validation workflow
  - Prepare clear handoff documentation for validation workflow with implementation details

## Success Criteria

- All acceptance criteria have corresponding working implementations
- Implementation is ready for validation workflow
- No regression in existing functionality
- TypeScript compilation passes without errors
- Code quality checks (linting, formatting) pass
- Story Tasks/Subtasks marked complete for development agent assignments
- File List updated with all implementation changes
- Code follows project conventions and established patterns

## Error Handling

- **After 3 failures on same implementation**: HALT and request user guidance
- **Test failures or test infrastructure issues**: Document for validation workflow, do not modify tests
- **Missing dependencies or configuration**: Confirm with user before proceeding
- **Breaking changes needed**: Request explicit requirement and approval
- **TypeScript/compilation errors**: Investigate actual interfaces using Read/Grep tools

## Key Principles

- **Implementation-focused approach**: Write production code to satisfy requirements and enable test validation
- **MVP-first approach**: Implement minimum code needed to meet requirements
- **Evidence-based**: Verify all interface assumptions through code analysis
- **Project conventions**: Follow established patterns, naming, and code style
- **Quality gates**: Ensure all validations pass before marking tasks complete
- **Absolute boundary respect**: NEVER modify test files, test directories, or test infrastructure
- **Clear handoff protocol**: Document implementation details for validation workflow

## Completion Criteria

- All implementation Tasks and Subtasks marked [x] (development agent assigned only)
- Implementation quality validations pass (compilation, linting)
- File List section complete with all changes
- Story status set to "Ready for Validation" with handoff to validation workflow
- Clear handoff documentation prepared for validation workflow

## Story File Updates Authorization

**CRITICAL**: ONLY UPDATE these specific sections of story files:
- Tasks/Subtasks checkboxes (development agent assigned only)
- Dev Agent Record section and all its subsections
- File List section
- Story Status (when implementation phase complete)

**FORBIDDEN**:
- DO NOT modify Story, Acceptance Criteria, Dev Notes, Testing sections, or other agent assignments
- DO NOT modify any files in test directories (tests/, **tests**, *.test.*, *.spec.*)
- DO NOT run test commands or validate test execution
- DO NOT modify test infrastructure, fixtures, or configuration
