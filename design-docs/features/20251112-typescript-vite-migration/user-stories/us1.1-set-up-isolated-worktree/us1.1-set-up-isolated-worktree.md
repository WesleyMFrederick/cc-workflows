---
title: "User Story 1.1: Set Up Isolated Worktree for TypeScript Infrastructure"
feature-title: TypeScript + Vite Migration
epic-number: 1
epic-name: TypeScript Infrastructure Setup
epic-url: ../../typescript-vite-migration-prd.md#Epic%201%20TypeScript%20Infrastructure%20Setup
user-story-number: 1.1
status: Todo
---

# Story 1.1: Set Up Isolated Worktree for TypeScript Infrastructure

## Story

**As a** developer,
**I want** an isolated git worktree for TypeScript infrastructure changes,
**so that** I can safely configure TypeScript build system without impacting the main working directory or breaking existing functionality.

_Source: [Epic 1: TypeScript Infrastructure Setup](../../typescript-vite-migration-prd.md#Epic%201%20TypeScript%20Infrastructure%20Setup)_

## Acceptance Criteria

1. A new git worktree SHALL be created in an isolated directory for TypeScript infrastructure work. ^US1-1AC1
2. The worktree SHALL be on a dedicated feature branch following the naming convention `feature/typescript-infrastructure-setup`. ^US1-1AC2
3. The worktree environment SHALL have all dependencies installed via `npm install`. ^US1-1AC3
4. The existing test suite SHALL pass in the worktree environment, confirming clean starting state. ^US1-1AC4
5. The worktree SHALL be verified as isolated from the main working directory (changes in worktree do not affect main directory). ^US1-1AC5

_Source: [Epic 1 Validation Criteria](../../typescript-vite-migration-prd.md#Epic%201%20TypeScript%20Infrastructure%20Setup)_

## Technical Context

### Why Isolated Worktree?

Per [[#^NFR4|NFR4]] (Safety-First Design), infrastructure changes must not touch existing code. An isolated worktree provides:

- **Isolation**: Infrastructure experimentation without risk to main working directory
- **Rollback Safety**: Easy to abandon worktree if configuration fails
- **Parallel Work**: Main directory remains operational for other work
- **Clean Validation**: Proves infrastructure works independently before integration

### Architectural Context (C4)

This story establishes the workspace foundation for all subsequent Epic 1 user stories.

**Components Affected:**
- Git worktree management
- NPM workspace dependency resolution
- Vitest test runner (validation)

**Implementation Guides:**
- `.claude/skills/using-git-worktrees/SKILL.md` - Git worktree creation patterns

### Files Impacted

- `.git/worktrees/` (Git internal worktree metadata - created automatically)
- `../cc-workflows-typescript/` (New worktree directory - location TBD during implementation)
- `.git/config` (Git configuration updated with worktree reference)

### Dependencies

- **Prerequisite**: Epic 0 (Architecture Documentation) complete - TypeScript standards documented
- **Enables**: [US1.2: Create TypeScript Configuration Hierarchy](../us1.2-create-typescript-configuration-hierarchy/us1.2-create-typescript-configuration-hierarchy.md) - Provides isolated environment for config changes
- **Enables**: All subsequent Epic 1 user stories - Foundation for infrastructure work

### Design Principles Adherence

This story must adhere to the following [Design Principles](../../../../../ARCHITECTURE-PRINCIPLES.md):

**Critical Principles:**
- [[../../../../../ARCHITECTURE-PRINCIPLES.md#^safety-first-principles-definition|Safety-First]] (Foundation): Isolated environment prevents breaking existing code
- [[../../../../../ARCHITECTURE-PRINCIPLES.md#^mvp-principles-definition|MVP Principles]] (Foundation): Validates workspace isolation before infrastructure changes
- [[../../../../../ARCHITECTURE-PRINCIPLES.md#^foundation-reuse|Foundation Reuse]] (Foundation): Establishes pattern for future worktree-based development

**Implementation Guidance:**
- Use `using-git-worktrees` skill for worktree creation
- Verify npm workspaces resolve correctly in isolated environment
- Confirm test suite passes before proceeding to configuration changes
- Document worktree location and branch name for future reference

### Testing

- **Test Framework**: Vitest (workspace standard)
- **Test Strategy**: Validation-based - verify existing test suite passes in worktree
- **Test Location**: No new tests required - use existing test suite for validation

#### Required Validation Steps

##### 1. Worktree Creation Validation
- **Purpose**: Verify worktree created successfully in isolated directory
- **Acceptance Criteria**: Validates [[#^US1-1AC1|AC1]] (worktree created), [[#^US1-1AC2|AC2]] (feature branch)
- **Validation Steps**:
  - Run `git worktree list` - should show new worktree path and branch
  - Verify worktree directory exists and contains repository files
  - Confirm feature branch created and checked out

##### 2. Dependency Installation Validation
- **Purpose**: Verify npm workspaces resolve correctly in isolated environment
- **Acceptance Criteria**: Validates [[#^US1-1AC3|AC3]] (dependencies installed)
- **Validation Steps**:
  - Run `npm install` in worktree directory
  - Verify `node_modules/` populated with all workspace packages
  - Confirm no installation errors or warnings

##### 3. Test Suite Validation
- **Purpose**: Confirm clean starting state with all tests passing
- **Acceptance Criteria**: Validates [[#^US1-1AC4|AC4]] (tests pass)
- **Validation Steps**:
  - Run `npm test` in worktree directory
  - All existing tests must pass with zero failures
  - Confirms environment matches main working directory functionality

##### 4. Isolation Verification
- **Purpose**: Verify worktree isolated from main working directory
- **Acceptance Criteria**: Validates [[#^US1-1AC5|AC5]] (isolation confirmed)
- **Validation Steps**:
  - Make test change in worktree (e.g., create temporary file)
  - Verify change NOT present in main working directory
  - Remove test change and confirm worktree clean

## Tasks / Subtasks

### Phase 1: Worktree Creation

- [ ] **1.1. Create Git Worktree for TypeScript Infrastructure** ^US1-1T1-1
  - **Objective**: Create isolated git worktree on feature branch for infrastructure changes
  - **Input**: `using-git-worktrees` skill, main repository clean state
  - **Output**: New worktree in isolated directory on `feature/typescript-infrastructure-setup` branch
  - **Commands**:
    ```bash
    # Create worktree (skill will determine optimal location)
    git worktree add ../cc-workflows-typescript feature/typescript-infrastructure-setup

    # Verify worktree created
    git worktree list
    ```
  - **Validation**: Worktree directory exists, feature branch checked out
  - _Requirements_: [[#^US1-1AC1|AC1]], [[#^US1-1AC2|AC2]]
  - _Leverage_: `using-git-worktrees` skill

### Phase 2: Environment Setup

- [ ] **2.1. Install Dependencies in Worktree** ^US1-1T2-1
  - **Objective**: Install all workspace dependencies in isolated worktree environment
  - **Input**: Worktree from Task 1.1, root `package.json`
  - **Output**: Fully populated `node_modules/` with workspace packages
  - **Commands**:
    ```bash
    cd ../cc-workflows-typescript
    npm install
    ```
  - **Validation**: No installation errors, all workspace packages linked
  - _Requirements_: [[#^US1-1AC3|AC3]]
  - _Leverage_: NPM workspaces dependency resolution

### Phase 3: Validation

- [ ] **3.1. Execute Test Suite in Worktree** ^US1-1T3-1
  - **Objective**: Validate clean starting state by running existing test suite
  - **Input**: Worktree with dependencies from Task 2.1
  - **Output**: Test execution report showing all tests passing
  - **Commands**:
    ```bash
    cd ../cc-workflows-typescript
    npm test
    ```
  - **Validation**: All tests pass with zero failures
  - _Requirements_: [[#^US1-1AC4|AC4]]
  - _Leverage_: Existing Vitest test suite

- [ ] **3.2. Verify Worktree Isolation** ^US1-1T3-2
  - **Objective**: Confirm worktree changes isolated from main working directory
  - **Input**: Worktree from Task 2.1, main working directory
  - **Output**: Verification that worktree and main directory are independent
  - **Commands**:
    ```bash
    # In worktree
    cd ../cc-workflows-typescript
    echo "test" > .worktree-isolation-test

    # In main directory
    cd /home/user/cc-workflows
    ls -la .worktree-isolation-test  # Should not exist

    # Clean up test file
    cd ../cc-workflows-typescript
    rm .worktree-isolation-test
    ```
  - **Validation**: Test file exists in worktree only, not in main directory
  - _Requirements_: [[#^US1-1AC5|AC5]]
  - _Leverage_: Git worktree isolation mechanism

### Acceptance Criteria Coverage

**AC1 Coverage** ([[#^US1-1AC1|AC1]] - Worktree created):
- Task 1.1: Creates git worktree in isolated directory
- Task 3.2: Verifies worktree exists and is isolated

**AC2 Coverage** ([[#^US1-1AC2|AC2]] - Feature branch):
- Task 1.1: Creates worktree on `feature/typescript-infrastructure-setup` branch
- Verification: `git worktree list` shows correct branch

**AC3 Coverage** ([[#^US1-1AC3|AC3]] - Dependencies installed):
- Task 2.1: Runs `npm install` in worktree
- Verification: `node_modules/` populated

**AC4 Coverage** ([[#^US1-1AC4|AC4]] - Tests pass):
- Task 3.1: Executes full test suite
- Verification: All tests pass with zero failures

**AC5 Coverage** ([[#^US1-1AC5|AC5]] - Isolation verified):
- Task 3.2: Creates test file in worktree, verifies not in main directory
- Verification: File exists in worktree only

### Task Sequencing

#### Sequential Dependencies

**Task 1.1 → Task 2.1**: Must create worktree before installing dependencies
- Dependency Rationale: Cannot install dependencies without worktree directory

**Task 2.1 → Task 3.1**: Must install dependencies before running tests
- Dependency Rationale: Test suite requires workspace packages

**Task 2.1 → Task 3.2**: Should complete environment setup before isolation verification
- Dependency Rationale: Cleaner to verify isolation after full setup

#### Parallel Execution Groups

**Group 1 - Validation Tasks**:
- Tasks [[#^US1-1T3-1|3.1]] and [[#^US1-1T3-2|3.2]] can execute in parallel
- Independent validation steps
- Parallel execution saves 2-3 minutes

### Execution Sequence

**Wave 1 - Worktree Creation** (Estimated: 2-3 min):
- Execute: Task [[#^US1-1T1-1|1.1]]
- Deliverable: Isolated worktree on feature branch
- **Block Condition**: Wave 2 blocked until worktree created

**Wave 2 - Environment Setup** (Estimated: 30-60 sec):
- Execute: Task [[#^US1-1T2-1|2.1]]
- Deliverable: Dependencies installed in worktree
- Prerequisite: Wave 1 complete
- **Block Condition**: Wave 3 blocked until dependencies installed

**Wave 3 - Validation** (Estimated: 10-15 sec):
- Execute: Tasks [[#^US1-1T3-1|3.1]] and [[#^US1-1T3-2|3.2]] in parallel
- Deliverable: Clean state confirmed, isolation verified
- Prerequisite: Wave 2 complete

**Total Estimated Duration**: 3-5 minutes
**Critical Path**: Wave 1 → Wave 2 → Wave 3
**Time Savings**: ~2-3 minutes via parallel validation (Wave 3)

---

## Additional Implementation Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Worktree path conflicts | Medium | Use `using-git-worktrees` skill for automatic path selection |
| NPM workspace resolution fails | High | Verify `package.json` workspaces configuration before starting |
| Disk space insufficient | Low | Check available space before creating worktree |

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-11-13 | 1.0 | Initial user story creation for Epic 1 | Application Tech Lead (Claude Sonnet 4.5) |

## Related Documentation

- [TypeScript + Vite Migration PRD](../../typescript-vite-migration-prd.md) - Parent feature PRD
- [Epic 1: TypeScript Infrastructure Setup](../../typescript-vite-migration-prd.md#Epic%201%20TypeScript%20Infrastructure%20Setup) - Epic definition
- [Using Git Worktrees Skill](../../../../../.claude/skills/using-git-worktrees/SKILL.md) - Worktree creation patterns
- [ARCHITECTURE-PRINCIPLES.md](../../../../../ARCHITECTURE-PRINCIPLES.md) - Design principles reference
