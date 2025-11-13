---
title: "User Story 1.4: Add Build Scripts and Validate Infrastructure"
feature-title: TypeScript + Vite Migration
epic-number: 1
epic-name: TypeScript Infrastructure Setup
epic-url: ../../typescript-vite-migration-prd.md#Epic%201%20TypeScript%20Infrastructure%20Setup
user-story-number: 1.4
status: Todo
---

# Story 1.4: Add Build Scripts and Validate Infrastructure

## Story

**As a** developer,
**I want** npm scripts for TypeScript build, type checking, and infrastructure validation,
**so that** I can compile, validate, and test TypeScript infrastructure before source code conversion begins.

_Source: [Epic 1: TypeScript Infrastructure Setup](../../typescript-vite-migration-prd.md#Epic%201%20TypeScript%20Infrastructure%20Setup)_

## Acceptance Criteria

1. A `build:ts` npm script SHALL be added to compile TypeScript to JavaScript in `dist/` directories. ^US1-4AC1
2. A `type-check` npm script SHALL be added to validate TypeScript types without emitting files. ^US1-4AC2
3. A `check:all` npm script SHALL be added to run comprehensive infrastructure validation (types + lint + tests). ^US1-4AC3
4. The `build:ts` script SHALL successfully compile TypeScript configuration files (zero source files) with zero errors. ^US1-4AC4
5. The `type-check` script SHALL validate TypeScript configuration with zero type errors. ^US1-4AC5
6. The `check:all` script SHALL complete successfully, validating full infrastructure readiness. ^US1-4AC6
7. All existing JavaScript tests SHALL pass during infrastructure validation (zero functionality broken). ^US1-4AC7
8. Documentation SHALL be added to CLAUDE.md explaining new build scripts and TypeScript workflow. ^US1-4AC8

_Source: [Epic 1 Validation Criteria](../../typescript-vite-migration-prd.md#Epic%201%20TypeScript%20Infrastructure%20Setup)_

## Technical Context

### Build Script Strategy

The build scripts establish the TypeScript development workflow per [[#^NFR14|NFR14]] (development workflow updated):

**Core Scripts:**
- `build:ts` - Compiles TypeScript to JavaScript (for CLI execution)
- `type-check` - Validates types without compilation (fast feedback)
- `check:all` - Comprehensive validation (types + lint + tests)

**Script Organization:**
- Workspace-level scripts in root `package.json`
- Tool-specific scripts in `tools/citation-manager/package.json`
- Composition via npm script chaining

### Validation Strategy

Per [[#^NFR1|NFR1]] (MVP Principles - validate infrastructure before code), the `check:all` script runs:

1. TypeScript type checking (`tsc --noEmit`)
2. Biome linting and formatting (`biome check .`)
3. Full test suite (`npm test`)

This establishes the pre-commit validation workflow used throughout Epic 4 (systematic conversion).

### Infrastructure Validation Goals

Per Epic 1 deliverable: "Complete TypeScript configuration hierarchy with validation passing on zero source files."

**Validation Proves:**
- TypeScript compiler configured correctly
- Biome lints TypeScript files
- Build pipeline works end-to-end
- No breaking changes to existing functionality
- Infrastructure ready for source code conversion (Epic 3-4)

### Architectural Context (C4)

This story completes the TypeScript infrastructure foundation.

**Components Affected:**
- NPM scripts (build pipeline)
- TypeScript compiler integration
- Biome linter integration
- Vitest test runner integration

**Implementation Guides:**
- Reference implementation: `cc-workflows-site` project build scripts
- NPM Scripts documentation

### Files Impacted

- `package.json` (MODIFY) - Add workspace-level build scripts
- `tools/citation-manager/package.json` (MODIFY) - Add tool-specific build scripts
- `CLAUDE.md` (MODIFY) - Document TypeScript build workflow

### Dependencies

- **Prerequisite**: [[../us1.1-set-up-isolated-worktree/us1.1-set-up-isolated-worktree.md|US1.1: Set Up Isolated Worktree]] - Isolated environment for validation
- **Prerequisite**: [[../us1.2-create-typescript-configuration-hierarchy/us1.2-create-typescript-configuration-hierarchy.md|US1.2: Create TypeScript Configuration Hierarchy]] - TypeScript configs for compilation
- **Prerequisite**: [[../us1.3-update-biome-configuration/us1.3-update-biome-configuration.md|US1.3: Update Biome Configuration]] - Biome validates TypeScript files
- **Enables**: Epic 2 (Vite Infrastructure) - Build scripts integrate with Vite dev server
- **Enables**: Epic 3 (POC Validation) - Infrastructure proven ready for source conversion
- **Enables**: Epic 4 (Systematic Conversion) - Build pipeline used throughout conversion

### Design Principles Adherence

This story must adhere to the following [Design Principles](../../../../../ARCHITECTURE-PRINCIPLES.md):

**Critical Principles:**
- [[../../../../../ARCHITECTURE-PRINCIPLES.md#^mvp-principles-definition|MVP Principles]] (Foundation): Validates infrastructure works before source code conversion
- [[../../../../../ARCHITECTURE-PRINCIPLES.md#^foundation-reuse|Foundation Reuse]] (Foundation): Build scripts reused across all workspace tools
- [[../../../../../ARCHITECTURE-PRINCIPLES.md#^safety-first-principles-definition|Safety-First]] (Foundation): Comprehensive validation prevents breaking changes

**Implementation Guidance:**
- Compose scripts from smaller, single-purpose scripts
- Run comprehensive validation (`check:all`) before committing
- Document scripts in CLAUDE.md for developer reference
- Ensure scripts work in CI/CD environment (future integration)

### Testing

- **Test Framework**: npm scripts + existing tools (tsc, Biome, Vitest)
- **Test Strategy**: Integration validation - scripts orchestrate existing tools
- **Test Location**: No new tests required - validate infrastructure end-to-end

#### Required Validation Steps

##### 1. Build Script Validation
- **Purpose**: Verify TypeScript compilation script works
- **Acceptance Criteria**: Validates [[#^US1-4AC1|AC1]], [[#^US1-4AC4|AC4]]
- **Validation Steps**:
  - Run `npm run build:ts`
  - Verify `dist/` directories created with compiled JavaScript
  - Confirm zero compilation errors

##### 2. Type Check Script Validation
- **Purpose**: Verify type checking script validates TypeScript correctly
- **Acceptance Criteria**: Validates [[#^US1-4AC2|AC2]], [[#^US1-4AC5|AC5]]
- **Validation Steps**:
  - Run `npm run type-check`
  - Verify TypeScript type validation completes
  - Confirm zero type errors

##### 3. Comprehensive Check Script Validation
- **Purpose**: Verify full infrastructure validation script works end-to-end
- **Acceptance Criteria**: Validates [[#^US1-4AC3|AC3]], [[#^US1-4AC6|AC6]]
- **Validation Steps**:
  - Run `npm run check:all`
  - Verify all validation steps execute: types + lint + tests
  - Confirm zero errors across all checks

##### 4. JavaScript Regression Validation
- **Purpose**: Confirm existing JavaScript tests still pass during validation
- **Acceptance Criteria**: Validates [[#^US1-4AC7|AC7]]
- **Validation Steps**:
  - Run `npm run check:all`
  - Verify all existing JavaScript tests pass
  - Confirm zero test failures

##### 5. Documentation Validation
- **Purpose**: Verify CLAUDE.md documents TypeScript workflow
- **Acceptance Criteria**: Validates [[#^US1-4AC8|AC8]]
- **Validation Steps**:
  - Review CLAUDE.md TypeScript section
  - Verify build scripts documented with examples
  - Confirm workflow steps clear for developers

## Tasks / Subtasks

### Phase 1: Add Build Scripts

- [ ] **1.1. Add Workspace-Level Build Scripts** ^US1-4T1-1
  - **Objective**: Create npm scripts for TypeScript build, type checking, and validation
  - **Input**: Root `package.json`, TypeScript configs from US1.2
  - **Output**: Updated `package.json` with TypeScript build scripts
  - **Files**:
    - `package.json` (modify)
  - **Scope**:
    - Add `build:ts`: Compile all workspace TypeScript to JavaScript
    - Add `type-check`: Run `tsc --noEmit` for type validation
    - Add `check:all`: Run type-check + biome check + npm test
    - Add `clean`: Remove all `dist/` directories
    - Scripts should work from workspace root
  - **Example**:
    ```json
    {
      "scripts": {
        "build:ts": "tsc --build",
        "type-check": "tsc --noEmit",
        "check:all": "npm run type-check && npx biome check . && npm test",
        "clean": "rm -rf tools/*/dist"
      }
    }
    ```
  - **Validation**: Scripts execute without errors
  - _Requirements_: [[#^US1-4AC1|AC1]], [[#^US1-4AC2|AC2]], [[#^US1-4AC3|AC3]]
  - _Leverage_: NPM scripts composition, existing tools

- [ ] **1.2. Add Tool-Specific Build Scripts** ^US1-4T1-2
  - **Objective**: Create npm scripts for citation-manager TypeScript compilation
  - **Input**: `tools/citation-manager/package.json`, tool tsconfig
  - **Output**: Updated package.json with tool-level build scripts
  - **Files**:
    - `tools/citation-manager/package.json` (modify)
  - **Scope**:
    - Add `build`: Compile citation-manager TypeScript to JavaScript
    - Add `type-check`: Validate citation-manager types
    - Add `clean`: Remove citation-manager `dist/` directory
    - Scripts should work when run from tool directory
  - **Example**:
    ```json
    {
      "scripts": {
        "build": "tsc",
        "type-check": "tsc --noEmit",
        "clean": "rm -rf dist"
      }
    }
    ```
  - **Validation**: Scripts execute without errors
  - _Requirements_: [[#^US1-4AC1|AC1]], [[#^US1-4AC2|AC2]]
  - _Leverage_: Tool-specific TypeScript configuration

### Phase 2: Validate Build Infrastructure

- [ ] **2.1. Validate TypeScript Compilation Script** ^US1-4T2-1
  - **Objective**: Verify `build:ts` script compiles TypeScript successfully
  - **Input**: Build scripts from Task 1.1, TypeScript configs
  - **Output**: Compilation validation report
  - **Commands**:
    ```bash
    cd ../cc-workflows-typescript
    npm run clean
    npm run build:ts
    ls -la tools/citation-manager/dist/
    ```
  - **Validation**: `dist/` directories created, zero compilation errors
  - _Requirements_: [[#^US1-4AC4|AC4]]
  - _Leverage_: TypeScript compiler

- [ ] **2.2. Validate Type Checking Script** ^US1-4T2-2
  - **Objective**: Verify `type-check` script validates types correctly
  - **Input**: Build scripts from Task 1.1, TypeScript configs
  - **Output**: Type checking validation report
  - **Commands**:
    ```bash
    cd ../cc-workflows-typescript
    npm run type-check
    ```
  - **Validation**: Type checking completes, zero type errors
  - _Requirements_: [[#^US1-4AC5|AC5]]
  - _Leverage_: TypeScript compiler --noEmit mode

- [ ] **2.3. Validate Comprehensive Check Script** ^US1-4T2-3
  - **Objective**: Verify `check:all` script runs full validation successfully
  - **Input**: Build scripts from Task 1.1, all infrastructure from US1.1-1.3
  - **Output**: Comprehensive validation report
  - **Commands**:
    ```bash
    cd ../cc-workflows-typescript
    npm run check:all
    ```
  - **Validation**: All checks pass (types + lint + tests), zero errors
  - _Requirements_: [[#^US1-4AC6|AC6]], [[#^US1-4AC7|AC7]]
  - _Leverage_: Full infrastructure stack

### Phase 3: Documentation

- [ ] **3.1. Document TypeScript Workflow in CLAUDE.md** ^US1-4T3-1
  - **Objective**: Add TypeScript build and validation workflow documentation
  - **Input**: Build scripts from Phase 1, existing CLAUDE.md
  - **Output**: Updated CLAUDE.md with TypeScript section
  - **Files**:
    - `CLAUDE.md` (modify)
  - **Scope**:
    - Add "TypeScript" section after existing content
    - Document `build:ts`, `type-check`, `check:all` scripts
    - Provide usage examples
    - Explain when to run each script (dev workflow)
    - Document `clean` script for resetting build state
  - **Example**:
    ```markdown
    ## TypeScript

    \`\`\`bash
    # Type check without compiling
    npm run type-check

    # Build TypeScript to JavaScript
    npm run build:ts

    # Comprehensive validation (types + lint + tests)
    npm run check:all

    # Clean compiled output
    npm run clean
    \`\`\`

    **Workflow:**
    - Run `type-check` during development for fast feedback
    - Run `check:all` before committing changes
    - Run `build:ts` when testing CLI from compiled output
    ```
  - **Validation**: Documentation clear and accurate
  - _Requirements_: [[#^US1-4AC8|AC8]]
  - _Leverage_: Existing CLAUDE.md structure

### Phase 4: Final Infrastructure Validation

- [ ] **4.1. Execute End-to-End Infrastructure Validation** ^US1-4T4-1
  - **Objective**: Verify complete TypeScript infrastructure ready for source conversion
  - **Input**: All infrastructure from US1.1-1.4
  - **Output**: Final validation report proving Epic 1 deliverable met
  - **Commands**:
    ```bash
    cd ../cc-workflows-typescript

    # Clean state
    npm run clean

    # Full validation
    npm run check:all

    # Verify compilation works
    npm run build:ts
    ls -la tools/citation-manager/dist/

    # Verify tests still pass
    npm test
    ```
  - **Validation**: All commands succeed, infrastructure ready for Epic 2
  - _Requirements_: All ACs [[#^US1-4AC1|AC1]]-[[#^US1-4AC8|AC8]], Epic 1 deliverable
  - _Leverage_: Complete infrastructure stack

### Acceptance Criteria Coverage

**AC1 Coverage** ([[#^US1-4AC1|AC1]] - build:ts script):
- Task 1.1: Adds workspace `build:ts` script
- Task 1.2: Adds tool `build` script
- Task 2.1: Validates compilation works

**AC2 Coverage** ([[#^US1-4AC2|AC2]] - type-check script):
- Task 1.1: Adds workspace `type-check` script
- Task 1.2: Adds tool `type-check` script
- Task 2.2: Validates type checking works

**AC3 Coverage** ([[#^US1-4AC3|AC3]] - check:all script):
- Task 1.1: Adds `check:all` script
- Task 2.3: Validates comprehensive check works

**AC4 Coverage** ([[#^US1-4AC4|AC4]] - Compilation succeeds):
- Task 2.1: Runs `build:ts` successfully
- Verification: `dist/` directories created

**AC5 Coverage** ([[#^US1-4AC5|AC5]] - Type checking succeeds):
- Task 2.2: Runs `type-check` successfully
- Verification: Zero type errors

**AC6 Coverage** ([[#^US1-4AC6|AC6]] - check:all succeeds):
- Task 2.3: Runs `check:all` successfully
- Verification: All checks pass

**AC7 Coverage** ([[#^US1-4AC7|AC7]] - Tests pass):
- Task 2.3: Validates tests during `check:all`
- Task 4.1: Final validation confirms tests pass

**AC8 Coverage** ([[#^US1-4AC8|AC8]] - Documentation):
- Task 3.1: Documents TypeScript workflow in CLAUDE.md
- Verification: Clear usage examples

### Task Sequencing

#### Sequential Dependencies

**Tasks 1.1-1.2 → Phase 2**: Must add scripts before validating them
- Dependency Rationale: Cannot run scripts that don't exist

**Phase 2 → Phase 3**: Should validate infrastructure before documenting
- Dependency Rationale: Documentation should reflect working scripts

**Phases 1-3 → Task 4.1**: Final validation requires all infrastructure complete
- Dependency Rationale: End-to-end validation requires complete stack

#### Parallel Execution Groups

**Group 1 - Phase 1 Script Creation**:
- Tasks [[#^US1-4T1-1|1.1]] and [[#^US1-4T1-2|1.2]] can execute in parallel
- Independent package.json files
- Parallel execution saves 2-3 minutes

**Group 2 - Phase 2 Validation**:
- Tasks [[#^US1-4T2-1|2.1]], [[#^US1-4T2-2|2.2]], and [[#^US1-4T2-3|2.3]] can execute in parallel
- Independent validation steps
- Parallel execution saves 30-45 seconds

### Execution Sequence

**Wave 1 - Add Build Scripts** (Estimated: 5-7 min):
- Execute: Tasks [[#^US1-4T1-1|1.1]] and [[#^US1-4T1-2|1.2]] in parallel
- Deliverable: npm scripts for TypeScript build and validation
- **Block Condition**: Wave 2 blocked until scripts exist

**Wave 2 - Validate Infrastructure** (Estimated: 20-30 sec):
- Execute: Tasks [[#^US1-4T2-1|2.1]], [[#^US1-4T2-2|2.2]], [[#^US1-4T2-3|2.3]] in parallel
- Deliverable: Infrastructure validation reports
- Prerequisite: Wave 1 complete
- **Block Condition**: Wave 3 blocked until validation passes

**Wave 3 - Documentation** (Estimated: 3-5 min):
- Execute: Task [[#^US1-4T3-1|3.1]]
- Deliverable: CLAUDE.md with TypeScript workflow documentation
- Prerequisite: Wave 2 complete
- **Block Condition**: Wave 4 blocked until documentation complete

**Wave 4 - Final Validation** (Estimated: 30-45 sec):
- Execute: Task [[#^US1-4T4-1|4.1]]
- Deliverable: End-to-end validation confirming Epic 1 complete
- Prerequisite: Wave 3 complete

**Total Estimated Duration**: 10-15 minutes
**Critical Path**: Wave 1 → Wave 2 → Wave 3 → Wave 4
**Time Savings**: ~3-4 minutes via parallel execution (Wave 1 + Wave 2)

---

## Additional Implementation Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Build script failures in CI/CD | Medium | Test scripts in clean environment before committing |
| npm script composition breaks on Windows | Low | Use cross-platform commands (avoid shell-specific syntax) |
| Type checking performance degrades | Low | Use `--noEmit` for type checking, full build only when needed |

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-11-13 | 1.0 | Initial user story creation for Epic 1 | Application Tech Lead (Claude Sonnet 4.5) |

## Related Documentation

- [TypeScript + Vite Migration PRD](../../typescript-vite-migration-prd.md) - Parent feature PRD
- [Epic 1: TypeScript Infrastructure Setup](../../typescript-vite-migration-prd.md#Epic%201%20TypeScript%20Infrastructure%20Setup) - Epic definition
- [NPM Scripts Documentation](https://docs.npmjs.com/cli/v9/using-npm/scripts) - Official npm scripts reference
- [ARCHITECTURE-PRINCIPLES.md](../../../../../ARCHITECTURE-PRINCIPLES.md) - Design principles reference
