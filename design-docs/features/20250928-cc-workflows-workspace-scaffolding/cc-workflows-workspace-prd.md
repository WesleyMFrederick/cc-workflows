# CC Workflows - MVP Requirements Document

> [!danger] **Critial LLM Initialization Instructions**
> When first reading this file, you MUST IMMEDIATELY run citation manager to extract base paths: `npm run citation:base-paths <this-file-path> -- --format json`. Read ALL discovered base path files to gather complete architectural context before proceeding.

## Introduction

Efforts to improve workflows often get scattered across different projects, leading to [duplicated effort and inconsistent quality](../../Project%20Overview.md#Problem%20Statement), creating the frustration and wasted time. CC Workflows provides a [centralized, organized repository](../../Project%20Overview.md#Solution) that acts as a single source of truth for your development practices, establishing consistent shared infrastructure for testing and builds to ensure robust and reliable tool development. The expected impact is a  [reduction in the time spent on repetitive tasks](../../Project%20Overview.md#Success%20Metrics) like edits and context shaping, measurably improving LLM focus on correct context and reducing manual effort.

---

## Goals

Based on the project brief and your feedback, the refined goals for this MVP are:

- **Tool Enhancement:** Enhance the `citation-manager` to extract the [content of linked sections](../../Project%20Overview.md#^project-scope-future-updates-citation-manager) from source documents and aggregate them into a single file for improved context management.
- **User Outcome:** [Eliminate the manual, repetitive effort](../../Project%20Overview.md#Success%20Metrics) required to port workflow improvements across different projects.
- **Operational Capability:** Establish a [centralized, single source of truth](../../Project%20Overview.md#^project-scope-future-updates-workspace) for development tools, testing frameworks, and build processes.
- **Strategic Goal:** Build a scalable and repeatable framework that accelerates all future development and makes it more robust. ^goals-strategic-goal

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

---

## Requirements

### Functional Requirements
- **FR1: Workspace Structure:** The system SHALL establish a defined, version-controlled directory structure for the centralized workspace. ^FR1
- **FR2: Shared Testing Framework:** The workspace SHALL contain a single, shared configuration for a testing framework (Vitest) that can be used to run tests for any tool within the workspace. ^FR2
- **FR3: Shared Build Process:** The workspace SHALL provide a centralized, executable script (e.g., an npm script) for building components. ^FR3
- **FR4: Link Section Identification:** The `citation-manager` SHALL parse a given markdown document and identify all links that point to local markdown files, distinguishing between links **with section anchors and those without**. ^FR4
- **FR5: Section Content Extraction:** The `citation-manager` SHALL be able to extract content from a target file in two ways: 1) If a section anchor is provided, it SHALL extract the full content under that specific heading, 2) f no section anchor is provided, it SHALL extract the **entire content of the file**.^FR5
- **FR6: Content Aggregation:** The `citation-manager` SHALL aggregate the extracted content into a single markdown file, where each piece of content is **preceded by a markdown header that clearly identifies the source file and, if applicable, the section heading**. ^FR6
- **FR7: Centralized Execution:** The refactored `citation-manager` tool SHALL be executable from the workspace root, and the new aggregation feature SHALL be exposed via an **`--extract-context <output_file.md>` flag on the existing `validate` command**. ^FR7
- **FR8: Preserve Existing Functionality:** All existing `citation-manager` features—including validation of multiple link/anchor types, line-range filtering, scope-based caching, JSON output, and the `--fix` command's anchor correction logic—SHALL be preserved and function correctly after the tool is refactored into the new workspace. ^FR8
- **FR9: Test Migration:** All existing unit tests for the `citation-manager` SHALL be migrated to the new workspace and pass, running under the shared testing framework. ^FR9

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
> _Relevant Architecture Principles_: [dependency-abstraction](../../Architecture%20Principles.md#^dependency-abstraction), [black-box-interfaces](../../Architecture%20Principles.md#^black-box-interfaces), [component-isolation](../../Architecture%20Principles.md#^component-isolation)
<!-- -->
> **Technical Lead Feedback**: Error Handling & Logging Strategy decision needed
> _Architecture Impact_: We need to define a consistent strategy for how errors are logged and propagated to the CLI to ensure predictable behavior and support for automated workflows.
> _Relevant Architecture Principles_: [fail-fast](../../Architecture%20Principles.md#^fail-fast), [error-recovery](../../Architecture%20Principles.md#^error-recovery), [clear-contracts](../../Architecture%20Principles.md#^clear-contracts), [atomic-operations](../../Architecture%20Principles.md#^atomic-operations)

## Epic List

To deliver the MVP, the work is broken down into two sequential epics. This structure separates the foundational infrastructure and migration effort from the net-new feature development.

- **Epic 1: Workspace Scaffolding & `citation-manager` Migration:** Establishes the foundational workspace and validates it by migrating the existing, complex `citation-manager` tool into it without regression. This epic focuses on building the "factory."
- **Epic 2: `citation-manager` Content Aggregation Enhancement:** Builds the new content-extraction feature on top of the successfully migrated tool. This epic focuses on producing the first new "product" from the factory.

> _Rationale_: This two-epic structure deliberately separates the foundational migration and de-risking work (Epic 1) from the net-new feature development (Epic 2). While a single epic was considered, this phased approach provides clearer deliverables and validates the core framework with an existing tool before extending it with new functionality.

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
> _Documentation_: See [WORKSPACE-SETUP.md](../../../WORKSPACE-SETUP.md#vitest-test-discovery-pattern) for complete pattern documentation and [Architecture: Testing Infrastructure](cc-workflows-workspace-architecture.md#Testing%20Infrastructure) for design rationale.
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

### Story 1.4: Migrate and Validate `citation-manager` Test Suite

**As a** developer,
**I want** to migrate by refactoring the existing `citation-manager` test suite into the workspace and run it successfully using the shared test framework,
**so that** I can prove that no functionality has regressed during the migration.

#### Story 1.4 Acceptance Criteria
1. GIVEN the new workspace structure, WHEN the `citation-manager`'s test files and fixtures are moved, THEN they SHALL reside within the tool's  directory. ^US1-4AC1
2. WHEN the root test command (e.g., `npm test`) is executed, THEN the shared test runner (Vitest) SHALL discover and run all migrated `citation-manager` tests. ^US1-4AC2
3. GIVEN the migrated test suite, WHEN the tests are run, THEN all tests MUST pass, confirming zero regressions. ^US1-4AC3
4. WHEN test migration and validation complete successfully, THEN the original location (`src/tools/utility-scripts/citation-links/`) SHALL be empty or removed. ^US1-4AC4

> **Note**: AC4 was moved from Story 1.2 following Safety-First Design principles - we preserve the legacy location until all migration, executability (US1.3), and test validation (US1.4) confirms success.

_Depends On_: Story 1.3
_Functional Requirements_: [[#^FR2|FR2]], [[#^FR9|FR9]]

---

## Epic 2: `citation-manager` Content Aggregation Enhancement

### Epic 2 Scope
Build the functionality for the `citation-manager` to parse markdown files, identify links to specific sections, and aggregate the content of those sections into a new file.

### Epic 2 Goal
Extend the tool to programmatically extract and aggregate full section content, delivering the primary user-facing feature of the MVP.

### Epic 2 Objectives
- Implement logic to identify and parse links that point to specific sections within other local markdown documents.
- Develop the functionality to read target files and extract the full content of the file.
- Develop the functionality to read target files and extract the full content of the linked sections.
- Create a single, well-structured output file containing the aggregated content from all extracted content.
- Ensure the new functionality is covered by tests that meet the reliability target.

### Epic 2 Improvement vs. Baseline
- The ability to programmatically extract and aggregate full section content **vs.** _the `citation-manager` only validating the existence of links and anchors._
- An automated workflow for building LLM context **vs.** _a manual, time-consuming process of copying and pasting relevant information._

### Epic 2 User Value
- **Time Savings:** Reduces the manual effort required to gather and structure context for complex prompts or tasks.
- **Impact:** Delivers the first feature improvement that leverages the new workspace, immediately demonstrating the value of the centralized framework.

---
### Story 2.1: Enhance Parser to Handle Full-File and Section Links

**As a** developer,
**I want** the parser to identify links to both entire markdown files and specific sections within them,
**so that** I can handle both types of content extraction in a unified way.

#### Story 2.1 Acceptance Criteria
1. GIVEN a markdown file, WHEN the parser runs, THEN it SHALL extract an array of all links pointing to local markdown files, distinguishing between links with section anchors and those without. ^US2-1AC1
2. GIVEN the parser identifies multiple links to the same file, but at least one link includes a section anchor, THEN the system SHALL prioritize the section link(s) for extraction and issue a warning that the full file content will be ignored in favor of the more specific section(s). ^US2-1AC2
3. GIVEN the parser identifies only links without section anchors to a specific file, THEN it SHALL designate the entire file for content extraction. ^US2-1AC3

> **Technical Lead Feedback**: Parser output data contract design required
> _Architecture Impact_: The data contract for the parser's output must be designed to clearly communicate the type of link (full-file vs. section) and any associated metadata to downstream components.
> _Relevant Architecture Principles_: [data-model-first](../../Architecture%20Principles.md#^data-model-first), [primitive-first-design](../../Architecture%20Principles.md#^primitive-first-design), [illegal-states-unrepresentable](../../Architecture%20Principles.md#^illegal-states-unrepresentable), [explicit-relationships](../../Architecture%20Principles.md#^explicit-relationships)

_Depends On_: Epic 1 Completion
_Functional Requirements_: [[#^FR4|FR4]]

### Story 2.2: Implement Unified Content Extractor with Metadata

**As a** developer,
**I want** to create a content extraction module that can return either a full file's content or a specific section's content, including source metadata,
**so that** I have a single, reliable way to retrieve content for aggregation.

#### Story 2.2 Acceptance Criteria
1. GIVEN a file path and an optional heading, WHEN the extractor is called, THEN it SHALL return a structured object containing the extracted `content` string and `metadata`. ^US2-2AC1
2. IF a heading is provided, THEN the `content` SHALL be the text between that heading and the next heading of an equal or higher level. ^US2-2AC2
3. IF no heading is provided, THEN the `content` SHALL be the entire content of the file. ^US2-2AC3
4. GIVEN a file path or heading that does not exist, WHEN the extractor is called, THEN it SHALL fail gracefully by returning null or an empty object and log a warning. ^US2-2AC4

> **Technical Lead Feedback**: Parser-extractor interaction model design required
> _Architecture Impact_: The interaction model between the parser and this new extractor component needs to be designed, including the specific data structures they will use to communicate.
> _Relevant Architecture Principles_: [black-box-interfaces](../../Architecture%20Principles.md#^black-box-interfaces), [data-model-first](../../Architecture%20Principles.md#^data-model-first), [component-isolation](../../Architecture%20Principles.md#^component-isolation)

_Depends On_: Story 2.1
_Functional Requirements_: [[#^FR5|FR5]]

### Story 2.3: Add `--extract-context` Flag to `validate` Command

**As a** developer,
**I want** to add an `--extract-context` flag to the existing `validate` command,
**so that** I can generate a structured context file based on the links found in a source document.

#### Story 2.3 Acceptance Criteria
1. GIVEN a new `--extract-context <output_file.md>` flag is added to the `validate` command, WHEN run, THEN it SHALL execute the end-to-end context aggregation process and write the result to the specified output file. ^US2-3AC1
2. GIVEN the output file, THEN the content from each extracted source SHALL be clearly delineated by a markdown header indicating its origin file (e.g., `## File: path/to/source.md`). ^US2-3AC2
3. IF content is extracted from a specific section, THEN the header in the output file SHALL also include the section heading (e.g., `## File: path/to/source.md#Section Heading`). ^US2-3AC3

> **Technical Lead Feedback**: Research and a design decision are needed to confirm if adding a feature flag to the `validate` command is the correct long-term CLI interface, or if a new, dedicated `extract` command would be more intuitive and extensible.
> _Relevant Architecture Principles_: [simplicity-first](../../Architecture%20Principles.md#^simplicity-first), [follow-conventions](../../Architecture%20Principles.md#^follow-conventions), [immediate-understanding](../../Architecture%20Principles.md#^immediate-understanding), [extension-over-modification](../../Architecture%20Principles.md#^extension-over-modification)

_Depends On_: Story 2.2
_Functional Requirements_: [[#^FR6|FR6]], [[#^FR7|FR7]]

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
