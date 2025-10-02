# [Product Name] Requirements Document

> [!ai-master-instruction] **PRODUCT MANAGER AI BEHAVIORAL MODEL**
>
> **Your Persona:** You are an analytical, inquisitive, data-driven Product Manager. You champion the user while making strategic, outcome-focused decisions.
>
> **Prime Directive #1: Always Ask "Why" First.** Before documenting any requirement, investigate the root cause and user value. The "what" flows from understanding the "why."
>
> **Prime Directive #2: MVP Focus.** Ruthlessly prioritize. Every requirement should be essential for delivering core user value. Challenge scope creep immediately.
>
> **Prime Directive #3: Data-Informed Decisions.** Support all product decisions with user research, analytics, or clear strategic reasoning. Avoid feature wishlist thinking.
>
> **Prime Directive #4: Clear Communication.** Use precise, unambiguous language. Write for developers, stakeholders, and future team members who need to execute this vision.
>
> **Prime Directive #5: Citation-Backed Claims.** Every technical detail, architectural decision, user research finding, or strategic assertion MUST cite its source document using validated links. Follow @../agentic-workflows/rules/citation-guidelines.md for proper citation format. Never create unverified links - confirm target documents and anchors exist before referencing them.
<!-- -->
> [!danger] **Critial LLM Initialization Instructions**
> When first reading this file, you MUST IMMEDIATELY run citation manager to extract base paths: `npm run citation:base-paths <this-file-path> -- --format json`. Read ALL discovered base path files to gather complete architectural context before proceeding.

## Introduction

> [!ai-objective] **Goal: Frame the Problem and Solution Context.** Establish the business case and user impact before diving into requirements. Focus on the "why" behind this feature.
>
> [!ai-prompt-guidance] **Key Questions to Address:**
> - What specific user or business problem does this solve?
> - What's the current pain point or missed opportunity?
> - How does this solution approach address the core issue?
> - What's the expected business/user impact?

**[2-3 sentences: Problem + Solution + Impact]**

[Sentence 1: Problem statement with current friction/pain. Sentence 2: High-level solution approach. Sentence 3: Expected business/user impact.]

**Example:** "This feature implements version-based analysis repository restructuring with automation to organize Claude Code analyses by version number while eliminating manual binary handling friction. The feature addresses the current flat directory structure that cannot accommodate multiple versions and automates the time-consuming manual steps of binary location, movement, and beautification that currently waste 15-20 minutes per analysis cycle."

## Goals

> [!ai-objective] **Goal: Establish Foundation and Project Brief Connection.** Ensure proper project foundation exists before defining detailed requirements.
>
> [!ai-prompt-guidance] **Foundation Check:**
> - Ask if Project Brief document is available in chat window
> - If NO Project Brief exists, STRONGLY recommend creating one first using template
> - If user insists on PRD without brief, gather this information during Goals section
> - If Project Brief exists, review and use it to establish Goals and Background Context

**[3-5 bullet points: Desired outcomes and project objectives]**

- [Specific user outcome this PRD will enable]
- [Business capability this feature will deliver]
- [Technical or process improvement goal]
- [Strategic advantage or foundation goal]

## Background Context

> [!ai-prompt-guidance] **Context Establishment:** 1-2 short paragraphs summarizing what we learned in the brief, what and why this solves a problem, current landscape or need.

**[1-2 paragraphs: Problem context + Current landscape]**

[Paragraph 1: Current situation, problem context, and why this matters now]

[Paragraph 2: What we learned from research/brief, current landscape or existing solutions, gaps that need addressing]

## Alignment with Product Vision

> [!ai-objective] **Goal: Connect Feature to Strategy.** Demonstrate how this feature advances broader product goals and business objectives.
>
> [!ai-prompt-guidance] **Validation Questions:**
> - How does this support our core product strategy?
> - Which business metrics will this impact?
> - What portfolio/competitive advantages does this create?
> - Why is this the right priority now?

**[4-5 bullet points: Strategy + Metrics + Advantages + Timing]**

This feature directly supports the [Product Name] goals outlined in the [Reference Document]:
- **[Strategic Goal 1]**: [How this feature advances that goal]
- **[Strategic Goal 2]**: [Specific capability this enables]
- **[Strategic Goal 3]**: [Workflow or efficiency improvement]
- **[Strategic Goal 4]**: [Foundation for future capabilities]

**Example:**
- **Portfolio Development**: Demonstrates systematic version management approach for job applications
- **Analysis Capability**: Enables historical comparison across Claude Code versions for architectural evolution tracking
- **Workflow Efficiency**: Eliminates manual friction that interrupts the core 5-phase analysis pipeline
- **Future Features Foundation**: Establishes infrastructure for planned Merkle tree/hash-based incremental updates

## Changelog

> [!ai-prompt-guidance] **Version Tracking:** Track document versions and changes for stakeholder alignment and project history.

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| [YYYY-MM-DD] | 1.0 | Initial PRD creation | [Author Name] |
| | | | |

## Requirements

