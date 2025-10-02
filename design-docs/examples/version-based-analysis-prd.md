<!-- markdownlint-disable MD024 -->
# Claude Code Version Based Analysis Requirements Document

## Introduction

This feature implements version-based analysis repository restructuring with automation to organize Claude Code analyses by version number while eliminating manual binary handling friction. The feature addresses the current flat directory structure that cannot accommodate multiple versions and automates the time-consuming manual steps of binary location, movement, and beautification that currently waste 15-20 minutes per analysis cycle.

## Alignment with Product Vision

This feature directly supports the Claude Code Knowledgebase goals outlined in the Product Overview:
- **Portfolio Development**: Demonstrates systematic version management approach for job applications
- **Analysis Capability**: Enables historical comparison across Claude Code versions for architectural evolution tracking
- **Workflow Efficiency**: Eliminates manual friction that interrupts the core 5-phase analysis pipeline
- **Future Features Foundation**: Establishes infrastructure for planned Merkle tree/hash-based incremental updates

## Requirements

### Functional Requirements
- FR1: On start of the **Code Processing Application**, automatically detect the installed Claude Code CLI version from the source binary. ^FR1
- FR2: If the detected version directory does not exist, create `/claude-code-analysis/v{version}/`, copy the binary as `cli.js`, and establish the organized directory structure. ^FR2
- FR3: If version detection fails, log the failure and continue using a unique identifier (e.g., datetime/hash) to isolate artifacts. ^FR3
- FR4: The system **shall proactively search** a predefined list of common installation paths to locate the Claude Code CLI binary before proceeding. ^FR4
- FR5: **If the proactive search fails** and the binary cannot be located, display a guided error message with remediation steps and halt execution. ^FR5
- FR6: After preparing the binary, run a deterministic code formatter to produce a formatted source; halt if formatting fails. ^FR6
- FR7: While any automation step runs, display progress indicators and an estimated completion time. ^FR7
- FR8: When the same identifier is processed again, reuse existing `File System.Chunk Repository` folders and preserve prior artifacts. ^FR8
- FR9: Provide version selection in Analysis/Q&A apps with options: (1) latest complete analysis (default), (2) last version used for Q&A, (3) currently installed CLI version. If no preference is specified, default to latest complete. **If the "currently installed CLI version" cannot be detected, this option shall be disabled or display an informative message.** ^FR9
- FR10: Maintain seamless compatibility of the existing 5-phase analysis pipeline with the new version-based directory structure (no workflow changes required). ^FR10
- FR11: The system shall provide a mechanism for the user to select two analysis versions and view a text-based difference between a specified, identically named artifact from each version. ^FR11

### Non Functional Requirements
- NFR1: Follow Single Responsibility—separate, testable modules for version detection, binary management, and directory organization. ^NFR1
- NFR2: Use modular design with clear interfaces and minimal coupling to existing pipeline scripts. ^NFR2
- NFR3: Automation must complete in ≤2 minutes and must not materially impact Q&A response times or overall processing benchmarks. ^NFR3
- NFR4: Perform basic binary integrity validation before processing (e.g., size > 5MB and contains "claude"); preserve file permissions; do not expose sensitive paths or info in logs. ^NFR4
- NFR5: Ensure graceful failure modes, including atomic version directory creation and robust error handling. **This includes a rollback procedure where, if any automation step after directory creation fails, the system shall delete the newly created version directory and all its contents.** ^NFR5
- NFR6: Usability—adopt semantic versioning conventions; provide clear, actionable error messages; keep existing workflows unchanged except for removed manual steps; avoid adding navigation complexity for Q&A users. ^NFR6
- NFR7: Observability—provide progress indicators and sufficient logs to support troubleshooting of automation steps. ^NFR7

## Epic List
- **Epic 1: Automated Analysis Restructuring & Processing:** Establish the automated backend process for detecting the Claude Code CLI version, creating a version-specific directory structure, and preparing the binary for analysis to eliminate manual workflow friction.
- **Epic 2: User-Facing Version Selection & Q&A:** Implement a version selection interface within the Q&A application to allow users to easily query different analysis versions, enabling historical comparison.

> _Rational_: I evaluated splitting the work into three epics, but decided the initial two-epic structure is better. One for backend automation and one for the user interface feels right, as the automation can deliver value on its own, before the UI is completed.

---

