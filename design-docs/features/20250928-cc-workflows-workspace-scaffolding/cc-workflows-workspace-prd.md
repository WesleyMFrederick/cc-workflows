# CC Workflows - MVP Requirements Document

> [!danger] **Critial LLM Initialization Instructions**
> When first reading this file, you MUST IMMEDIATELY run citation manager to extract base paths: `npm run citation:base-paths <this-file-path> -- --format json`. Read ALL discovered base path files to gather complete architectural context before proceeding.

## Introduction

Efforts to improve workflows often get scattered across different projects, leading to [duplicated effort and inconsistent quality](../../Project%20Overview.md#Problem%20Statement), creating the frustration and wasted time. CC Workflows provides a [centralized, organized repository](../../Project%20Overview.md#Solution) that acts as a single source of truth for your development practices, establishing consistent shared infrastructure for testing and builds to ensure robust and reliable tool development. The expected impact is a  [reduction in the time spent on repetitive tasks](../../Project%20Overview.md#Success%20Metrics) like edits and context shaping, measurably improving LLM focus on correct context and reducing manual effort.

---

## Goals

This PRD focuses on workspace infrastructure goals:

- **User Outcome:** [Eliminate the manual, repetitive effort](../../Project%20Overview.md#Success%20Metrics) required to port workflow improvements across different projects.
- **Operational Capability:** Establish a [centralized, single source of truth](../../Project%20Overview.md#^project-scope-future-updates-workspace) for development tools, testing frameworks, and build processes.
- **Strategic Goal:** Build a scalable and repeatable framework that accelerates all future development and makes it more robust. ^goals-strategic-goal

> **Note**: Tool enhancement goals (citation-manager content aggregation) are documented in the [citation-manager feature PRD](../../../tools/citation-manager/design-docs/features/20251003-content-aggregation/content-aggregation-prd.md).

---

## Background Context

The current development landscape consists of valuable tools and workflow ideas scattered across different, isolated projects. When an improvement is conceived—like enhancing the `citation-manager` to better manage LLM context—it triggers a [time-consuming "meta-work" phase](../../Problem%20Eliciation.md#Process%20and%20Time%20Investment%20Breakdown) of impact analysis and manual file porting that can halt progress for days. This friction creates a significant barrier to innovation and leads to an inconsistent and unreliable developer experience. (_Source: [Problem Statement](../../Project%20Overview.md#Problem%20Statement)_)

Analysis of the current workflow revealed that this pain is a consistent bottleneck. The existing process relies on [manual file copying](../../Problem%20Eliciation.md#The%20Portability%20&%20Consistency%20Step) and lacks any shared infrastructure for common needs like testing or builds. This creates a high risk of projects falling out of sync. The key gap is the absence of a unified system to efficiently manage, test, and deploy reusable workflow components like the `citation-manager`, whose [context-management potential is currently trapped](../../Problem%20Eliciation.md#Key%20Observations) in other projects.

---

## Alignment with Product Vision

This MVP directly supports the **CC Workflows** [vision](../../Project%20Overview.md#Vision%20Statement) "to create a welcoming and approachable toolkit that empowers you to build better, faster" and establish a "refined, repeatable, and robust framework." It does so in the following ways:

- **Refined:** It provides a central hub where core tools like the `citation-manager` can be continuously improved and perfected, ensuring every project benefits from the most refined version.
- **Repeatable:** It establishes a standardized process for provisioning projects with proven tools, eliminating the error-prone, manual work of copying files and ensuring consistency.
- **Robust:** It creates a shared testing and build infrastructure, guaranteeing that all components within the framework meet a consistent quality bar from the start.
- **Future Foundation:** It delivers the foundational workspace necessary to support planned future capabilities, such as the Citation Manager 2.0 enhancements and the Context Engineering agent.

---

## Changelog

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-22 | 1.0 | Initial PRD creation with Epic structure and functional requirements | Wesley |
| 2025-09-23 | 1.1 | Enhanced functional requirements based on research findings, integrated content aggregation patterns from repomix analysis | Wesley |
| 2025-09-23 | 1.2 | Updated Related Links with descriptions, fixed markdown linting issues, consolidated duplicate sections | Wesley |
| 2025-09-30 | 1.3 | Updated US1.1 dependencies to reflect actual implementation (Biome vs ESLint), resolved Technical Lead Feedback items with US1.1 implementation details (test discovery, intra-package dependency strategy), added module system compatibility note to US1.3, documented pattern validation in Epic 1 User Value | Application Tech Lead Agent |
| 2025-10-03 | 2.0 | Refactored to workspace infrastructure focus: Moved Epic 2 and US 1.4 to citation-manager feature PRD following feature documentation convention, removed FR4-FR7 content aggregation requirements, updated goals and epic list to reflect workspace infrastructure scope only | Product Manager Agent |

---

## Requirements

### Functional Requirements
- **FR1: Workspace Structure:** The system SHALL establish a defined, version-controlled directory structure for the centralized workspace. ^FR1
- **FR2: Shared Testing Framework:** The workspace SHALL contain a single, shared configuration for a testing framework (Vitest) that can be used to run tests for any tool within the workspace. ^FR2
- **FR3: Shared Build Process:** The workspace SHALL provide a centralized, executable script (e.g., an npm script) for building components. ^FR3
- **FR8: Preserve Existing Functionality:** All existing `citation-manager` features—including validation of multiple link/anchor types, line-range filtering, scope-based caching, JSON output, and the `--fix` command's anchor correction logic—SHALL be preserved and function correctly after the tool is refactored into the new workspace. ^FR8
- **FR9: Test Migration:** All existing unit tests for the `citation-manager` SHALL be migrated to the new workspace and pass, running under the shared testing framework. ^FR9

> **Note**: Content aggregation functional requirements (FR4-FR7) are documented in the [citation-manager feature PRD](../../../tools/citation-manager/design-docs/features/20251003-content-aggregation/content-aggregation-prd.md#Requirements).

### Non-Functional Requirements
- **NFR1: Workflow Performance:** The process of onboarding a new, simple script into the framework SHALL take less than 30 minutes. ^NFR1
- **NFR2: Maintainability:** All code within the workspace SHALL adhere to a defined set of coding conventions enforced by a linter. ^NFR2
- **NFR3: Reliability:** The refactored `citation-manager` SHALL include unit tests that run via the shared testing framework and achieve at least 50% code coverage on _new_ functionality. ^NFR3
- **NFR4: Design Adherence:** The workspace structure and tool implementation SHALL adhere to the defined MVB (Minimum Viable Boilerplate) design principles and testing strategy. ^NFR4

## Technical Considerations

The following technical design decisions are foundational to the implementation and require architectural planning before development begins:

> **Technical Lead Partial Resolution** (US1.1): Intra-package dependency pattern established
> _US1.1 Finding_: Modules within a package use **relative paths with explicit `.js` extensions** (ESM standard). Mock-tool implementation: `import { greet } from "./greeter.js"`. Citation-manager already follows this pattern: `import { CitationValidator } from "./src/CitationValidator.js"`.
> _Still Open_: Cross-package dependencies (e.g., citation-manager importing from shared-utils) not yet tested. Will be addressed when/if shared packages are introduced.
> _Relevant Architecture Principles_: [dependency-abstraction](../../Architecture%20Principles.md#^dependency-abstraction), [black-box-interfaces](../../Architecture%20Principles.md#^black-box-interfaces), [single-responsibility](../../Architecture%20Principles.md#^single-responsibility)
<!-- -->
> **Technical Lead Feedback**: Error Handling & Logging Strategy decision needed
> _Architecture Impact_: We need to define a consistent strategy for how errors are logged and propagated to the CLI to ensure predictable behavior and support for automated workflows.
> _Relevant Architecture Principles_: [fail-fast](../../Architecture%20Principles.md#^fail-fast), [error-recovery](../../Architecture%20Principles.md#^error-recovery), [clear-contracts](../../Architecture%20Principles.md#^clear-contracts), [atomic-operations](../../Architecture%20Principles.md#^atomic-operations)

## Epic List

This PRD covers workspace infrastructure scaffolding:

**Epic 1: Workspace Scaffolding & `citation-manager` Migration:** Establishes the foundational workspace and validates it by migrating the existing, complex `citation-manager` tool into it without regression. This epic focuses on building the "factory."

> **Note**: Epic 2 (citation-manager Content Aggregation Enhancement) has been moved to the [citation-manager feature-level PRD](../../../tools/citation-manager/design-docs/features/20251003-content-aggregation/content-aggregation-prd.md) as it represents tool-specific feature development rather than workspace infrastructure.

---

## Epic 1: Workspace Scaffolding & `citation-manager` Migration

### Epic 1 Scope
Create the foundational `CC Workflows` workspace and migrate the entire existing `citation-manager` tool into it.

### Epic 1 Goal
Establish shared infrastructure (testing, linting, builds) and prove that a complex, existing tool can operate within it successfully.

### Epic 1 Objectives
- Create the standardized directory structure for the centralized workspace.
- Implement shared, root-level configurations for the testing framework and linter.
- Successfully move the entire `citation-manager` codebase and its dependencies into the new structure.
- Ensure all existing `citation-manager` features and its full test suite function correctly in the new environment.

### Epic 1 Improvement vs. Baseline
- A centralized, version-controlled workspace **vs.** _a standalone tool in a non-reusable project structure._
- A shared, one-command test runner for all tools **vs.** _project-specific test execution._
- ~~A proven and validated migration path for existing tools **vs.** _no defined process for centralization._~~

### Epic 1 User Value
- **De-risking:** Confirms the core assumption that the framework can support a real-world, complex tool, validating our architectural approach.
- **Foundation:** Creates the stable, repeatable environment necessary for all future tool development and enhancements.
- **Efficiency:** The migrated tool can now be maintained and improved from a single source of truth, immediately paying down the "meta-work tax."
- **Pattern Validation (US1.1 Completed):** Core workspace patterns (NPM Workspaces, Vitest test discovery, Biome integration, CLI orchestration) validated through mock-tool proof-of-concept, de-risking Stories 1.2-1.4 migration work.

---
### Story 1.1: Establish Workspace Directory Structure & Basic Config

**As a** developer,
**I want** a standardized directory structure and basic configuration for the `CC Workflows` workspace,
**so that** I have a clean and repeatable foundation for centralizing my tools.

#### Story 1.1 Acceptance Criteria
1. WHEN the repository is cloned, THEN a defined folder structure SHALL exist. ^US1-1AC1
2. WHEN `npm install` is run at the root, THEN all shared development dependencies (e.g., `vitest`, `@biomejs/biome`, `c8`) SHALL be installed. ^US1-1AC2
3. GIVEN a shared configuration file for the linter (e.g., `biome.json`), WHEN the lint command is run from the root, THEN it SHALL apply to all code within the workspace. ^US1-1AC3

> **Technical Lead Resolution** (US1.1 Completed): Test discovery implemented via Vitest glob patterns
> _Implementation_: Vitest configuration uses `tools/**/test/**/*.test.js` pattern for workspace packages while preserving legacy patterns (`src/tests/**/*.test.js`, `test/**/*.test.js`) to support incremental migration. Pattern successfully validated through mock-tool proof-of-concept in US1.1.
> _Documentation_: See [WORKSPACE-SETUP.md](../../../WORKSPACE-SETUP.md#Vitest%20Test%20Discovery%20Pattern) for complete pattern documentation and [Architecture: Testing Infrastructure](cc-workflows-workspace-architecture.md#Testing%20Infrastructure) for design rationale.
> _Relevant Architecture Principles_: [black-box-interfaces](../../Architecture%20Principles.md#^black-box-interfaces), [tool-first-design](../../Architecture%20Principles.md#^tool-first-design), [simplicity-first](../../Architecture%20Principles.md#^simplicity-first)

_Depends On_: None
_Functional Requirements_: [[#^FR1|FR1]]
_Non-Functional Requirements_: [[#^NFR2|NFR2]], [[#^NFR4|NFR4]]
_User Story Link:_ [us1.1-establish-workspace-directory-structure-and-basic-config](user-stories/us1.1-establish-workspace-directory-structure-and-basic-config/us1.1-establish-workspace-directory-structure-and-basic-config.md)

### Story 1.2: Migrate `citation-manager` Source Code

**As a** developer,
**I want** to move the `citation-manager` source code and its related assets into the new workspace package structure,
**so that** the tool is properly located within the centralized framework.

#### Story 1.2 Acceptance Criteria
1. GIVEN the new workspace structure, WHEN the `citation-manager`'s source files are moved, THEN they SHALL reside in `tools/citation-manager/src/` directory. ^US1-2AC1

2. GIVEN the `citation-manager`'s supporting documents, WHEN they are moved, THEN:
   - Tool overview (`README.md`) SHALL be co-located in `tools/citation-manager/`
   - Tool architecture baseline (`ARCHITECTURE.md`) SHALL be migrated to `tools/citation-manager/design-docs/Architecture.md`
   - Historical feature documentation (`tasks/250919-auto-fix-short-file-names/`) SHALL be migrated to `tools/citation-manager/design-docs/features/250919-auto-fix-short-file-names/` ^US1-2AC2

> **Safety-First Decision**: Original AC3 (legacy location cleanup) has been **deferred to Story 1.4** to preserve source files until test migration and executability validation complete. This follows the **Safety-First Design** principle - we don't delete anything until all validation (US1.3 executability, US1.4 test migration) confirms success.
>
> **Documentation Organization Note**: The citation-manager contains historical task documentation from a previous feature implementation (250919-auto-fix-short-file-names). This documentation will be preserved in the tool's `design-docs/features/` folder following the established documentation hierarchy pattern. This ensures tool-level documentation remains self-contained while maintaining implementation history.

_Depends On_: Story 1.1
_Functional Requirements_: [[#^FR8|FR8]]
_User Story Link:_ [us1.2-migrate-citation-manager-source-code](user-stories/us1.2-migrate-citation-manager-source-code/us1.2-migrate-citation-manager-source-code.md)

### Story 1.3: Make Migrated `citation-manager` Executable

**As a** developer,
**I want** to configure the migrated `citation-manager` to be executable from the workspace root,
**so that** I can run its commands and validate that the internal module connections are working.

#### Story 1.3 Acceptance Criteria
1. GIVEN the migrated source code, WHEN an npm script is created in the root, THEN it SHALL execute the `citation-manager.js` CLI. ^US1-3AC1
2. WHEN each of the primary CLI commands is run via the npm script on a valid test fixture, THEN each command SHALL execute without throwing module resolution errors. ^US1-3AC2
3. WHEN the `--help` flag is used with the new npm script, THEN the CLI SHALL display the correct help menu for the citation manager. ^US1-3AC3

> **Implementation Note** (US1.1 Finding): Citation-manager already uses ESM module syntax (`import`/`export`), consistent with workspace standard established in US1.1. No module system conversion required during migration.

_Depends On_: Story 1.2
_Functional Requirements_: [[#^FR7|FR7]], [[#^FR8|FR8]]
_User Story Link:_ [us1.3-make-migrated-citation-manager-executable](user-stories/us1.3-make-migrated-citation-manager-executable/us1.3-make-migrated-citation-manager-executable.md)

---

> **Note**: Story 1.4 (Migrate and Validate citation-manager Test Suite) has been moved to the [citation-manager Content Aggregation feature](../../../tools/citation-manager/design-docs/features/20251003-content-aggregation/content-aggregation-prd.md#Story%201.4%3A%20Migrate%20and%20Validate%20%60citation-manager%60%20Test%20Suite) as it relates to tool-level testing rather than workspace infrastructure.

---

## Epic 2: `citation-manager` Content Aggregation Enhancement

> **Note**: Epic 2 has been moved to the citation-manager package as a feature-level PRD. See [citation-manager Content Aggregation PRD](../../../tools/citation-manager/design-docs/features/20251003-content-aggregation/content-aggregation-prd.md) for complete requirements and story breakdown.

---
## MVP Validation Approach

The success of this MVP will be validated directly by the primary user through the following criteria:

- **Workspace Viability**: The foundational workspace is considered successful when the existing `citation-manager` tool and its complete test suite are migrated and all tests pass without any regressions. This confirms the framework's ability to support complex, real-world tooling.
- **New Feature Functionality**: The content aggregation feature is considered successful when the `--extract-context` command can be run on a source markdown file and it correctly generates a single, well-structured output file containing the full content from all designated links (both full-file and section-specific).
- **Workflow Efficiency Gain**: The overall project is successful when making a small, hypothetical change to the now-centralized `citation-manager` feels demonstrably faster and requires significantly fewer manual steps than the original, fragmented baseline process.

---
## Out of Scope

To ensure focus on the core value proposition for the MVP, the following features and capabilities are explicitly out of scope:

- **Advanced Dependency Management**: A formal strategy for how other projects will consume this framework (e.g., publishing it as a private NPM package or using git submodules) is deferred. For the MVP, the framework will exist as a standalone, self-contained repository.
- **Automated Project Provisioning**: This MVP does not include a command-line tool or script to automatically apply the `CC Workflows` framework to new or existing external projects. The focus is on building the framework itself, not the tooling to deploy it.
- **Graphical User Interface (GUI)**: No graphical user interface will be developed for the `citation-manager` or any other part of the framework. All operations will be performed via the command line.
- **Onboarding Additional Tools**: The framework will be designed with extensibility in mind, but this MVP will _only_ include the refactoring and enhancement of the `citation-manager`. No other existing tools will be migrated at this stage.

---

## Related Links
- [Project Overview](../../Project%20Overview.md) - High-level project context and strategic objectives for the CC Workflows initiative.
- [Problem Eliciation](../../Problem%20Eliciation.md) - Detailed analysis of the current workflow pain points and inefficiencies that drive this MVP.
- [content-aggregation-research](research/content-aggregation-research.md) - Comprehensive research on content aggregation patterns, workspace management, and CLI integration strategies.