> [!ai-objective] **Goal: Define Testable, User-Focused Requirements.** Every requirement should trace back to user value and be verifiable through testing.
>
> [!ai-prompt-guidance] **Requirements Quality Check:**
> - Can this requirement be tested? How?
> - Does this requirement deliver user value? Which user and how?
> - Is the language precise and unambiguous?
> - Are error cases and edge scenarios covered?

### Functional Requirements
> [!ai-prompt-example] **Use action-oriented language:** "System SHALL detect version from binary metadata" vs "System should handle versions"
>
**[8-12 requirements: Core flow + Error cases + Edge scenarios]**

- FR1: [Action-oriented requirement with specific outcome] ^FR1
- FR2: [Error handling requirement for main flow failure] ^FR2
- FR3: [Edge case or validation requirement] ^FR3
- FR4: [Integration or dependency requirement] ^FR4
- FR5: [User feedback or progress indication requirement] ^FR5

**Examples:**
- FR1: On start of the **Code Processing Application**, automatically detect the installed Claude Code CLI version from the source binary. ^FR1
- FR2: If the detected version directory does not exist, create `/claude-code-analysis/v{version}/`, copy the binary as `cli.js`, and establish the organized directory structure. ^FR2
- FR3: If version detection fails, log the failure and continue using a unique identifier (e.g., datetime/hash) to isolate artifacts. ^FR3

### Non Functional Requirements
> [!ai-prompt-example] **Include specific metrics:** "Automation SHALL complete in ≤2 minutes" vs "System should be fast"
>
**[5-8 requirements: Performance + Security + Usability + Architecture]**

- NFR1: [Performance requirement with specific timing/throughput] ^NFR1
- NFR2: [Security or data protection requirement] ^NFR2
- NFR3: [Usability or user experience standard] ^NFR3
- NFR4: [Technical architecture or design principle] ^NFR4
- NFR5: [Error handling or resilience requirement] ^NFR5

**Examples:**
- NFR1: Follow Single Responsibility—separate, testable modules for version detection, binary management, and directory organization. ^NFR1
- NFR2: Use modular design with clear interfaces and minimal coupling to existing pipeline scripts. ^NFR2
- NFR3: Automation must complete in ≤2 minutes and must not materially impact Q&A response times or overall processing benchmarks. ^NFR3

## Epic List

> [!ai-objective] **Goal: Group Features for Maximum Value Delivery.** Each epic should represent a cohesive set of capabilities that can be delivered independently.
>
> [!ai-prompt-guidance] **Epic Breakdown Questions:**
> - Can this epic deliver value on its own?
> - Is this epic small enough to complete in 2-5 sprints?
> - Does this epic group related user capabilities?
> - Could stakeholders understand and approve this epic independently?
>
> If there are more than 5 epics, suggest to the user the requirements be broken up into multiple features. Try to decompose the feature down into manageable epics that follow the guidance above.

**[2-5 epics maximum: Each with 1-sentence value description]**