## Epic 1: Automated Analysis Restructuring & Processing
Establish the automated backend process for detecting the Claude Code CLI version, creating a version-specific directory structure, and preparing the binary for analysis to eliminate manual workflow friction.

### Objectives
- Automatically detect the Claude Code CLI's version
- Create a version-specific directory structure
- Prepare the binary for the existing analysis pipeline

### Improvement vs. Baseline
- Automates code processing _vs.* user manually processing code

### User Value
- Eliminates 15-20 minutes of frustrating manual work per analysis cycle
- Improves overall workflow efficiency
- Reduces the potential for human error

---

### Story 1.1: Version Detection and Directory Scaffolding

**As a** Technical PM,
**I want** the system to automatically detect the binary's version and create a corresponding versioned directory,
**so that** analysis artifacts are organized systematically without manual intervention.

#### Acceptance Criteria
1. WHEN the `Code Processing Application` starts, THEN the system SHALL extract the version number from the source binary. ^US1-1AC1
2. IF a directory for the extracted version does not exist, THEN the system shall create it. ^US1-1AC2
3. IF version detection fails, THEN the system SHALL log the failure AND create a new directory using a unique identifier. ^US1-1AC3
4. The system SHALL ensure the directory creation process is atomic. ^US1-1AC4
5. The system SHALL log all automation steps to support troubleshooting. ^US1-1AC5

