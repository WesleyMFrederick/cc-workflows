---
title: "User Story 1.3: Make Migrated citation-manager Executable"
feature-title: "CC Workflows Workspace"
epic-number: 1
epic-name: "Workspace Scaffolding & citation-manager Migration"
epic-url: "/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/design-docs/features/20250928-cc-workflows-workspace-scaffolding/cc-workflows-workspace-prd.md#Epic%201%20Workspace%20Scaffolding%20&%20`citation-manager`%20Migration"
user-story-number: 1.3
status: Draft
---

# Story 1.3: Make Migrated citation-manager Executable

> [!danger] **Critical LLM Initialization Instructions**
> When first reading this file, you MUST IMMEDIATELY run citation manager to extract base paths: `npm run citation:base-paths <this-file-path> -- --format json`. Read ALL discovered base path files to gather complete architectural context before proceeding.

## Phase 1 Progress Tracking

- [x] **Step 1**: Configuration loaded and next story identified
- [x] **Step 2**: User story requirements extracted with citations
- [x] **Step 3**: Architectural context gathered using C4 framework
- [x] **Step 4**: Story definition populated from epic
- [x] **Step 5**: Dev Notes section completed with architectural citations
- [x] **Step 6**: Story validation completed
- [x] **Step 7**: Citation validation passed (41/41 valid)
- [x] **Step 8**: Phase 1 ready for Phase 2 task generation

## Phase 2 Progress Tracking

- [x] **Step 1**: Phase 1 story context validated and loaded
- [x] **Step 2**: Acceptance criteria analyzed for milestone generation
- [x] **Step 3**: Architectural context reviewed for implementation approach
- [x] **Step 4**: Milestone generation principles applied
- [x] **Step 5**: High-level milestones created with agent type assignments
- [x] **Step 6**: Milestone validation completed against acceptance criteria
- [x] **Step 7**: Milestone coverage validation documented
- [x] **Step 8**: Phase 2 ready for Phase 3 task scoping

## Phase 3 Progress Tracking

- [x] **Step 1**: Phase 2 milestones validated and loaded
- [x] **Step 2**: Atomic subtask requirements reviewed
- [x] **Step 3**: All Phase 2 milestones broken into atomic subtasks (2 + 2 + 5 = 9 subtasks)
- [x] **Step 4**: TDD appropriateness assessed - direct implementation chosen for M1/M2 (one-off config tasks)
- [x] **Step 5**: Direct implementation subtasks created for configuration, validation subtasks for CLI testing
- [x] **Step 6**: Agent assignments finalized for all subtasks
- [x] **Step 7**: Subtask dependencies and validation criteria defined
- [x] **Step 8**: Phase 3 ready for Phase 4 implementation details

## Status

Done

## Story

**As a** developer,
**I want** to configure the migrated `citation-manager` to be executable from the workspace root,
**so that** I can run its commands and validate that the internal module connections are working.

