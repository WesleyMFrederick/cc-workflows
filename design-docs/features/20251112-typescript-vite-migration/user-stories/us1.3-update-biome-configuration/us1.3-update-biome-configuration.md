---
title: "User Story 1.3: Update Biome Configuration for TypeScript Support"
feature-title: TypeScript + Vite Migration
epic-number: 1
epic-name: TypeScript Infrastructure Setup
epic-url: ../../typescript-vite-migration-prd.md#Epic%201%20TypeScript%20Infrastructure%20Setup
user-story-number: 1.3
status: Todo
---

# Story 1.3: Update Biome Configuration for TypeScript Support

## Story

**As a** developer,
**I want** Biome to lint and format TypeScript files with the same standards as JavaScript files,
**so that** code quality and formatting remain consistent as the codebase migrates to TypeScript.

_Source: [Epic 1: TypeScript Infrastructure Setup](../../typescript-vite-migration-prd.md#Epic%201%20TypeScript%20Infrastructure%20Setup)_

## Acceptance Criteria

1. The `biome.json` configuration SHALL be updated to include TypeScript file patterns (`*.ts`, `*.tsx`). ^US1-3AC1
2. Biome SHALL successfully lint TypeScript configuration files with zero errors. ^US1-3AC2
3. Biome SHALL successfully format TypeScript configuration files without modifying existing JavaScript formatting. ^US1-3AC3
4. The `npx biome check .` command SHALL complete successfully in the worktree environment. ^US1-3AC4
5. All existing JavaScript files SHALL pass Biome checks unchanged (zero regressions). ^US1-3AC5

_Source: [Epic 1 Validation Criteria](../../typescript-vite-migration-prd.md#Epic%201%20TypeScript%20Infrastructure%20Setup)_

## Technical Context

### Biome TypeScript Support

Biome has native TypeScript support built-in. The update strategy:

**Minimal Configuration Changes:**
- Add `.ts` and `.tsx` extensions to existing file patterns
- Biome automatically detects TypeScript syntax
- Same linting rules apply to both JavaScript and TypeScript

**No New Rules Required:**
- Biome's existing ruleset works for TypeScript
- Type checking handled by TypeScript compiler (`tsc`)
- Biome focuses on code quality and formatting

### Configuration Strategy

Per the workspace standard established in earlier work:

**`biome.json` Updates:**
- Add `**/*.ts` and `**/*.tsx` to include patterns
- Maintain existing JavaScript patterns
- Preserve all existing linting and formatting rules
- No changes to rule severity or formatting options

**Validation Approach:**
- Test against TypeScript config files (tsconfig.json is JSON, not TS)
- Verify no impact on existing JavaScript files
- Confirm same formatting standards applied to TypeScript

### Architectural Context (C4)

This story extends the existing code quality infrastructure to TypeScript.

**Components Affected:**
- Biome linter/formatter configuration
- Pre-commit hooks (future integration point)
- CI/CD pipeline (future integration point)

**Implementation Guides:**
- [Biome Documentation - TypeScript](https://biomejs.dev/guides/integrate-in-your-editor/) - TypeScript integration guide

### Files Impacted

- `biome.json` (MODIFY) - Add TypeScript file patterns

### Dependencies

- **Prerequisite**: [[../us1.2-create-typescript-configuration-hierarchy/us1.2-create-typescript-configuration-hierarchy.md|US1.2: Create TypeScript Configuration Hierarchy]] - TypeScript configs available for linting validation
- **Enables**: [[../us1.4-add-build-scripts/us1.4-add-build-scripts.md|US1.4: Add Build Scripts]] - Code quality checks integrated into build process

### Design Principles Adherence

This story must adhere to the following [Design Principles](../../../../../ARCHITECTURE-PRINCIPLES.md):

**Critical Principles:**
- [[../../../../../ARCHITECTURE-PRINCIPLES.md#^foundation-reuse|Foundation Reuse]] (Foundation): Extends existing Biome configuration rather than replacing
- [[../../../../../ARCHITECTURE-PRINCIPLES.md#^safety-first-principles-definition|Safety-First]] (Foundation): JavaScript linting unchanged, zero regressions

**Implementation Guidance:**
- Minimal configuration changes (add file patterns only)
- Validate against TypeScript files created in US1.2
- Ensure existing JavaScript checks unaffected
- Run `npx biome check .` before and after to confirm no regressions

### Testing

- **Test Framework**: Biome CLI
- **Test Strategy**: Validation-based - Biome checks TypeScript files successfully
- **Test Location**: No new tests required - use Biome CLI for validation

#### Required Validation Steps

##### 1. Biome TypeScript Linting Validation
- **Purpose**: Verify Biome successfully lints TypeScript configuration files
- **Acceptance Criteria**: Validates [[#^US1-3AC1|AC1]], [[#^US1-3AC2|AC2]]
- **Validation Steps**:
  - Run `npx biome check tsconfig.json tsconfig.base.json`
  - Run `npx biome check tools/citation-manager/tsconfig.json`
  - Should complete with zero errors

##### 2. Biome TypeScript Formatting Validation
- **Purpose**: Verify Biome formats TypeScript files without breaking JavaScript formatting
- **Acceptance Criteria**: Validates [[#^US1-3AC3|AC3]]
- **Validation Steps**:
  - Run `npx biome format --write .`
  - Verify TypeScript config files formatted
  - Verify existing JavaScript files unchanged (use `git diff`)

##### 3. Biome Full Check Validation
- **Purpose**: Confirm full Biome check passes in worktree environment
- **Acceptance Criteria**: Validates [[#^US1-3AC4|AC4]]
- **Validation Steps**:
  - Run `npx biome check .` from workspace root
  - Should complete successfully with zero errors

##### 4. JavaScript Regression Validation
- **Purpose**: Confirm existing JavaScript files still pass Biome checks unchanged
- **Acceptance Criteria**: Validates [[#^US1-3AC5|AC5]]
- **Validation Steps**:
  - Run `npx biome check tools/citation-manager/src/` (JavaScript source)
  - Run `npx biome check tools/citation-manager/test/` (JavaScript tests)
  - Should pass with same results as before configuration update

## Tasks / Subtasks

### Phase 1: Configuration Update

- [ ] **1.1. Update biome.json with TypeScript File Patterns** ^US1-3T1-1
  - **Objective**: Add TypeScript file extensions to Biome configuration
  - **Input**: Existing `biome.json`, TypeScript configs from US1.2
  - **Output**: Updated `biome.json` with TypeScript support
  - **Files**:
    - `biome.json` (modify)
  - **Scope**:
    - Locate `files.include` section in biome.json
    - Add `**/*.ts` and `**/*.tsx` patterns to include array
    - Preserve all existing JavaScript patterns
    - Maintain all existing linting and formatting rules unchanged
    - No changes to rule severity or formatting options
  - **Validation**: Valid JSON, parseable by Biome CLI
  - _Requirements_: [[#^US1-3AC1|AC1]]
  - _Leverage_: Existing `biome.json` structure

### Phase 2: Validation

- [ ] **2.1. Validate Biome Lints TypeScript Configuration Files** ^US1-3T2-1
  - **Objective**: Verify Biome successfully lints TypeScript config files with zero errors
  - **Input**: Updated biome.json from Task 1.1, TypeScript configs from US1.2
  - **Output**: Biome linting validation report
  - **Commands**:
    ```bash
    cd ../cc-workflows-typescript

    # Lint TypeScript configuration files
    npx biome check tsconfig.json tsconfig.base.json
    npx biome check tools/citation-manager/tsconfig.json
    ```
  - **Validation**: Zero linting errors for TypeScript config files
  - _Requirements_: [[#^US1-3AC2|AC2]]
  - _Leverage_: Biome native TypeScript support

- [ ] **2.2. Validate Biome Formats TypeScript Without Breaking JavaScript** ^US1-3T2-2
  - **Objective**: Confirm TypeScript formatting works without impacting JavaScript files
  - **Input**: Updated biome.json from Task 1.1
  - **Output**: Formatting validation report
  - **Commands**:
    ```bash
    cd ../cc-workflows-typescript

    # Check current state
    git status

    # Format all files
    npx biome format --write .

    # Verify TypeScript configs formatted, JavaScript unchanged
    git diff
    ```
  - **Validation**: TypeScript configs formatted, existing JavaScript files show no changes
  - _Requirements_: [[#^US1-3AC3|AC3]]
  - _Leverage_: Biome formatting consistency

- [ ] **2.3. Execute Full Biome Check in Worktree** ^US1-3T2-3
  - **Objective**: Verify complete Biome check passes in worktree environment
  - **Input**: Updated biome.json from Task 1.1
  - **Output**: Full check validation report
  - **Commands**:
    ```bash
    cd ../cc-workflows-typescript
    npx biome check .
    ```
  - **Validation**: Command completes successfully with zero errors
  - _Requirements_: [[#^US1-3AC4|AC4]]
  - _Leverage_: Biome CLI comprehensive check

- [ ] **2.4. Validate JavaScript Files Pass Biome Checks Unchanged** ^US1-3T2-4
  - **Objective**: Confirm existing JavaScript files still pass Biome checks (zero regressions)
  - **Input**: Updated biome.json from Task 1.1, existing JavaScript source
  - **Output**: Regression validation report
  - **Commands**:
    ```bash
    cd ../cc-workflows-typescript

    # Check JavaScript source files
    npx biome check tools/citation-manager/src/

    # Check JavaScript test files
    npx biome check tools/citation-manager/test/
    ```
  - **Validation**: All JavaScript files pass with same results as before update
  - _Requirements_: [[#^US1-3AC5|AC5]]
  - _Leverage_: Existing JavaScript codebase validation

### Acceptance Criteria Coverage

**AC1 Coverage** ([[#^US1-3AC1|AC1]] - TypeScript patterns added):
- Task 1.1: Adds `*.ts` and `*.tsx` to biome.json includes
- Task 2.1: Validates TypeScript files detected

**AC2 Coverage** ([[#^US1-3AC2|AC2]] - TypeScript linting works):
- Task 2.1: Lints TypeScript config files successfully
- Verification: Zero linting errors

**AC3 Coverage** ([[#^US1-3AC3|AC3]] - Formatting consistency):
- Task 2.2: Formats TypeScript without changing JavaScript
- Verification: `git diff` shows only TypeScript changes

**AC4 Coverage** ([[#^US1-3AC4|AC4]] - Full check passes):
- Task 2.3: Runs `npx biome check .` successfully
- Verification: Zero errors

**AC5 Coverage** ([[#^US1-3AC5|AC5]] - Zero JavaScript regressions):
- Task 2.4: Validates JavaScript files unchanged
- Verification: Same Biome check results as before

### Task Sequencing

#### Sequential Dependencies

**Task 1.1 → Phase 2**: Must update configuration before validation
- Dependency Rationale: Cannot validate TypeScript support without configuration update

#### Parallel Execution Groups

**Group 1 - Phase 2 Validation**:
- Tasks [[#^US1-3T2-1|2.1]], [[#^US1-3T2-2|2.2]], [[#^US1-3T2-3|2.3]], and [[#^US1-3T2-4|2.4]] can execute in parallel
- Independent validation steps
- Parallel execution saves 30-45 seconds

### Execution Sequence

**Wave 1 - Configuration Update** (Estimated: 2-3 min):
- Execute: Task [[#^US1-3T1-1|1.1]]
- Deliverable: Updated biome.json with TypeScript support
- **Block Condition**: Wave 2 blocked until configuration updated

**Wave 2 - Validation** (Estimated: 15-20 sec):
- Execute: Tasks [[#^US1-3T2-1|2.1]], [[#^US1-3T2-2|2.2]], [[#^US1-3T2-3|2.3]], [[#^US1-3T2-4|2.4]] in parallel
- Deliverable: Full validation confirming TypeScript support working
- Prerequisite: Wave 1 complete

**Total Estimated Duration**: 3-5 minutes
**Critical Path**: Wave 1 → Wave 2
**Time Savings**: ~30-45 seconds via parallel validation (Wave 2)

---

## Additional Implementation Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Biome version incompatibility | Low | Biome has supported TypeScript for multiple versions |
| TypeScript-specific lint rules needed | Low | Biome's existing rules work for TypeScript |
| Formatting differences break builds | Low | Validate with `git diff` before committing |

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-11-13 | 1.0 | Initial user story creation for Epic 1 | Application Tech Lead (Claude Sonnet 4.5) |

## Related Documentation

- [TypeScript + Vite Migration PRD](../../typescript-vite-migration-prd.md) - Parent feature PRD
- [Epic 1: TypeScript Infrastructure Setup](../../typescript-vite-migration-prd.md#Epic%201%20TypeScript%20Infrastructure%20Setup) - Epic definition
- [Biome Documentation](https://biomejs.dev/) - Official Biome documentation
- [ARCHITECTURE-PRINCIPLES.md](../../../../../ARCHITECTURE-PRINCIPLES.md) - Design principles reference