_Depends On_: None
_Functional Requirements_: [[#^FR1|FR1]], [[#^FR2|FR2]], [[#^FR3|FR3]]
_Non-Functional Requirements_: [[#^NFR5|NFR5]], [[#^NFR7|NFR7]]

---

### Story 1.2: Automated Binary Relocation and Validation

**As a** Technical PM,
**I want** the system to automatically locate the source binary, copy it to the correct version directory, and validate it,
**so that** I don't have to waste time manually finding and moving files.

#### Acceptance Criteria
1. WHEN the version directory is successfully created, THEN the system SHALL copy the source binary into it AND rename the copy `cli.js`.
2. WHEN the binary has been copied, THEN the system SHALL validate that its size is greater than 5MB AND it contains the string "claude".
3. The system SHALL preserve the file permissions of the original binary on the copied file.
4. IF the source binary cannot be located, THEN the system SHALL display a guided error message with remediation steps AND halt execution.

_Depends On_: 1.1
_Functional Requirements_: [[#^FR2|FR2]], [[#^FR4|FR4]]
_Non-Functional Requirements_: [[#^NFR4|NFR4]]

---

### Story 1.3: Automated Code Formatting

**As a** Technical PM,
**I want** the system to automatically format the copied binary file,
**so that** the code is beautified and ready for analysis without me needing to remember and run the formatting commands manually.

#### Acceptance Criteria
1. WHEN the binary has been copied and validated, THEN the system SHALL run a deterministic code formatter on `cli.js`.
2. IF the formatting process fails, THEN the system SHALL halt execution.
3. WHILE the code formatter is running, THEN the system SHALL display a progress indicator.
4. The system SHALL complete the entire automation process in under 2 minutes.

_Depends On_: 1.2
_Functional Requirements_: [[#^FR5|FR5]], [[#^FR6|FR6]]
_Non-Functional Requirements_: [[#^NFR3|NFR3]]

---

### Story 1.4: Pipeline Integration and Artifact Reuse

**As a** Technical PM,
**I want** the existing 5-phase analysis pipeline to work seamlessly with the new versioned directory structure,
**so that** my established analysis workflow is not disrupted.

#### Acceptance Criteria
1. The system SHALL ensure the existing 5-phase analysis scripts execute successfully using the versioned directory as the root.
2. The system SHALL ensure no manual changes to the existing analysis workflow are required.
3. IF the pipeline is run for a version with existing artifacts, THEN the system SHALL reuse those artifacts.
4. The system SHALL ensure new modules for this feature are loosely coupled from existing pipeline scripts.

_Depends On_: 1.3
_Functional Requirements_: [[#^FR7|FR7]], [[#^FR9|FR9]]
_Non-Functional Requirements_: [[#^NFR1|NFR1]], [[#^NFR2|NFR2]]

Of course. Here are the details for Epic 2, following the approved format.

---

## Epic 2: User-Facing Version Selection & Q&A
Implement a version selection interface within the Q&A application to allow users to easily query different analysis versions, enabling historical comparison.

### Objectives
- Implement a user interface for selecting from available analysis versions.
- Ensure the Q&A application uses the data corresponding to the selected version.
- Enable easy comparison of different Claude Code CLI versions.

### Improvement vs. Baseline
- Intelligent, version-aware code analysis **vs.** manual code exploration of a single version.

### User Value
- Enables historical comparison to track the architectural evolution of Claude Code.
- Prevents confusion between analyses of different versions.
- Demonstrates a systematic approach to version management for the user's portfolio.

---

### Story 2.1: Implement Version Selection Interface

**As a** Technical PM,
**I want** a clear menu to select a specific analysis version,
**so that** I can easily choose which codebase to ask questions about.

#### Acceptance Criteria
1. When the `Q&A Application` starts, then the system shall present a list of analysis versions with the options: (1) latest complete analysis, (2) last version used, and (3) currently installed CLI version.
2. If no version selection is made, then the system shall default to using the latest complete analysis.
3. The system shall ensure the version selection interface does not add significant navigation complexity for the user.

_Depends On_: None
_Functional Requirements_: [[#^FR8|FR8]]
_Non-Functional Requirements_: [[#^NFR6|NFR6]]

---

### Story 2.2: Process Questions Against Selected Version

**As a** Technical PM,
**I want** my questions to be answered using the data from my selected analysis version,
**so that** I can get accurate, context-specific insights.

#### Acceptance Criteria
1. When a user asks a question, then the `Q&A Application.Semantic Chunk Selector` shall use the semantic index and artifacts from the directory of the currently selected version.
2. If the artifacts for a selected version are missing or incomplete, then the system shall display a clear, actionable error message.
3. The system shall ensure that processing questions against different versions does not materially impact Q&A response times.

_Depends On_: 2.1
_Functional Requirements_: [[#^FR8|FR8]]
_Non-Functional Requirements_: [[#^NFR3|NFR3]]

Excellent. Based on the actionable learning from our Hindsight Reflection, here is the new user story.

This functionality was discovered during elicitation and will require a new functional requirement to be formally added to the PRD. I have proposed it below as `FR11`.

---

### Story 2.3: Basic Version Comparison

**As a** Technical PM,
**I want** to perform a simple text-based comparison between a file from my selected analysis version and the same file from another version,
**so that** I can quickly identify architectural changes and validate the value of historical analysis.

#### Acceptance Criteria
1. When a primary analysis version is selected, then the system shall provide a user interface option to initiate a comparison with another version.
2. When the user initiates a comparison, then the system shall prompt them to select a second version and specify an identically named artifact (file) to compare.
3. If the specified artifact exists in both selected versions, then the system shall generate and display a text-based `diff` of the two files in the terminal.
4. If the specified artifact does not exist in one or both of the selected version directories, then the system shall display an actionable error message.

_Depends On_: 2.1
_Functional Requirements_: [[#^FR11|FR11]]
_Non-Functional Requirements_: None

---

## MVP Validation Approach

The success of this feature will be validated directly by the primary user through the following criteria:

- **Automation Success**: The feature is considered successful when a new version analysis can be completed end-to-end—from detecting the new binary to having artifacts ready for the Q&A app—with zero manual file operations (locating, moving, formatting).
- **Functional Success**: The feature is considered successful when the user can select any available analysis version and receive an accurate Q&A response, and can also successfully generate a text-based `diff` between any two versions as specified in the requirements.

---

## Out of Scope

To ensure focus on the core value proposition for the MVP, the following features and capabilities are explicitly out of scope:

- **Storage Optimization**: This MVP will not include any features for managing disk space, such as pruning or archiving old analysis versions, or deduplicating common code chunks between versions.
- **Advanced Comparison Tools**: The version comparison feature is limited to a text-based `diff` output in the terminal. Graphical user interface (GUI) diffing tools and semantic code analysis of changes are not included.
- **Automated Triggers**: The automation is designed to be initiated manually by the user. It will not be automatically triggered by file watchers, hooks, or any other file system monitoring.

---

## Related Files
- /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/claude-code-knowledgebase/docs/Product Overview.md
- /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/claude-code-knowledgebase/docs/Architecture Baseline.md
- /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/claude-code-knowledgebase/docs/features/version-based-analysis/version-based-analysis-restructuring-elicitation.md