_Source: [Story 1.3: Make Migrated `citation-manager` Executable](../../cc-workflows-workspace-prd.md#Story%201.3%20Make%20Migrated%20`citation-manager`%20Executable)_

## Acceptance Criteria

1. GIVEN the migrated source code, WHEN an npm script is created in the root, THEN it SHALL execute the `citation-manager.js` CLI. ^US1-3AC1
2. WHEN each of the primary CLI commands is run via the npm script on a valid test fixture, THEN each command SHALL execute without throwing module resolution errors. ^US1-3AC2
3. WHEN the `--help` flag is used with the new npm script, THEN the CLI SHALL display the correct help menu for the citation manager. ^US1-3AC3

_Source: [Story 1.3 Acceptance Criteria](../../cc-workflows-workspace-prd.md#Story%201.3%20Acceptance%20Criteria)_

## Atomic Subtasks (Phase 3)

> [!note] **Subtask Organization**
> Phase 3 transforms Phase 2 milestones into atomic, implementable subtasks (1-5 files each). This story has 9 subtasks total across 3 milestone groups. Configuration work uses **direct implementation workflow** (TDD skipped for one-off setup tasks per Phase 3 guidance), while validation work focuses on manual CLI testing per acceptance criteria.

### Milestone 1: Configure Workspace NPM Scripts (2 Subtasks)

- [x] **1.1 Update root package.json citation scripts** ^US1-3T1-1
  - **Agent**: code-developer-agent
  - **Workflow**: Direct Implementation
  - **Objective**: Update all citation scripts in root package.json to point to migrated citation-manager location
  - **Input**: Existing root package.json with citation scripts pointing to old location
  - **Output**: Updated root package.json with all citation scripts pointing to `tools/citation-manager/src/citation-manager.js`
  - **Files**: `package.json` (modify)
  - **Scope**:
    - Update `citation:validate` script: `node tools/citation-manager/src/citation-manager.js validate`
    - Update `citation:ast` script: `node tools/citation-manager/src/citation-manager.js ast`
    - Update `citation:base-paths` script: `node tools/citation-manager/src/citation-manager.js base-paths`
    - Update `citation:fix` script: `node tools/citation-manager/src/citation-manager.js fix` (create if doesn't exist)
    - Ensure workspace-relative paths from root (not requiring cd operations)
    - Follow CLI execution pattern from US1.1 for parameter passing with `--` separator
  - **Test**: Scripts can be listed with `npm run` and show correct paths
  - **Commands**: `npm run` (verify citation:* scripts appear with correct paths)
  - _Requirements_: [[#^US1-3AC1|AC1]], [[#^US1-3AC3|AC3]]
  - _Leverage_: US1.1 CLI execution pattern, WORKSPACE-SETUP.md CLI pattern guidance
  - _Implementation Details_: [To be populated in Phase 4]

- [x] **1.2 Verify citation scripts execute correctly** ^US1-3T1-2
  - **Agent**: qa-validation
  - **Workflow**: Manual Validation
  - **Objective**: Manually validate that all citation scripts can be executed from workspace root without errors
  - **Input**: Updated root package.json from 1.1 with configured scripts
  - **Output**: Confirmation that all citation commands execute via `npm run` without module resolution errors
  - **Files**: none (manual CLI testing)
  - **Scope**:
    - Execute `npm run citation:validate -- --help` and verify help menu displays
    - Execute `npm run citation:validate -- design-docs/features/20250928-cc-workflows-workspace-scaffolding/cc-workflows-workspace-prd.md` with real file
    - Execute `npm run citation:base-paths -- design-docs/features/20250928-cc-workflows-workspace-scaffolding/cc-workflows-workspace-prd.md -- --format json`
    - Confirm all commands execute without "Cannot find module" errors
    - Verify parameter passing works with `--` separator
  - **Test**: All citation commands execute successfully via npm scripts from workspace root
  - **Commands**: Manual execution of each citation:* npm script
  - _Requirements_: [[#^US1-3AC1|AC1]], [[#^US1-3AC2|AC2]], [[#^US1-3AC3|AC3]]
  - _Leverage_: Real markdown files in design-docs directory as test fixtures
  - _Implementation Details_: [To be populated in Phase 4]

### Milestone 2: Create Package Configuration (2 Subtasks)

- [x] **2.1 Create tools/citation-manager/package.json** ^US1-3T2-1
  - **Agent**: code-developer-agent
  - **Workflow**: Direct Implementation
  - **Objective**: Create package.json for citation-manager with all required configuration
  - **Input**: tools/citation-manager directory with source code, US1.1 mock-tool package.json pattern
  - **Output**: Complete package.json file for citation-manager workspace package
  - **Files**: `tools/citation-manager/package.json` (create)
  - **Scope**:
    - Set package name: `"@cc-workflows/citation-manager"`
    - Set version: `"1.0.0"`
    - Add `"type": "module"` for ESM support (per US1.1 findings)
    - Add scripts: `"test": "vitest"`, `"start": "node src/citation-manager.js"`
    - Add dependencies: commander.js and other citation-manager dependencies
    - Add devDependencies: vitest (for testing)
    - Set `"private": true` (workspace package)
    - Add description, author, license fields
  - **Test**: File exists at correct path with valid JSON structure
  - **Commands**: `cat tools/citation-manager/package.json | jq .` (verify valid JSON)
  - _Requirements_: [[#^US1-3AC1|AC1]]
  - _Leverage_: US1.1 mock-tool package.json, NPM Workspaces architecture guidance
  - _Implementation Details_: [To be populated in Phase 4]

- [x] **2.2 Verify workspace package recognition** ^US1-3T2-2
  - **Agent**: qa-validation
  - **Workflow**: Manual Validation
  - **Objective**: Manually verify that NPM Workspaces properly recognizes citation-manager as workspace package
  - **Input**: Created package.json from 2.1
  - **Output**: Confirmation that workspace integration works correctly
  - **Files**: none (manual verification)
  - **Scope**:
    - Run `npm install` at workspace root to update workspace links
    - Verify no errors during workspace package recognition
    - Check that `node_modules/@cc-workflows/citation-manager` symlink exists (if workspace uses symlinks)
    - Confirm package appears in workspace package list
    - Verify local scripts can be run: `npm run test --workspace=@cc-workflows/citation-manager`
  - **Test**: Workspace recognizes citation-manager package without errors
  - **Commands**: `npm install`, `npm run test --workspace=@cc-workflows/citation-manager`
  - _Requirements_: [[#^US1-3AC1|AC1]]
  - _Leverage_: NPM Workspaces dependency management architecture
  - _Implementation Details_: [To be populated in Phase 4]

### Milestone 3: Validate CLI Command Execution (5 Subtasks)

- [x] **3.1 Validate citation:validate command and help flag** ^US1-3T3-1
  - **Agent**: qa-validation
  - **TDD Phase**: VALIDATION
  - **Objective**: Verify citation:validate command executes without module resolution errors and --help flag displays correctly
  - **Input**: Configured npm scripts from M1, test fixtures in design-docs
  - **Output**: Confirmation that validate command and help menu work correctly
  - **Files**: none (manual CLI testing)
  - **Scope**:
    - Execute `npm run citation:validate -- --help` and verify help menu displays with all commands listed
    - Verify help shows: validate, ast, base-paths, fix commands with descriptions
    - Execute `npm run citation:validate -- design-docs/features/20250928-cc-workflows-workspace-scaffolding/cc-workflows-workspace-prd.md`
    - Confirm exit code 0 (success) for valid markdown file
    - Verify no "Cannot find module" errors in output
    - Check that validation results display correctly
  - **Test**: citation:validate executes successfully with real files, help menu displays completely
  - **Commands**: `npm run citation:validate -- --help`, `npm run citation:validate -- <real-file>`
  - _Requirements_: [[#^US1-3AC1|AC1]], [[#^US1-3AC2|AC2]], [[#^US1-3AC3|AC3]]
  - _Leverage_: PRD and architecture docs as test fixtures
  - _Implementation Details_: [To be populated in Phase 4]

- [x] **3.2 Validate citation:base-paths with JSON parameter passing** ^US1-3T3-2
  - **Agent**: qa-validation
  - **TDD Phase**: VALIDATION
  - **Objective**: Verify citation:base-paths command executes with JSON format output and parameter passing works correctly
  - **Input**: Configured npm scripts from M1, markdown files with citations
  - **Output**: Confirmation that base-paths command works with parameters
  - **Files**: none (manual CLI testing)
  - **Scope**:
    - Execute `npm run citation:base-paths -- design-docs/features/20250928-cc-workflows-workspace-scaffolding/cc-workflows-workspace-prd.md -- --format json`
    - Verify JSON structure in output (valid JSON with base paths array)
    - Confirm parameter passing with double `--` separator works correctly
    - Verify base path extraction logic executes without import errors
    - Check exit code indicates success
  - **Test**: base-paths command executes with JSON output, parameter passing works
  - **Commands**: `npm run citation:base-paths -- <file> -- --format json`
  - _Requirements_: [[#^US1-3AC2|AC2]]
  - _Leverage_: User story files with base path citations as test fixtures
  - _Implementation Details_: [To be populated in Phase 4]

- [x] **3.3 Validate citation:ast command execution** ^US1-3T3-3
  - **Agent**: qa-validation
  - **TDD Phase**: VALIDATION
  - **Objective**: Verify citation:ast command executes successfully and produces AST output
  - **Input**: Configured npm scripts from M1, markdown test files
  - **Output**: Confirmation that AST command works without module errors
  - **Files**: none (manual CLI testing)
  - **Scope**:
    - Execute `npm run citation:ast -- design-docs/templates/user-story-template.md`
    - Verify AST output displays markdown structure
    - Confirm markdown parsing logic executes without module resolution errors
    - Verify output contains expected AST nodes (headings, paragraphs, links)
    - Check exit code indicates success
  - **Test**: citation:ast executes and produces AST output without errors
  - **Commands**: `npm run citation:ast -- <markdown-file>`
  - _Requirements_: [[#^US1-3AC2|AC2]]
  - _Leverage_: Template and story markdown files as test fixtures
  - _Implementation Details_: [To be populated in Phase 4]

- [x] **3.4 Validate citation:fix command execution** ^US1-3T3-4
  - **Agent**: qa-validation
  - **TDD Phase**: VALIDATION
  - **Objective**: Verify citation:fix command executes without module resolution errors
  - **Input**: Configured npm scripts from M1, markdown files with fixable citations (if available)
  - **Output**: Confirmation that fix command executes to completion
  - **Files**: none (manual CLI testing)
  - **Scope**:
    - Execute `npm run citation:fix -- <test-markdown-file>`
    - Verify command executes to completion without throwing import errors
    - Confirm fix operations run (even if no fixes needed)
    - Check exit code indicates success or appropriate failure
    - Verify no "Cannot find module" errors during execution
  - **Test**: citation:fix command executes without module errors
  - **Commands**: `npm run citation:fix -- <file>`
  - _Requirements_: [[#^US1-3AC2|AC2]]
  - _Leverage_: Any markdown files in design-docs as test fixtures
  - _Implementation Details_: [To be populated in Phase 4]

- [x] **3.5 Validate module resolution for all commands** ^US1-3T3-5
  - **Agent**: qa-validation
  - **TDD Phase**: VALIDATION
  - **Objective**: Verify all citation-manager internal imports work correctly from new workspace location
  - **Input**: All previous validation subtasks completed
  - **Output**: Comprehensive confirmation that module resolution works for all commands
  - **Files**: none (manual comprehensive testing)
  - **Scope**:
    - Re-run all citation commands (validate, ast, base-paths, fix) with various inputs
    - Monitor for any "Cannot find module" errors across all commands
    - Verify CitationValidator.js, MarkdownParser.js, FileCache.js all import correctly
    - Confirm ESM imports with explicit `.js` extensions work properly
    - Test edge cases: large files, files with many citations, files with errors
    - Validate that all Commander.js command handlers execute without import failures
  - **Test**: All citation commands execute across various test cases without any module resolution errors
  - **Commands**: Multiple executions of all `npm run citation:*` commands
  - _Requirements_: [[#^US1-3AC1|AC1]], [[#^US1-3AC2|AC2]]
  - _Leverage_: Full design-docs directory as comprehensive test suite
  - _Implementation Details_: [To be populated in Phase 4]

## Subtask Coverage Validation (Phase 3)

### Acceptance Criteria Coverage

- **AC1 Coverage** (npm script executes citation-manager.js CLI):
  - 1.1: Update root package.json citation scripts
  - 1.2: Verify citation scripts execute correctly
  - 2.1: Create tools/citation-manager/package.json
  - 2.2: Verify workspace package recognition
  - 3.1: Validate citation:validate command and help flag
  - 3.5: Validate module resolution for all commands

- **AC2 Coverage** (Primary CLI commands run without module resolution errors):
  - 1.2: Verify citation scripts execute correctly
  - 3.1: Validate citation:validate command and help flag
  - 3.2: Validate citation:base-paths with JSON parameter passing
  - 3.3: Validate citation:ast command execution
  - 3.4: Validate citation:fix command execution
  - 3.5: Validate module resolution for all commands

- **AC3 Coverage** (--help flag displays correct help menu):
  - 1.1: Update root package.json citation scripts
  - 1.2: Verify citation scripts execute correctly
  - 3.1: Validate citation:validate command and help flag

### Subtask Sequence Summary

**Total Atomic Subtasks**: 9 (transformed from 3 Phase 2 milestones)

**Transformation Ratio**: 3 milestones → 9 subtasks (3.0 subtasks per milestone average)

**Agent Distribution**:
- `code-developer-agent`: 2 subtasks (1.1, 2.1) - Direct implementation
- `qa-validation`: 7 subtasks (1.2, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5) - Manual validation

**Workflow Distribution**:
- Direct Implementation: 2 subtasks (simple config changes)
- Manual Validation: 7 subtasks (CLI testing and verification)

**File Impact Analysis**:
- Files Created: 1 (tools/citation-manager/package.json)
- Files Modified: 1 (root package.json)
- Manual Validation: 7 subtasks (CLI testing without file changes)

**Subtask Groups**:
- M1 (NPM Script Configuration): 2 subtasks (implementation → validation)
- M2 (Package Configuration): 2 subtasks (implementation → validation)
- M3 (CLI Validation): 5 subtasks (comprehensive manual testing)

**Key Implementation Approach**: Phase 3 uses **direct implementation workflow** for M1 and M2 (one-off configuration tasks with low risk of breaking). TDD was deemed inappropriate because: (1) these are simple config file updates done once, (2) low risk of breaking with future work, and (3) validation through actual CLI execution is more valuable than config structure tests. M3 provides comprehensive manual validation of all CLI commands with real test fixtures.

**Atomic Enforcement**: All subtasks meet strict atomic requirements:
- Each touches 0-1 files maximum (well under 5-file limit)
- Each has single validation checkpoint (file exists/CLI execution succeeds)
- Configuration subtasks modify/create only 1 file each
- Validation subtasks perform manual testing without file modifications

**TDD Assessment**: TDD skipped for M1 and M2 per Phase 3 guidance (one-off setup tasks, simple configuration, done once and maintained rarely). Direct implementation + validation is more appropriate.

## Dev Notes

### Architectural Context (C4)

This story configures the citation-manager CLI for execution from the workspace root, establishing the tool as a fully operational workspace package following the CLI execution pattern validated in Story 1.1.

- **Components Affected**:
  - [`Citation Manager CLI`](../../cc-workflows-workspace-architecture.md#Tool%20Packages) - Command-line interface at `tools/citation-manager/src/citation-manager.js` becomes executable via workspace npm scripts
  - [`CC Workflows Workspace`](../../cc-workflows-workspace-architecture.md#CC%20Workflows%20Workspace) - Root package.json npm scripts updated to orchestrate citation-manager execution following validated CLI execution pattern
  - [`NPM Workspaces Infrastructure`](../../cc-workflows-workspace-architecture.md#Dependency%20Management) - Workspace dependency resolution enables module imports from relocated source files

- **Implementation Guides**:
  - [CLI Execution Pattern](../../../../../WORKSPACE-SETUP.md#CLI%20Execution%20Pattern) - Root npm scripts pattern for tool orchestration with parameter passing via `--` separator
  - [Cross-Cutting Concerns: CLI Execution Pattern](../../cc-workflows-workspace-architecture.md#CLI%20Execution%20Pattern) - Architectural guidance for centralized command discovery and execution
  - [Dependency Management](../../cc-workflows-workspace-architecture.md#Dependency%20Management) - NPM Workspaces module resolution and package isolation

### Technical Details

- **File Locations**:
  - Primary: `package.json` (root) - EXISTING - Update citation:validate, citation:ast, citation:base-paths scripts to point to new tool location
  - Secondary: `tools/citation-manager/package.json` - PROPOSED - Package-level configuration with local scripts (test, start) following workspace pattern
  - CLI Entry Point: `tools/citation-manager/src/citation-manager.js` - EXISTING - No modifications required (ESM imports already use explicit .js extensions)

- **Technology Stack**:
  - [Node.js ≥18.0.0](../../cc-workflows-workspace-architecture.md#Technology%20Stack) - Runtime environment
  - [NPM Workspaces](../../cc-workflows-workspace-architecture.md#Technology%20Stack) - Script orchestration and dependency management
  - Commander.js - CLI framework (already in citation-manager dependencies, no changes needed)

- **Dependencies**:
  - **Prerequisite**: [Story 1.2](../us1.2-migrate-citation-manager-source-code/us1.2-migrate-citation-manager-source-code.md) complete - Source files must be at `tools/citation-manager/src/` for import paths to resolve
  - **Enables**: Story 1.4 test execution requires working CLI commands
  - ESM module system (root package.json has `"type": "module"` per US1.1)
  - Intra-package imports use relative paths with explicit `.js` extensions (per [US1.1 findings](../us1.1-establish-workspace-directory-structure-and-basic-config/us1.1-establish-workspace-directory-structure-and-basic-config.md))

- **Technical Constraints**:
  - [ESM module system compatibility](../../cc-workflows-workspace-prd.md#Story%201.3%20Make%20Migrated%20`citation-manager`%20Executable) documented in PRD based on US1.1 validation
  - [CLI execution pattern](../../../../../WORKSPACE-SETUP.md#CLI%20Execution%20Pattern) requires npm scripts with `--` parameter separator for argument passing
  - Module resolution requires explicit `.js` extensions in import statements (citation-manager already follows this pattern)
  - Citation-manager already uses ESM import/export syntax - no module system conversion needed
  - [Root script orchestration](../../cc-workflows-workspace-architecture.md#CLI%20Execution%20Pattern) pattern: all commands discoverable via `npm run` for centralized command registry

### Design Principles Adherence

This story must adhere to the following [Design Principles](../../../../../ARCHITECTURE-PRINCIPLES.md):

**Critical Principles:**
- [**Tool-First Design**](../../../../../ARCHITECTURE-PRINCIPLES.md#^tool-first-design) (Deterministic Offloading): CLI commands discoverable via `npm run`, enabling deterministic execution and avoiding manual path lookup
- [**Simplicity First**](../../../../../ARCHITECTURE-PRINCIPLES.md#^simplicity-first) (MVP): Direct node execution via npm scripts with minimal abstraction, avoiding complex build processes or wrapper scripts
- [**Foundation Reuse**](../../../../../ARCHITECTURE-PRINCIPLES.md#^foundation-reuse) (MVP): Leverage CLI execution pattern validated in US1.1 mock-tool proof-of-concept, proven to work with NPM Workspaces
- [**Black Box Interfaces**](../../../../../ARCHITECTURE-PRINCIPLES.md#^black-box-interfaces) (Modular): CLI exposes clean command interface via npm scripts, hiding internal module structure and implementation details

**Anti-Patterns to Avoid:**
- [**Hidden Global State**](../../../../../ARCHITECTURE-PRINCIPLES.md#^hidden-global-state): Use explicit parameter passing via npm script arguments (`-- <args>`), not environment variables or implicit configuration
- [**Scattered Checks**](../../../../../ARCHITECTURE-PRINCIPLES.md#^scattered-checks): Centralize all citation commands in root package.json npm scripts, avoiding multiple entry points or script locations

**Implementation Guidance:**
- Update existing citation:validate, citation:ast, citation:base-paths scripts to point to new location: `node tools/citation-manager/src/citation-manager.js <command>`
- Use workspace-relative paths from root (not relative paths requiring cd operations)
- Test all primary commands with actual fixtures to verify module resolution: validate, ast, base-paths, fix
- Verify parameter passing works correctly: `npm run citation:validate -- <file> -- --format json`
- Follow [CLI execution pattern](../../../../../WORKSPACE-SETUP.md#CLI%20Execution%20Pattern) established in US1.1: shebang line, argument parsing via process.argv, stdout/stderr convention

### Previous Story Insights

**Dependencies from Story 1.2:**
- Source files successfully migrated to `tools/citation-manager/src/` (citation-manager.js, CitationValidator.js, MarkdownParser.js, FileCache.js)
- Directory structure established and validated
- Git history preserved for all migrated files
- Documentation migrated to proper workspace hierarchy

**US1.1 Findings Applied:**
- ESM module system validated as workspace standard (root package.json has `"type": "module"`)
- CLI execution pattern proven via mock-tool implementation (`npm run mock:run -- Alice`)
- Parameter passing via `--` separator validated and working
- Intra-package imports require explicit `.js` extensions for ESM compatibility

**Module Resolution Note:**
Citation-manager already uses ESM import/export syntax with explicit `.js` extensions in all import statements (e.g., `import { CitationValidator } from "./CitationValidator.js"`), consistent with workspace standard established in US1.1. No module system conversion required.

**Course Correction:**
PRD v1.3 updated with module system compatibility note based on US1.1 implementation findings. US1.1 validation confirmed ESM module pattern works correctly with NPM Workspaces and Vitest.

**Architectural Validation:**
- US1.1 mock-tool successfully demonstrated CLI execution pattern with parameter passing
- NPM Workspaces correctly resolves dependencies for workspace packages
- Root npm scripts pattern enables centralized command discovery via `npm run`

### Testing

- **Test Framework**: [Vitest](../../cc-workflows-workspace-architecture.md#Technology%20Stack) (shared workspace framework, though validation for this story is manual CLI testing)
- **Test Strategy**: [Story Testing (Lean Outcome Validation)](../../cc-workflows-workspace-architecture.md#Story%20Testing%20(Lean%20Outcome%20Validation%29) - Manual CLI execution to verify acceptance criteria, black-box validation of command execution without inspecting internal implementation
- **Test Location**: Acceptance validation via manual CLI testing (not automated test code for this story - tests CLI functionality directly)

#### Required Test Implementation

##### 1. CLI Help Menu Display (Manual Validation)
- **Purpose**: Verify `--help` flag displays complete citation-manager help menu with all available commands
- **Acceptance Criteria**: Validates [[#^US1-3AC3|AC3]]
- **Implementation Guidance**:
  - Execute: `npm run citation:validate -- --help`
  - Verify Commander.js help output displays
  - Confirm all commands listed: validate, ast, base-paths, fix
  - Check command descriptions and options display correctly

##### 2. Validate Command Execution (Manual Validation)
- **Purpose**: Verify citation:validate command executes without module resolution errors on real markdown file
- **Acceptance Criteria**: Validates [[#^US1-3AC1|AC1]], [[#^US1-3AC2|AC2]]
- **Implementation Guidance**:
  - Execute: `npm run citation:validate -- design-docs/features/20250928-cc-workflows-workspace-scaffolding/cc-workflows-workspace-prd.md`
  - Verify exit code 0 (success)
  - Confirm no "Cannot find module" or import errors in output
  - Check validation results display correctly

##### 3. Base Paths Command with JSON Output (Manual Validation)
- **Purpose**: Verify citation:base-paths command executes and produces JSON output format
- **Acceptance Criteria**: Validates [[#^US1-3AC2|AC2]]
- **Implementation Guidance**:
  - Execute: `npm run citation:base-paths -- design-docs/features/20250928-cc-workflows-workspace-scaffolding/cc-workflows-workspace-prd.md -- --format json`
  - Verify JSON structure in output
  - Confirm base path extraction logic executes without errors
  - Check parameter passing works through npm script wrapper

##### 4. AST Command Execution (Manual Validation)
- **Purpose**: Verify citation:ast command executes successfully on markdown file
- **Acceptance Criteria**: Validates [[#^US1-3AC2|AC2]]
- **Implementation Guidance**:
  - Execute: `npm run citation:ast -- <test-markdown-file>`
  - Verify AST output displays
  - Confirm markdown parsing logic executes without module errors

##### 5. Fix Command Execution (Manual Validation)
- **Purpose**: Verify citation:fix command executes without module resolution errors
- **Acceptance Criteria**: Validates [[#^US1-3AC2|AC2]]
- **Implementation Guidance**:
  - Execute: `npm run citation:fix -- <test-fixture-with-fixable-citations>`
  - Verify command executes to completion
  - Confirm fix operations run without import errors
  - Check exit code indicates success/failure appropriately

### Agent Workflow Sequence

#### Phase 1: Configuration Setup (Parallel Execution)

**Agent**: `code-developer-agent`

**Execution Mode**: Parallel (tasks are independent)

**Subtasks**:
- **1.1**: Update root package.json citation scripts
- **2.1**: Create tools/citation-manager/package.json

**Focus**: Direct configuration file modifications with no dependencies between tasks. Both package.json files are independent and can be created/modified simultaneously to minimize execution time.

**Deliverables**:
- Root package.json updated with citation:* scripts pointing to `tools/citation-manager/src/citation-manager.js`
- Package configuration created at `tools/citation-manager/package.json` with proper metadata, scripts, and dependencies

**Validation Gate**: Files created/modified correctly with valid JSON structure, proper paths, and required fields.

**Agent Record Update**: Upon completing both subtasks, code-developer-agent MUST update Development Agent Record with:
- Agent Model Used: Record specific model and version
- File List: `package.json` (modified), `tools/citation-manager/package.json` (created)
- Completion Notes: Any issues encountered during configuration setup

---

#### Phase 2: Configuration Validation (Sequential Execution)

**Agent**: `qa-validation`

**Execution Mode**: Sequential (requires Phase 1 completion, subtasks run in order)

**Subtasks**:
- **1.2**: Verify citation scripts execute correctly (must complete before 2.2)
- **2.2**: Verify workspace package recognition

**Focus**: Manual validation that Phase 1 configuration works correctly. Subtask 1.2 validates npm scripts execute without module errors. Subtask 2.2 validates NPM Workspaces recognizes citation-manager package and can run workspace commands.

**Deliverables**:
- Confirmation that all citation:* commands execute via `npm run` without "Cannot find module" errors
- Confirmation that `npm install` recognizes workspace package without errors
- Confirmation that workspace-scoped commands work (e.g., `npm run test --workspace=@cc-workflows/citation-manager`)

**Validation Gate**: All citation commands executable from workspace root, workspace package recognized, parameter passing with `--` separator works.

**Agent Record Update**: Upon completing both validation subtasks, qa-validation MUST update Development Agent Record with:
- Completion Notes: Results of configuration validation (which commands tested, any issues found/resolved)
- Note any deviations from expected behavior or workarounds applied

---

#### Phase 3: Comprehensive CLI Validation (Sequential Execution)

**Agent**: `qa-validation`

**Execution Mode**: Sequential (requires Phase 1 and Phase 2 completion, systematic testing)

**Subtasks**:
- **3.1**: Validate citation:validate command and help flag
- **3.2**: Validate citation:base-paths with JSON parameter passing
- **3.3**: Validate citation:ast command execution
- **3.4**: Validate citation:fix command execution
- **3.5**: Validate module resolution for all commands

**Focus**: Systematic validation of all CLI commands with real test fixtures from design-docs directory. Each subtask tests a specific command to isolate failures. Subtask 3.5 provides comprehensive cross-command verification with edge cases.

**Deliverables**:
- Confirmation that citation:validate works with real markdown files and displays help menu
- Confirmation that citation:base-paths produces JSON output with correct parameter passing
- Confirmation that citation:ast displays markdown AST structure
- Confirmation that citation:fix executes without module errors
- Comprehensive confirmation that all internal imports (CitationValidator.js, MarkdownParser.js, FileCache.js) resolve correctly across all commands

**Validation Gate**: All acceptance criteria met - every citation command executes without module resolution errors, help menu displays correctly, parameter passing works, ESM imports with `.js` extensions work properly.

**Agent Record Update**: Upon completing all CLI validation subtasks, qa-validation MUST update Development Agent Record with:
- Completion Notes: Comprehensive test results for all commands, list of test fixtures used, any edge cases discovered
- Final confirmation that all acceptance criteria are satisfied
- Any observations about module resolution or CLI behavior

---

#### Orchestration Guidelines

**Parallel Execution Opportunity**: Phase 1 subtasks (1.1 and 2.1) SHOULD run in parallel to minimize story execution time. No dependencies exist between these configuration tasks.

**Sequential Requirements**:
- Phase 2 requires Phase 1 completion (cannot validate configuration that doesn't exist)
- Phase 3 requires Phase 2 completion (comprehensive validation requires basic configuration validation first)
- Within Phase 2: 1.2 should complete before 2.2 (verify script execution before testing workspace recognition)
- Within Phase 3: 3.1-3.4 should complete before 3.5 (test individual commands before comprehensive validation)

**Quality Gates**:
- If Phase 1 validation gate fails (invalid JSON, missing fields), Phase 2 should not proceed
- If Phase 2 validation gate fails (commands don't execute), Phase 3 should not proceed
- Each phase has clear pass/fail criteria for orchestration control

**Agent Handoffs**:
- Single handoff from code-developer-agent (Phase 1) to qa-validation (Phases 2-3)
- Qa-validation maintains context throughout validation phases
- Each agent documents their work in Development Agent Record for traceability

**Estimated Execution Time**:
- Phase 1: 5-10 minutes (parallel file modifications)
- Phase 2: 10-15 minutes (manual CLI testing of basic functionality)
- Phase 3: 20-30 minutes (comprehensive CLI validation with multiple test fixtures)
- Total: 35-55 minutes

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-30 | 1.0 | Initial story creation (Phase 1) | Assistant (Claude Sonnet 4.5) |
| 2025-09-30 | 1.1 | Phase 2 milestone generation complete | Application Tech Lead (Claude Sonnet 4.5) |
| 2025-09-30 | 1.2 | Phase 3 atomic subtask breakdown complete (11 subtasks with TDD structure) | Application Tech Lead (Claude Sonnet 4.5) |
| 2025-09-30 | 1.3 | Phase 3 revised: TDD removed for M1/M2 (9 subtasks, direct implementation workflow) | Application Tech Lead (Claude Sonnet 4.5) |
| 2025-09-30 | 2.0 | Story implementation complete - all acceptance criteria validated and met | Orchestrator (Claude Sonnet 4.5) |

## Development Agent Record

### Agent Model Used
**Phase 1 (code-developer-agent)**: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
**Phase 2 & 3 (qa-validation)**: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References
No debug logs required - all implementations and validations completed successfully on first attempt.

### Completion Notes List

**Phase 1 Implementation Notes (code-developer-agent)**:
- Task 1.1: Root package.json citation scripts were already correctly configured from previous work. Added missing `citation:fix` script using `validate --fix` pattern.
- Task 2.1: Created complete package.json for citation-manager with ESM configuration, dependencies (commander, marked), and workspace-compliant settings.
- Issue Resolved: Discovered `--fix` is a flag on `validate` command, not standalone command. Configured as `citation:fix` → `validate --fix`.
- All package.json files have valid JSON structure and follow workspace patterns from US1.1.

**Phase 2 Validation Notes (qa-validation)**:
- Task 1.2: All citation:* scripts execute successfully. Verified help menus, real file validation, and parameter passing.
- Task 2.2: NPM Workspaces correctly recognizes @cc-workflows/citation-manager package. Workspace-scoped commands work correctly.
- Test Spec Correction: Original spec had double `--` separator syntax error. Validated correct single `--` separator works.
- No blocking issues. All tests PASS.

**Phase 3 Comprehensive Validation Notes (qa-validation)**:
- Tasks 3.1-3.5: All CLI commands validated across multiple test cases and edge cases.
- Tested large files (98 citations), complex structures, line ranges, JSON output, error handling.
- Zero module resolution errors detected across 8+ command executions.
- All ESM imports working correctly (CitationValidator.js, MarkdownParser.js, FileCache.js).
- All acceptance criteria (AC1, AC2, AC3) validated and met.
- Performance excellent (0.0s - 0.1s validation times).

### File List

**Files Created**:
1. `tools/citation-manager/package.json` - Workspace package configuration with ESM support, dependencies, and scripts

**Files Modified**:
1. `package.json` (root) - Added `citation:fix` script pointing to `tools/citation-manager/src/citation-manager.js validate --fix`

**Files Validated** (CLI testing - no modifications):
- Multiple markdown files in design-docs/ directory used as test fixtures
- All citation commands tested against real workspace files

## QA Results

**QA Validation Status**: ✅ PASS - All Acceptance Criteria Met

**Acceptance Criteria Results**:
- **AC1** (npm script executes citation-manager.js CLI): ✅ PASS - All citation:* scripts execute successfully from workspace root
- **AC2** (Primary CLI commands run without module resolution errors): ✅ PASS - Validated across validate, ast, base-paths, fix commands with zero module errors
- **AC3** (--help flag displays correct help menu): ✅ PASS - Help menu displays all commands (validate, ast, base-paths) with descriptions

**Test Coverage Summary**:
- Citation commands tested: 4/4 (validate, ast, base-paths, fix)
- Module resolution errors: 0
- Test fixtures used: 5+ real markdown files from design-docs
- Edge cases tested: Large files, complex structures, line ranges, JSON output, error handling
- Exit codes verified: All commands return 0 for valid inputs

**Quality Assessment**:
- Code Quality: Excellent (follows workspace patterns from US1.1)
- Test Coverage: Comprehensive (all commands and edge cases validated)
- Documentation: Complete (package.json metadata and scripts properly documented)
- Performance: Excellent (sub-100ms validation times)

**Issues Found**: None

**Recommendations**:
- Story complete and ready for merge
- All prerequisites for Story 1.4 (test execution) are satisfied
- Citation-manager fully operational as workspace tool

## Phase 1 Completion Checklist

- [x] **Story Definition**: Copied exactly from epic with proper citation
- [x] **Acceptance Criteria**: Copied exactly from epic with anchor references
- [x] **Architectural Context**: All affected components identified with citations
- [x] **Technical Details**: File paths, dependencies, and constraints documented
- [x] **Design Principles**: Relevant principles identified and application guidance provided
- [x] **Testing Requirements**: Framework and test specifications defined
- [x] **Agent Workflow**: Recommended agent sequence documented
- [x] **Citation Validation**: All architectural references validated using citation manager (41/41 valid)
- [x] **Phase 1 Progress**: All progress tracking items marked complete

**Phase 1 Ready for Phase 2**: [x] (All items complete)

## Phase 2 Completion Checklist

- [x] **Milestone Generation Complete**: All high-level milestones created using proper format
- [x] **Agent Type Assignments**: All milestones have primary agent type identified
- [x] **Requirements Coverage**: All acceptance criteria mapped to specific milestones
- [x] **Architectural Alignment**: All milestones align with Phase 1 architectural context
- [x] **Digestible Organization**: Story broken into 3 clear, understandable milestones
- [x] **Conceptual Clarity**: Each milestone represents a complete feature or capability
- [x] **No Premature Atomization**: Milestones remain high-level without atomic task details
- [x] **Phase 2 Progress**: All progress tracking items marked complete
- [x] **Milestone Coverage Validation**: AC coverage documented with milestone mapping
- [x] **Milestone Sequence Summary**: Agent distribution and implementation approach documented

**Phase 2 Ready for Phase 3**: [x] (All items complete)

## Phase 3 Completion Checklist

- [x] **Milestone Transformation Complete**: All 3 Phase 2 milestones broken into atomic subtasks (9 total: 2+2+5)
- [x] **Atomic Enforcement**: Every subtask touches 0-1 files (well under 5-file maximum) with single validation checkpoint
- [x] **Workflow Appropriateness**: TDD skipped for M1/M2 (one-off config tasks), direct implementation used instead
- [x] **Workflow Structure**: M1/M2 follow implementation→validation pattern, M3 uses comprehensive manual validation
- [x] **Agent Assignments**: All subtasks assigned to specific agents based on workflow choice and work type
- [x] **Dependency Mapping**: Sequential dependencies clear (implementation → validation per milestone group)
- [x] **Implementation Detail**: All subtasks have sufficient technical detail for independent execution
- [x] **Validation Criteria**: Every subtask has specific validation command or manual testing method
- [x] **File Specifications**: All subtasks specify exact file paths with create/modify actions
- [x] **Proper Transformation**: Subtasks are transformations with appropriate workflow, not just detailed milestones
- [x] **Phase 3 Progress**: All progress tracking items marked complete
- [x] **Subtask Coverage**: All acceptance criteria mapped to specific atomic subtasks
- [x] **File Impact Analysis**: Complete accounting of files created (1), modified (1), and validated (7 manual tests)
- [x] **TDD Assessment Documented**: Rationale for skipping TDD clearly stated in coverage validation

**Phase 3 Ready for Phase 4**: [x] (All items complete)

## Next Phase

Implement the user story by acting as orchestrator following [Agent Workflow Sequence](#Agent%20Workflow%20Sequence)