- **Epic 1: [Epic Name]:** [Brief description of the epic's purpose and value]
- **Epic 2: [Epic Name]:** [Brief description of the epic's purpose and value]

> _Rationale_: [1-2 sentences explaining why you chose this epic breakdown and any alternatives considered]

**Examples:**
- **Epic 1: Automated Analysis Restructuring & Processing:** Establish the automated backend process for detecting the Claude Code CLI version, creating a version-specific directory structure, and preparing the binary for analysis to eliminate manual workflow friction.
- **Epic 2: User-Facing Version Selection & Q&A:** Implement a version selection interface within the Q&A application to allow users to easily query different analysis versions, enabling historical comparison.

---

## Epic [Number]: [Epic Name]

> [!ai-objective] **Goal: Define Epic Value and Scope.** Clearly articulate what this epic accomplishes and why it matters to users.

**[1-2 sentences: What this epic accomplishes and its core value]**

[Epic description explaining what this epic accomplishes and why it matters to users]

### Epic [Number] Scope
[1-2 sentences: What this epic covers and its boundaries, i.e. Create the foundational `CC Workflows` workspace and migrate the entire existing `citation-manager` tool into it.]

### Epic [Number] Goal
[1 sentence: The primary goal this epic achieves, i.e. Establish shared infrastructure (testing, linting, builds) and prove that a complex, existing tool can operate within it successfully.]

### Epic [Number] Objectives
> [!ai-prompt-example] **Be specific:** "Reduce manual file operations from 15-20 minutes to zero" vs "Improve efficiency"
>
**[3 bullet points: Specific, measurable outcomes]**
- [Specific objective with measurable outcome]
- [Capability or automation this epic enables]
- [Technical or user experience improvement]

**Example:**
- Automatically detect the Claude Code CLI's version
- Create a version-specific directory structure
- Prepare the binary for the existing analysis pipeline

### Improvement vs. Baseline
> [!ai-prompt-guidance] **Show clear contrast:** New capability **vs.** current limitation/pain point
>
**[1 bullet point: Clear before/after comparison]**
- [New automated capability] **vs.** [current manual process/limitation]

**Example:**
- Automates code processing **vs.** user manually processing code

### User Value
> [!ai-prompt-guidance] **Focus on user impact:** What specific benefits will users experience? How will their workflow change?
>
**[3 bullet points: Specific user benefits with impact]**
- [Time savings or efficiency gain with specific metrics]
- [Quality improvement or error reduction]
- [Capability enablement or workflow enhancement]

**Example:**
- Eliminates 15-20 minutes of frustrating manual work per analysis cycle
- Improves overall workflow efficiency
- Reduces the potential for human error

---

### Story [Epic#].[Story#]: [Story Name]

> [!ai-objective] **Goal: Define Valuable, Testable User Capabilities.** Each story should deliver specific user value and be independently testable.
>
> [!ai-prompt-guidance] **Story Quality Check:**
> - Does this story deliver value on its own?
> - Can this be completed in one sprint?
> - Are the acceptance criteria testable?
> - Is the "so that" clause compelling and user-focused?

**As a** [user role/persona],
**I want** [capability or feature],
**so that** [business value or outcome].

**Example:**
**As a** Technical PM,
**I want** the system to automatically detect the binary's version and create a corresponding versioned directory,
**so that** analysis artifacts are organized systematically without manual intervention.

#### Acceptance Criteria
> [!ai-prompt-example] **Use WHEN/THEN format:** "WHEN user starts application, THEN system SHALL detect CLI version" vs "System detects version"
>
**[4-5 criteria: Core behavior + Error cases + Edge scenarios]**
1. WHEN [trigger condition], THEN the system SHALL [expected behavior]. ^US[Epic#]-[Story#]AC1
2. IF [condition], THEN the system SHALL [behavior] AND [additional behavior]. ^US[Epic#]-[Story#]AC2
3. The system SHALL [validation or error handling requirement]. ^US[Epic#]-[Story#]AC3
4. [Integration or logging requirement]. ^US[Epic#]-[Story#]AC4

**Examples:**
1. WHEN the `Code Processing Application` starts, THEN the system SHALL extract the version number from the source binary. ^US1-1AC1
2. IF a directory for the extracted version does not exist, THEN the system shall create it. ^US1-1AC2
3. IF version detection fails, THEN the system SHALL log the failure AND create a new directory using a unique identifier. ^US1-1AC3

_Depends On_: [List story dependencies or "None"]
_Functional Requirements_: [[#^FR1|FR1]], [[#^FR2|FR2]]
_Non-Functional Requirements_: [[#^NFR1|NFR1]]

---

## MVP Validation Approach

> [!ai-objective] **Goal: Define Success Criteria Upfront.** Establish how you'll know the feature works and delivers value before building it.
>
> [!ai-prompt-guidance] **Validation Questions:**
> - How will you measure user adoption and satisfaction?
> - What metrics indicate the feature solves the core problem?
> - What would "success" look like to stakeholders?
> - How will you validate that requirements are met?

**[2-3 success criteria: User validation + Functional validation]**

The success of this feature will be validated through:

- **[Functional Success]**: [Specific operational criteria that proves the feature works end-to-end]
- **[User Success]**: [Specific user experience criteria that proves value delivery]

**Examples:**
- **Automation Success**: The feature is considered successful when a new version analysis can be completed end-to-end—from detecting the new binary to having artifacts ready for the Q&A app—with zero manual file operations (locating, moving, formatting).
- **Functional Success**: The feature is considered successful when the user can select any available analysis version and receive an accurate Q&A response, and can also successfully generate a text-based `diff` between any two versions as specified in the requirements.

---

## Out of Scope

> [!ai-objective] **Goal: Prevent Scope Creep.** Explicitly define what's NOT included to maintain MVP focus and set clear expectations.
>
> [!ai-prompt-guidance] **Scope Management:**
> - What features might stakeholders expect but aren't included?
> - What nice-to-have capabilities could derail the MVP?
> - Why are these items excluded? (timeline, complexity, unclear value)
> - When might these items be reconsidered?

**[3-4 categories: Features that stakeholders might expect but aren't included]**

To ensure focus on the core value proposition for the MVP, the following are explicitly out of scope:

- **[Category 1]**: [Description of what's excluded and why it's not essential for MVP]
- **[Category 2]**: [Description of nice-to-have feature that could derail timeline]
- **[Category 3]**: [Description of advanced capability that adds complexity]

**Examples:**
- **Storage Optimization**: This MVP will not include any features for managing disk space, such as pruning or archiving old analysis versions, or deduplicating common code chunks between versions.
- **Advanced Comparison Tools**: The version comparison feature is limited to a text-based `diff` output in the terminal. Graphical user interface (GUI) diffing tools and semantic code analysis of changes are not included.
- **Automated Triggers**: The automation is designed to be initiated manually by the user. It will not be automatically triggered by file watchers, hooks, or any other file system monitoring.

---

## Related Links

> [!ai-prompt-guidance] **Documentation Traceability:** Link to supporting docs that provide context, research, or technical details that informed this PRD.

- [Document Title](path/to/document.md) - [Brief description of how this document relates to the PRD]
- ... repeat for all relevant links
