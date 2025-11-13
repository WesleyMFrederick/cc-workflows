---
title: "User Story 1.2: Create TypeScript Configuration Hierarchy"
feature-title: TypeScript + Vite Migration
epic-number: 1
epic-name: TypeScript Infrastructure Setup
epic-url: ../../typescript-vite-migration-prd.md#Epic%201%20TypeScript%20Infrastructure%20Setup
user-story-number: 1.2
status: Todo
---

# Story 1.2: Create TypeScript Configuration Hierarchy

## Story

**As a** developer,
**I want** a hierarchical TypeScript configuration with shared base settings and tool-specific overrides,
**so that** all workspace tools inherit consistent TypeScript standards while maintaining flexibility for tool-specific needs.

_Source: [Epic 1: TypeScript Infrastructure Setup](../../typescript-vite-migration-prd.md#Epic%201%20TypeScript%20Infrastructure%20Setup)_

## Acceptance Criteria

1. A root `tsconfig.json` SHALL be created for workspace-level TypeScript coordination. ^US1-2AC1
2. A `tsconfig.base.json` SHALL be created with shared TypeScript compiler options for all tools. ^US1-2AC2
3. The `tsconfig.base.json` SHALL enforce strict type checking with `strict: true` and related compiler options. ^US1-2AC3
4. A tool-specific `tools/citation-manager/tsconfig.json` SHALL be created extending `tsconfig.base.json`. ^US1-2AC4
5. The TypeScript compiler SHALL validate successfully with `tsc --noEmit` (no compilation errors). ^US1-2AC5
6. The configuration SHALL support ES modules with appropriate module resolution settings. ^US1-2AC6
7. All existing JavaScript tests SHALL pass unchanged, confirming zero functionality broken. ^US1-2AC7

_Source: [Epic 1 Validation Criteria](../../typescript-vite-migration-prd.md#Epic%201%20TypeScript%20Infrastructure%20Setup)_

## Technical Context

### Configuration Hierarchy Strategy

The TypeScript configuration follows a three-tier hierarchy aligned with [[#^NFR2|NFR2]] (Modular Design) and [[#^NFR3|NFR3]] (Foundation Reuse):

**Tier 1 - Workspace Root** (`tsconfig.json`):
- Coordinates TypeScript across all workspace packages
- References tool-specific configurations
- Minimal settings (delegated to base)

**Tier 2 - Shared Base** (`tsconfig.base.json`):
- Single source of truth for TypeScript standards
- Strict type checking enforced
- Reused by all tools

**Tier 3 - Tool-Specific** (`tools/citation-manager/tsconfig.json`):
- Extends shared base configuration
- Tool-specific include/exclude patterns
- Output directory overrides

### Compiler Options Strategy

Per [[#^NFR5|NFR5]] (strict type checking) and [[#^NFR11|NFR11]] (compile-time errors), the base configuration enforces:

- `strict: true` - Maximum type safety
- `noUncheckedIndexedAccess: true` - Prevent array/object access bugs
- `noImplicitOverride: true` - Explicit override declarations
- `exactOptionalPropertyTypes: true` - Precise optional property handling

### Module Strategy

Per [[#^FR1|FR1]] (TypeScript as primary language) and [[#^FR8|FR8]] (test suite runs against source), the configuration supports:

- `module: "ESNext"` - Modern ES modules
- `moduleResolution: "bundler"` - Vite-compatible resolution
- `target: "ES2022"` - Modern JavaScript features
- `allowImportingTsExtensions: true` - Import `.ts` files directly (Vite transpiles)

### Architectural Context (C4)

This story establishes the TypeScript foundation for the entire workspace.

**Components Affected:**
- TypeScript compiler infrastructure (new)
- All workspace tools (citation-manager pilot)
- Build pipeline integration points

**Implementation Guides:**
- Reference implementation: `cc-workflows-site` project TypeScript configuration
- TypeScript Handbook: [Project Configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

### Files Impacted

- `tsconfig.json` (CREATE) - Workspace root configuration
- `tsconfig.base.json` (CREATE) - Shared base configuration
- `tools/citation-manager/tsconfig.json` (CREATE) - Tool-specific configuration
- `package.json` (MODIFY) - Add TypeScript dependency

### Dependencies

- **Prerequisite**: [[../us1.1-set-up-isolated-worktree/us1.1-set-up-isolated-worktree.md|US1.1: Set Up Isolated Worktree]] - Provides isolated environment for config changes
- **Enables**: [[../us1.3-update-biome-configuration/us1.3-update-biome-configuration.md|US1.3: Update Biome Configuration]] - TypeScript configs needed for linter integration
- **Enables**: [[../us1.4-add-build-scripts/us1.4-add-build-scripts.md|US1.4: Add Build Scripts]] - Configs needed for build script execution

### Design Principles Adherence

This story must adhere to the following [Design Principles](../../../../../ARCHITECTURE-PRINCIPLES.md):

**Critical Principles:**
- [[../../../../../ARCHITECTURE-PRINCIPLES.md#^foundation-reuse|Foundation Reuse]] (Foundation): `tsconfig.base.json` is single source of truth
- [[../../../../../ARCHITECTURE-PRINCIPLES.md#^mvp-principles-definition|MVP Principles]] (Foundation): Validates config works with zero source files first
- [[../../../../../ARCHITECTURE-PRINCIPLES.md#^modular-design-principles-definition|Modular Design]] (Modular): Tool-specific configs extend shared base independently
- [[../../../../../ARCHITECTURE-PRINCIPLES.md#^safety-first-principles-definition|Safety-First]] (Foundation): Existing JavaScript untouched, tests confirm no breakage

**Implementation Guidance:**
- Start with minimal working configuration, then iterate
- Reference `cc-workflows-site` TypeScript configuration as template
- Validate with `tsc --noEmit` after each configuration change
- Ensure strict mode enabled from day one (easier than retrofitting)

### Testing

- **Test Framework**: Vitest (workspace standard)
- **Test Strategy**: Validation-based - TypeScript compiler validates configuration correctness
- **Test Location**: No new tests required - use existing test suite for regression validation

#### Required Validation Steps

##### 1. TypeScript Compiler Validation
- **Purpose**: Verify TypeScript configuration compiles successfully with zero source files
- **Acceptance Criteria**: Validates [[#^US1-2AC1|AC1]], [[#^US1-2AC2|AC2]], [[#^US1-2AC3|AC3]], [[#^US1-2AC4|AC4]], [[#^US1-2AC5|AC5]]
- **Validation Steps**:
  - Run `tsc --noEmit` from workspace root
  - Compiler should succeed with zero errors
  - Confirms configuration hierarchy valid

##### 2. Configuration Hierarchy Validation
- **Purpose**: Verify tool-specific config correctly extends base config
- **Acceptance Criteria**: Validates [[#^US1-2AC2|AC2]], [[#^US1-2AC4|AC4]]
- **Validation Steps**:
  - Run `tsc --showConfig` from `tools/citation-manager/`
  - Verify base settings merged with tool-specific overrides
  - Confirms inheritance working correctly

##### 3. Module Resolution Validation
- **Purpose**: Verify ES module settings configured correctly
- **Acceptance Criteria**: Validates [[#^US1-2AC6|AC6]]
- **Validation Steps**:
  - Check `tsc --showConfig` output for module settings
  - Verify `module: "ESNext"` and `moduleResolution: "bundler"`
  - Confirms Vite-compatible module strategy

##### 4. Regression Test Validation
- **Purpose**: Confirm JavaScript code still works (TypeScript config doesn't break existing functionality)
- **Acceptance Criteria**: Validates [[#^US1-2AC7|AC7]]
- **Validation Steps**:
  - Run `npm test` from workspace root
  - All existing JavaScript tests must pass
  - Confirms zero functionality broken

## Tasks / Subtasks

### Phase 1: Install TypeScript Dependency

- [ ] **1.1. Add TypeScript Dependency to Workspace** ^US1-2T1-1
  - **Objective**: Install TypeScript as workspace-level dev dependency
  - **Input**: Worktree from US1.1, root `package.json`
  - **Output**: TypeScript installed with `tsc` command available
  - **Commands**:
    ```bash
    cd ../cc-workflows-typescript
    npm install -D "typescript@>=5.3.0"
    ```
  - **Validation**: Run `npx tsc --version` - should show TypeScript 5.3.x
  - _Requirements_: [[#^US1-2AC5|AC5]] prerequisite
  - _Leverage_: NPM workspaces dependency management

### Phase 2: Create Configuration Files

- [ ] **2.1. Create Workspace Root tsconfig.json** ^US1-2T2-1
  - **Objective**: Create minimal workspace coordination configuration
  - **Input**: TypeScript installed from Task 1.1
  - **Output**: Root `tsconfig.json` with references to tool configs
  - **Files**:
    - `tsconfig.json` (create)
  - **Scope**:
    - Create root config with `files: []` (no direct source compilation)
    - Add `references: [{ "path": "./tools/citation-manager" }]`
    - Minimal settings (delegate to base and tool-specific configs)
  - **Validation**: Valid JSON, parseable by TypeScript compiler
  - _Requirements_: [[#^US1-2AC1|AC1]]
  - _Leverage_: TypeScript project references for workspace coordination

- [ ] **2.2. Create Shared tsconfig.base.json** ^US1-2T2-2
  - **Objective**: Create shared base configuration with strict type checking
  - **Input**: Reference implementation from `cc-workflows-site` project
  - **Output**: `tsconfig.base.json` with strict compiler options
  - **Files**:
    - `tsconfig.base.json` (create)
  - **Scope**:
    - Set `strict: true` and related strict options
    - Configure ES module support: `module: "ESNext"`, `moduleResolution: "bundler"`
    - Set `target: "ES2022"` for modern JavaScript
    - Enable `allowImportingTsExtensions: true` for `.ts` imports
    - Configure source maps, declaration files
    - Exclude `node_modules/`, `dist/`, test files from compilation
  - **Validation**: Valid JSON, parseable by TypeScript compiler
  - _Requirements_: [[#^US1-2AC2|AC2]], [[#^US1-2AC3|AC3]], [[#^US1-2AC6|AC6]]
  - _Leverage_: `cc-workflows-site` TypeScript configuration as template

- [ ] **2.3. Create Tool-Specific tsconfig.json for citation-manager** ^US1-2T2-3
  - **Objective**: Create citation-manager TypeScript config extending base
  - **Input**: `tsconfig.base.json` from Task 2.2
  - **Output**: `tools/citation-manager/tsconfig.json` with tool-specific overrides
  - **Files**:
    - `tools/citation-manager/tsconfig.json` (create)
  - **Scope**:
    - Extend `../../tsconfig.base.json`
    - Set `include: ["src/**/*", "test/**/*"]` for citation-manager files
    - Set `outDir: "./dist"` for compiled output
    - Set `rootDir: "."` for source root
    - Enable `composite: true` for project references
  - **Validation**: Valid JSON, parseable by TypeScript compiler
  - _Requirements_: [[#^US1-2AC4|AC4]]
  - _Leverage_: TypeScript extends mechanism, tool-specific patterns

### Phase 3: Validation

- [ ] **3.1. Validate TypeScript Compiler Configuration** ^US1-2T3-1
  - **Objective**: Verify TypeScript configuration hierarchy works correctly with zero source files
  - **Input**: All tsconfig files from Phase 2
  - **Output**: TypeScript compiler validation report
  - **Commands**:
    ```bash
    cd ../cc-workflows-typescript

    # Validate workspace root config
    npx tsc --noEmit

    # Validate tool-specific config
    cd tools/citation-manager
    npx tsc --noEmit

    # Show merged configuration for inspection
    npx tsc --showConfig
    ```
  - **Validation**: Zero compilation errors, configuration hierarchy valid
  - _Requirements_: [[#^US1-2AC5|AC5]]
  - _Leverage_: TypeScript compiler validation

- [ ] **3.2. Verify Module Resolution Settings** ^US1-2T3-2
  - **Objective**: Confirm ES module settings configured correctly for Vite compatibility
  - **Input**: Configuration from Phase 2
  - **Output**: Module resolution verification report
  - **Commands**:
    ```bash
    cd ../cc-workflows-typescript/tools/citation-manager
    npx tsc --showConfig | grep -A 5 "module"
    ```
  - **Validation**: Output shows `module: "ESNext"` and `moduleResolution: "bundler"`
  - _Requirements_: [[#^US1-2AC6|AC6]]
  - _Leverage_: TypeScript --showConfig introspection

- [ ] **3.3. Execute Regression Test Suite** ^US1-2T3-3
  - **Objective**: Confirm existing JavaScript tests still pass (TypeScript config doesn't break functionality)
  - **Input**: Configuration from Phase 2, existing test suite
  - **Output**: Test execution report
  - **Commands**:
    ```bash
    cd ../cc-workflows-typescript
    npm test
    ```
  - **Validation**: All existing tests pass with zero failures
  - _Requirements_: [[#^US1-2AC7|AC7]]
  - _Leverage_: Existing Vitest test suite

### Acceptance Criteria Coverage

**AC1 Coverage** ([[#^US1-2AC1|AC1]] - Root tsconfig.json):
- Task 2.1: Creates workspace root configuration
- Task 3.1: Validates root config parseable

**AC2 Coverage** ([[#^US1-2AC2|AC2]] - tsconfig.base.json):
- Task 2.2: Creates shared base configuration
- Task 3.1: Validates base config used by tools

**AC3 Coverage** ([[#^US1-2AC3|AC3]] - Strict type checking):
- Task 2.2: Sets `strict: true` in base config
- Task 3.1: Compiler enforces strict mode

**AC4 Coverage** ([[#^US1-2AC4|AC4]] - Tool-specific config):
- Task 2.3: Creates citation-manager config extending base
- Task 3.1: Validates tool config inherits base settings

**AC5 Coverage** ([[#^US1-2AC5|AC5]] - tsc validation):
- Task 3.1: Runs `tsc --noEmit` successfully
- Verification: Zero compilation errors

**AC6 Coverage** ([[#^US1-2AC6|AC6]] - ES module support):
- Task 2.2: Configures module settings in base
- Task 3.2: Verifies module resolution settings

**AC7 Coverage** ([[#^US1-2AC7|AC7]] - Zero functionality broken):
- Task 3.3: Runs full test suite
- Verification: All tests pass

### Task Sequencing

#### Sequential Dependencies

**Task 1.1 → Tasks 2.1-2.3**: Must install TypeScript before creating configs
- Dependency Rationale: Cannot validate configs without TypeScript compiler

**Task 2.2 → Task 2.3**: Must create base config before tool-specific config
- Dependency Rationale: Tool config extends base via `extends` property

**Tasks 2.1-2.3 → Phase 3**: Must create all configs before validation
- Dependency Rationale: Validation requires complete configuration hierarchy

#### Parallel Execution Groups

**Group 1 - Phase 2 Config Creation**:
- Tasks [[#^US1-2T2-1|2.1]] and [[#^US1-2T2-2|2.2]] can execute in parallel (no extends dependency yet)
- Independent configuration files
- Task [[#^US1-2T2-3|2.3]] must wait for Task 2.2 (extends base)

**Group 2 - Phase 3 Validation**:
- Tasks [[#^US1-2T3-1|3.1]], [[#^US1-2T3-2|3.2]], and [[#^US1-2T3-3|3.3]] can execute in parallel
- Independent validation steps
- Parallel execution saves 1-2 minutes

### Execution Sequence

**Wave 1 - TypeScript Installation** (Estimated: 10-15 sec):
- Execute: Task [[#^US1-2T1-1|1.1]]
- Deliverable: TypeScript dependency installed
- **Block Condition**: Wave 2 blocked until TypeScript available

**Wave 2 - Base Configuration** (Estimated: 5-10 min):
- Execute: Tasks [[#^US1-2T2-1|2.1]] and [[#^US1-2T2-2|2.2]] in parallel
- Deliverable: Root and base configurations created
- Prerequisite: Wave 1 complete
- **Block Condition**: Wave 3 blocked until base config exists

**Wave 3 - Tool Configuration** (Estimated: 3-5 min):
- Execute: Task [[#^US1-2T2-3|2.3]]
- Deliverable: citation-manager config extending base
- Prerequisite: Task 2.2 complete (base config)
- **Block Condition**: Wave 4 blocked until all configs exist

**Wave 4 - Validation** (Estimated: 20-30 sec):
- Execute: Tasks [[#^US1-2T3-1|3.1]], [[#^US1-2T3-2|3.2]], [[#^US1-2T3-3|3.3]] in parallel
- Deliverable: Full validation confirming configuration correct
- Prerequisite: Wave 3 complete

**Total Estimated Duration**: 10-15 minutes
**Critical Path**: Wave 1 → Wave 2 → Wave 3 → Wave 4
**Time Savings**: ~5 minutes via parallel execution (Wave 2 + Wave 4)

---

## Additional Implementation Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| TypeScript version incompatibility | High | Use `>=5.3.0` version constraint, test with latest 5.x |
| Module resolution conflicts with Vitest | Medium | Reference `cc-workflows-site` working configuration |
| Strict mode too restrictive | Low | Document any necessary `@ts-expect-error` usage patterns |
| Configuration hierarchy breaks | High | Validate with `tsc --showConfig` before proceeding |

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-11-13 | 1.0 | Initial user story creation for Epic 1 | Application Tech Lead (Claude Sonnet 4.5) |

## Related Documentation

- [TypeScript + Vite Migration PRD](../../typescript-vite-migration-prd.md) - Parent feature PRD
- [Epic 1: TypeScript Infrastructure Setup](../../typescript-vite-migration-prd.md#Epic%201%20TypeScript%20Infrastructure%20Setup) - Epic definition
- [TypeScript Handbook - tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) - Official TypeScript configuration documentation
- [ARCHITECTURE-PRINCIPLES.md](../../../../../ARCHITECTURE-PRINCIPLES.md) - Design principles reference
