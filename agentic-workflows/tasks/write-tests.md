---
type: task
task-name: write-tests
description: Create comprehensive test suite based on user story acceptance criteria following TDD principles and integration-first testing approach
required-inputs:
  - name: story-file
    description: Path to user story file containing acceptance criteria and testing requirements
    expected-type: user-story
    validation: file-exists
---

# Write Tests Task

## Purpose

Create a comprehensive, integration-first test suite based on user story acceptance criteria that validates actual functionality with real operations. This task implements TDD principles by writing tests before implementation exists, ensuring requirements are properly validated.

## SEQUENTIAL Task Execution (Do not proceed until current Task is complete)

### 1. Read and Analyze Story Requirements

- Load user story from @{{input.user-story-path}}
- Read the complete user story file including:
  - Acceptance Criteria: Extract all testable requirements and edge cases
  - Dev Notes > Testing subsection: Review testing framework, standards, and file location guidance  
  - Tasks/Subtasks: Understand implementation scope to inform test scenarios
- Identify key interfaces, data flows, and integration points that need testing coverage
- Note any existing test files or testing patterns mentioned in the story

### 2. Research Current Testing Infrastructure

- **Investigate existing test structure** using Read/LS/Glob tools:
  - Locate existing test directories (src/tests/, **tests**, etc.)
  - Check for test configuration files (vitest.config.ts, jest.config.js, etc.)
  - Review existing test files for patterns, frameworks, and conventions
- **Analyze target implementation interfaces** using Grep/Read tools:
  - Find interface definitions, type files, and API contracts that tests will validate
  - Identify integration points: file operations, database calls, API endpoints
  - **CRITICAL**: Never assume interfaces - always verify actual code definitions

### 3. Design Integration-First Test Strategy

- **Plan test structure** based on acceptance criteria:
  - Integration tests (primary): End-to-end workflows with real operations
  - Unit tests (minimal): Pure business logic and utility functions only
  - E2E tests (when needed): Complex user interactions requiring Playwright
- **Design real operation scenarios**:
  - Use temporary directories for file operations (no mocking file system)
  - Plan actual database operations (no mocking database calls)  
  - Design real API calls with actual endpoints (avoid mock responses)
- **Map acceptance criteria to specific test cases** with concrete assertions

### 4. Create Test Files Following Framework Standards

- **Create test files** in appropriate directories following discovered conventions:
  - Integration tests: Primary focus with real system operations
  - Unit tests: Only for isolated business logic
  - Follow naming conventions discovered in step 2
  - **IMMEDIATE CHECKPOINT**: Mark `- [x]` for test file creation subtasks as each file is created
- **Write tests using TDD approach**:
  - Write failing tests first (implementation doesn't exist yet)
  - Focus on acceptance criteria validation with specific assertions
  - Use real operations: actual file I/O, database connections, API calls
  - **FORBIDDEN**: Mock, AsyncMock, MagicMock patterns in integration tests
  - **IMMEDIATE CHECKPOINT**: Mark `- [x]` for each specific test scenario subtask as it's implemented
- **Ensure TypeScript compliance**:
  - Match actual interface definitions (verified in step 2)
  - Handle unknown types with proper casting
  - Use optional chaining for potentially undefined properties
- **Complete task checkboxes**:
  - **IMMEDIATE**: Mark `- [x]` for main "Unit Testing (AC: All)" task when all unit subtasks complete
  - **IMMEDIATE**: Mark `- [x]` for main "Integration Testing (AC: 1, 2, 4, 5)" task when all integration subtasks complete

### 5. Implement Test Execution and Validation

- **Execute test suite** using discovered test commands:
  - Run tests to verify they fail appropriately (TDD red phase)
  - Check for TypeScript compilation errors and fix interface mismatches
  - Validate test framework configuration and dependencies
  - **IMMEDIATE CHECKPOINT**: Mark `- [x]` for coverage-related subtasks when test coverage is achieved
- **Fix compilation and runtime issues**:
  - Resolve TypeScript type errors and interface mismatches
  - Fix import/export issues and module resolution problems
  - Address any testing framework configuration issues
  - **IMMEDIATE CHECKPOINT**: Mark `- [x]` for any execution-validation subtasks as they're resolved
- **Research-escalation rule**: After 2 consecutive failures on same issue:
  - IMMEDIATELY use research tools (mcp__perplexity-mcp__search, WebSearch)
  - Research error messages, framework best practices, TypeScript patterns
  - Only implement solutions after research validation

### 6. Update Story Documentation

- **Update Testing subsection** in Dev Notes with:
  - Test file locations and structure created
  - Testing approach and framework usage
  - Key test scenarios that validate acceptance criteria
  - Any testing dependencies or configuration requirements
- **Add Test Writing Agent Record** section (if not exists) with:
  - Test files created and their purpose
  - Testing strategy implemented
  - Key challenges encountered and solutions
  - Coverage of acceptance criteria through test scenarios

**NOTE**: Task checkbox updates are handled in real-time during steps 4-5, not batched here.

## Success Criteria

- All acceptance criteria have corresponding test scenarios
- Integration tests use real operations (file I/O, database, API calls)  
- Tests fail appropriately (TDD red phase) since implementation doesn't exist yet
- TypeScript compilation passes without errors
- Testing framework executes tests successfully
- Story Testing subsection updated with comprehensive test documentation
- No mock/stub patterns used in integration tests (anti-mock compliance)

## Error Handling

- **After 2 failures on same issue**: Use research tools before making further changes
- **TypeScript errors**: Investigate actual interfaces using Read/Grep tools
- **Framework issues**: Research testing framework documentation and community solutions  
- **Integration problems**: Verify real system dependencies and configuration

## Key Principles

- **TDD approach**: Write failing tests before implementation exists
- **Integration-first**: Prefer real operations over mocked dependencies
- **Evidence-based**: Verify all interface assumptions through code analysis
- **MVP compliance**: Lean, focused test suites that prove functionality works
- **TypeScript excellence**: Ensure test interfaces match actual code interfaces
