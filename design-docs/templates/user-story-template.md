# Story [Story Number]: [Story Title]

> [!attention] **AI Master Instruction**
> **CRITICAL**: Instructions for the AI are in callouts using this format: > [!attention] **AI {{task instruction title}}**
> **CRITICAL**: Goals for a document section are in callouts using this format: > [!done] **AI {{section}} Goal**
> **CRITICAL**: Content the AI must populate are in [single brackets]. [Further instructions on how to populate, style, and length of the content are in between the brackets]
> **CRTICAL**: Examples of content are in callouts using this format: > [!example] **AI {{section}} Example**
> **CRTICAL**: All other callouts and text outside of [brackets] are content that should be populated in the final document
>
> **Prime Directive #1: Atomic Deliverables.** Each task must be a complete, testable unit that can be validated independently. Focus on creating discrete tasks that deliver working functionality, not just code scaffolding.
>
> **Prime Directive #2: Agent-Centric Design.** Structure tasks to leverage specific agent capabilities. Match task complexity and scope to agent strengths (test-writer for TDD, code-developer for implementation, etc.).
>
> **Prime Directive #3: Implementation Reality.** Balance user story scope with practical delivery constraints. Choose task sequences that teams can successfully execute within project timeline and architecture.
>
> **Prime Directive #4: Test-Driven Flow.** Always lead with failing tests that define behavior before writing implementation code. This ensures clear requirements and validates architectural decisions.

**Critial LLM Initialization Instructions**: When first reading this file, you MUST IMMEDIATELY run citation manager to extract base paths: `npm run citation:base-paths <this-file-path> -- --format json`. Read ALL discovered base path files to gather complete architectural context before proceeding.

## Status
[Current status: Draft | In Progress | Ready for Review | Complete]



## Story
> [!done] **AI Story Definition Goal**
> **Establish Clear User Value and Acceptance Criteria**
> Define the user story in standard format with measurable acceptance criteria that can be validated through testing.
> > [!attention] **AI Story Definition Instructions:**
> > - Use the standard "As a... I want... so that..." format
> > - Create specific, testable acceptance criteria with anchor references (^US[number]AC[number])
> > - Ensure each acceptance criterion can be validated independently
> > - Focus on user value and business outcomes, not technical implementation details

**As a** [user role],
**I want** [capability or feature],
**so that** [business value or benefit].

> [!example] **AI Story Definition Example**
> **As a** Technical PM,
> **I want** the system to automatically detect the binary's version and create a corresponding versioned directory,
> **so that** analysis artifacts are organized systematically without manual intervention.

## Acceptance Criteria

> [!attention] **AI Acceptance Criteria Instructions:**
> - GIVEN a user story from a PRD, WHEN creating the user story for the first time THEN copy the PRD user story's acceptance criteria EXACTLY
> - GIVEN an existing user story file, WHEN adding new acceptance criteria THEN follow the instructions below:
> - Use anchor references like ^US[story-number]AC[criteria-number]
> - Focus on observable behaviors and outcomes
> - Include both happy path and error scenarios
> - Each criterion should be independently verifiable
> - Use EARS based language (WHEN..., THEN ... SHALL; IF ..., THEN ..., SHALL; etc. Source: /Users/wesleyfrederick/Documents/ObsidianVaultNew/Technical KnowledgeBase/EARS (Easy Approach to Requirements Syntax))

1. WHEN [trigger condition], THEN the system SHALL [expected behavior]. ^US[story-number]AC1
2. IF [condition], THEN the system SHALL [expected behavior]. ^US[story-number]AC2
3. [Additional criteria following same pattern...] ^US[story-number]AC[number]

> [!example] **AI Acceptance Criteria Example**
> 1. WHEN the `Code Processing Application` starts, THEN the system SHALL extract the version number from the source binary. ^US1-1AC1
> 2. IF a directory for the extracted version does not exist, THEN the system SHALL create it. ^US1-1AC2
> 3. IF version detection fails, THEN the system SHALL log the failure AND create a new directory using a unique identifier. ^US1-1AC3

## Tasks / Subtasks


## Dev Notes

> [!done] **AI Dev Notes Goal**
> **Provide Complete Technical Context**
> Establish all technical context, constraints, and guidance needed for successful implementation.

### Architectural Context (C4)

> [!attention] **AI Architectural Context Instructions:**
> - Reference specific components from the architecture document
> - Link to implementation guides for affected components
> - Use proper C4 component notation (Container.Component)

- **Components Affected**:
  - [`[Container Name].[Component Name]`]([link to architecture doc component section])
  - [`[Another Container].[Another Component]`]([link to architecture doc component section])
- **Implementation Guides**:
  - [[Component Name] Implementation]([link to implementation guide]) - [Brief description of component's role]
  - [[Another Component] Implementation]([link to implementation guide]) - [Brief description of component's role]

### Technical Details

> [!attention] **AI Technical Details Instructions:**
> - Specify exact file paths for implementation
> - Reference technology stack from architecture document
> - Include all dependencies and constraints
> - Note any integration requirements

- **File Locations**:
  - Primary component: `[file-path]` ([PROPOSED | EXISTING])
  - Helper component: `[file-path]` ([PROPOSED | EXISTING])
- **Technology Stack**: [Referenced from architecture doc with links]
- **Dependencies**: `[list of dependencies]`
- **Technical Constraints**:
  - [Constraint 1 with reference to architecture principle]
  - [Constraint 2 with reference to implementation guide]
  - [Integration requirement with reference to architectural decision]

### Design Principles Adherence

> [!attention] **AI Design Principles Instructions:**
> - Reference specific design principles from the project's Design Principles document
> - Organize into Critical Principles and Anti-Patterns to Avoid
> - Include implementation guidance for each principle

This story must adhere to the following [Design Principles]([link to design principles doc]):

**Critical Principles:**
- [**[Principle Name]**]([link to principle definition]) ([Category]): [How this principle applies to the story implementation]
- [**[Another Principle]**]([link to principle definition]) ([Category]): [Application guidance]

**Anti-Patterns to Avoid:**
- [**[Anti-Pattern Name]**]([link to anti-pattern definition]): [Specific guidance for avoiding this anti-pattern]

**Implementation Guidance:**
- [Specific implementation guidance item 1]
- [Specific implementation guidance item 2]

### Previous Story Insights

> [!attention] **AI Previous Story Insights Instructions:**
> - Reference learnings from previous stories in the same epic
> - Note any dependencies or prerequisites
> - Include any course corrections or lessons learned

[Summary of insights from previous stories or "No previous stories - this is the first story in Epic [number]"]

### Testing

> [!attention] **AI Testing Instructions:**
> - Reference testing strategy from architecture document
> - Specify exact test framework and approach
> - Include detailed test implementation requirements
> - Provide mock/fixture implementation guidance

- **Test Framework**: [Framework name with link to architecture doc] - [Brief description]
- **Test Strategy**: [Strategy description with links to architecture doc sections]
- **Test Location**: [Where tests should be created]

#### Required Test Implementation

##### 1. [Primary Test Name] ([Test Type])
- **Purpose**: [What this test validates]
- **Steps**:
  1. [Step 1 with technical details]
  2. [Step 2 with technical details]
  3. **Assert** [Expected outcome] (verifies [AC references])

##### 2. [Secondary Test Name] ([Test Type])
- **Purpose**: [What this test validates]
- **Steps**:
  1. [Step 1]
  2. **Assert** [Expected outcome] (verifies [AC references])

#### [Mock/Fixture] Implementation Details

[Detailed technical guidance for implementing test fixtures, mocks, or test utilities]

### Agent Workflow Sequence

> [!attention] **AI Agent Workflow Instructions:**
> - Define the recommended sequence of agent usage
> - Specify what each agent should focus on
> - Include validation and quality gates

**Implementation should follow this agent workflow:**

1. **Setup Phase** (`test-writer` agent):
   - [Specific responsibilities for test-writer]
2. **Core Implementation** (`code-developer-agent` agent):
   - [Specific responsibilities for code-developer]
3. **Integration Validation** (`application-tech-lead` agent):
   - [Specific responsibilities for tech lead review]
4. **Final Testing** (`qa-validation` agent):
   - [Specific responsibilities for QA validation]

## Change Log

> [!attention] **AI Change Log Instructions:**
> Always include the initial creation entry. Additional entries will be added as the story evolves.

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| [YYYY-MM-DD] | 1.0 | Initial story creation | [Author Name] |
| | | | |

## Development Agent Record
[This section will be populated by the development agent during implementation]

> [!attention] **AI Development Agent Record Instructions:**
> This section is intentionally left blank and will be populated by agents during implementation to track their work.

### Agent Model Used
[Record the specific AI agent model and version used for development. To be filled by development agent]

### Debug Log References
[Reference any debug logs or traces generated during development. To be filled by development agent]

### Completion Notes List
[Notes about the completion of tasks and any issues encountered. To be filled by development agent]

### File List
[List all files created, modified, or affected during story implementation. To be filled by development agent]

## QA Results
> [!attention] **AI QA Results Instructions:**
> This section is intentionally left blank and will be populated by the QA validation agent after implementation to document test results and validation outcomes.

[Results from QA Agent review will be populated here after implementation]

