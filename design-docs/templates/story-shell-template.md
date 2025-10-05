# Story [Story Number]: [Story Title]

> [!attention] **AI Story Shell Template Instructions**
> **CRITICAL**: This template is for Phase 1 - Story creation without task information
> **CRITICAL**: Instructions for the AI are in callouts using this format: > [!attention] **AI {{task instruction title}}**
> **CRITICAL**: Goals for a document section are in callouts using this format: > [!done] **AI {{section}} Goal**
> **CRITICAL**: Content the AI must populate are in [single brackets]. [Further instructions on how to populate, style, and length of the content are in between the brackets]
> **CRTICAL**: Examples of content are in callouts using this format: > [!example] **AI {{section}} Example**
> **CRTICAL**: All other callouts and text outside of [brackets] are content that should be populated in the final document
>
> **Prime Directive #1: Architectural Context First.** Gather complete C4 architectural context before creating story content. Every technical detail must be supported by citations to architecture documents.
>
> **Prime Directive #2: Citation Integrity.** All architectural references must be validated using citation manager before story completion. Use natural language integration for citations wherever possible.
>
> **Prime Directive #3: Story Focus.** Focus on user value and acceptance criteria derived from epic requirements. Avoid implementation details in this phase.
>
> **Prime Directive #4: Agent Preparation.** Structure Dev Notes to provide complete context for subsequent task generation phases.

**Critical LLM Initialization Instructions**: When first reading this file, you MUST IMMEDIATELY run citation manager to extract base paths: `npm run citation:base-paths <this-file-path> -- --format json`. Read ALL discovered base path files to gather complete architectural context before proceeding.

## Phase 1 Progress Tracking

> [!attention] **AI Phase 1 Progress Instructions:**
> Update this section as you complete each step of Phase 1 story creation.

- [ ] **Step 1**: **CRITICAL** Gather all required files
	- [ ] Requirements document that contains epics and user stories
	- [ ] Requirements architecture document
	- [ ] Citation guidelines document
- [ ] **Step 2**: Extract story definition and acceptance criteria from PRD
- [ ] **Step 3**: Populate architectural context (Dev Notes)
	- [ ] Architectural Context (C4)
	- [ ] Technical Details
	- [ ] Design Principles Adherence
	- [ ] Previous Story Insights
- [ ] **Step 4**: Define testing requirements
	- [ ] Test Framework and Strategy
	- [ ] Required Test Implementation
- [ ] **Step 5**: Validate all citations using citation manager

## Status
[Current status: Draft | In Progress | Ready for Review | Complete]

> [!done] **AI Story Definition Goal**
> **Extract Story from Epic Requirements**
> Copy the story definition and acceptance criteria EXACTLY from the epic source document. Focus on user value and business outcomes.
> > [!attention] **AI Story Definition Instructions:**
> > - GIVEN a story from an epic/PRD, WHEN creating the story THEN copy the epic's story statement and acceptance criteria EXACTLY
> > - Use the standard "As a... I want... so that..." format
> > - Preserve original acceptance criteria with anchor references
> > - Include epic source citation for traceability

## Story

**As a** [user role],
**I want** [capability or feature],
**so that** [business value or benefit].

_Source: [Epic Name]([link to epic file]#[story section])_

> [!example] **AI Story Definition Example**
> **As a** Technical PM,
> **I want** the system to automatically detect the binary's version and create a corresponding versioned directory,
> **so that** analysis artifacts are organized systematically without manual intervention.
>
> _Source: [Epic 1 Stories](../epics/epic-1-workspace-scaffolding.md#Story%201-1)_

## Acceptance Criteria

> [!attention] **AI Acceptance Criteria Instructions:**
> - Copy the epic's acceptance criteria EXACTLY with original anchor references
> - Each criterion should be independently verifiable
> - Use EARS based language (WHEN..., THEN ... SHALL; IF ..., THEN ..., SHALL; etc.)
> - Maintain original numbering from epic source

1. [Acceptance criterion from epic with original anchor] ^US[story-number]AC1
2. [Second criterion from epic with original anchor] ^US[story-number]AC2
3. [Additional criteria following same pattern...] ^US[story-number]AC[number]

_Source: [Epic Name]([link to epic file]#[acceptance criteria section])_

> [!example] **AI Acceptance Criteria Example**
> 1. WHEN the `Code Processing Application` starts, THEN the system SHALL extract the version number from the source binary. ^US1-1AC1
> 2. IF a directory for the extracted version does not exist, THEN the system SHALL create it. ^US1-1AC2
> 3. IF version detection fails, THEN the system SHALL log the failure AND create a new directory using a unique identifier. ^US1-1AC3
>
> _Source: [Epic 1 Stories](../epics/epic-1-workspace-scaffolding.md#Story%201-1%20Acceptance%20Criteria)_

## Tasks / Subtasks

> [!attention] **AI Tasks Section Instructions:**
> **CRITICAL**: This section should remain EMPTY in Phase 1. Tasks will be populated in Phase 2.
> Leave placeholder text indicating Phase 2 dependency.

_Tasks will be generated in Phase 2 using the task generation prompt._

## Dev Notes

> [!done] **AI Dev Notes Goal**
> **Package Complete Architectural Context**
> Gather and organize all architectural information needed for task generation in subsequent phases. Every technical detail must include proper citations.

### Architectural Context (C4)

> [!attention] **AI Architectural Context Instructions:**
> - Use C4 methodology
> - Reference specific, specific impacted system context, containers, and components architecture documents
> - Link to implementation guides
> - Use proper C4 component notation (Container.Component)

- **Components Affected**:
  - [`[Container Name].[Component Name]`]([link to architecture doc component section]) - [Brief description of component role]
  - [`[Another Container].[Another Component]`]([link to architecture doc component section]) - [Brief description of component role]
- **Implementation Guides**:
  - [[Component Name] Implementation]([link to implementation guide]) - [Brief description of component's implementation guidance]
  - [[Another Component] Implementation]([link to implementation guide]) - [Brief description of implementation guidance]

> [!example] **AI Architectural Context Example**
> - **Components Affected**:
>   - [`Code Processing Application.SetupOrchestrator`](../architecture/components.md#SetupOrchestrator) - Main orchestration entry point for automated workflow
>   - [`Code Processing Application.DirectoryManager`](../architecture/components.md#DirectoryManager) - Directory lifecycle management with rollback capabilities
> - **Implementation Guides**:
>   - [SetupOrchestrator Implementation](../implementation-guides/setup-orchestrator.md) - Version detection and workflow coordination patterns
>   - [DirectoryManager Implementation](../implementation-guides/directory-manager.md) - Atomic operations and rollback strategies

### Technical Details

> [!attention] **AI Technical Details Instructions:**
> - Extract ONLY information directly relevant to implementing the current story
> - Specify exact file paths for implementation (mark as PROPOSED for new files)
> - Reference technology stack from architecture document with links
> - Include all dependencies and technical constraints
> - Note any integration requirements

- **File Locations**:
  - Primary component: `[file-path]` ([PROPOSED | EXISTING]) - [Brief description of file's role]
  - Helper component: `[file-path]` ([PROPOSED | EXISTING]) - [Brief description of file's role]
- **Technology Stack**: [Referenced technologies from architecture doc with links]
- **Dependencies**: `[list of dependencies from architecture docs]`
- **Technical Constraints**:
  - [Constraint 1 with reference to architecture principle or implementation guide]
  - [Constraint 2 with reference to architectural decision]
  - [Integration requirement with reference to architectural documentation]

> [!example] **AI Technical Details Example**
> - **File Locations**:
>   - Primary component: `src/scripts/setupOrchestrator.js` (PROPOSED) - Main workflow orchestration entry point
>   - Helper component: `src/scripts/pre-process/directoryManager.js` (PROPOSED) - Directory operations with atomic rollback
> - **Technology Stack**: [Node.js ≥18](../architecture/tech-stack.md#Runtime), [ES6 Classes](../architecture/coding-standards.md#Module%20System)
> - **Dependencies**: `child_process`, `fs`, `path`, [shared logger component](../architecture/components.md#Logger)
> - **Technical Constraints**:
>   - [ES6 class architecture per implementation guides](../implementation-guides/coding-patterns.md#Class%20Structure)
>   - [All logging must use shared logger.js](../architecture/integration-rules.md#Logging%20Standards)
>   - [Atomic operations required for directory management](../implementation-guides/directory-manager.md#Atomic%20Operations)

### Design Principles Adherence

> [!attention] **AI Design Principles Instructions:**
> - Reference specific design principles from the project's Design Principles document
> - Organize into Critical Principles and Anti-Patterns to Avoid
> - Include implementation guidance for each principle
> - Focus on principles most relevant to this story's implementation

This story must adhere to the following [Design Principles]([link to design principles doc]):

**Critical Principles:**
- [**[Principle Name]**]([link to principle definition]) ([Category]): [How this principle applies to the story implementation]
- [**[Another Principle]**]([link to principle definition]) ([Category]): [Application guidance for this story]

**Anti-Patterns to Avoid:**
- [**[Anti-Pattern Name]**]([link to anti-pattern definition]): [Specific guidance for avoiding this anti-pattern in this story]

**Implementation Guidance:**
- [Specific implementation guidance item 1]
- [Specific implementation guidance item 2]

> [!example] **AI Design Principles Example**
> **Critical Principles:**
> - [**Atomic Operations**](../design-principles.md#Atomic%20Operations) (Safety-First): Directory creation process must be atomic with complete rollback on failure
> - [**Dependency Abstraction**](../design-principles.md#Dependency%20Abstraction) (Modular): Components depend on abstractions (interfaces) not concrete implementations
>
> **Anti-Patterns to Avoid:**
> - [**Hidden Global State**](../design-principles.md#Hidden%20Global%20State): Keep all state explicit in component constructors and method parameters
>
> **Implementation Guidance:**
> - Version parsing logic must be deterministic and predictable
> - Error recovery must be graceful with meaningful context

### Previous Story Insights

> [!attention] **AI Previous Story Insights Instructions:**
> - Reference learnings from previous stories in the same epic
> - Note any dependencies or prerequisites from earlier stories
> - Include any course corrections or lessons learned
> - If no previous stories exist, state clearly

[Summary of insights from previous stories, dependencies, and lessons learned. If no previous stories: "No previous stories - this is the first story in Epic [number]"]

> [!example] **AI Previous Story Insights Example**
> **Dependencies from Story 1.0:** Workspace scaffolding must be complete before version detection can be implemented.
> **Lesson Learned:** Mock binary approach from Story 1.0 testing strategy should be reused for version detection testing.
> **Course Correction:** Story 1.0 revealed that dependency injection pattern is critical for testability - apply same pattern here.

### Testing

> [!attention] **AI Testing Instructions:**
> - Reference testing strategy from architecture document with links
> - Specify exact test framework and approach from architecture
> - Include detailed test implementation requirements based on story acceptance criteria
> - Provide testing guidance for the specific components being implemented

- **Test Framework**: [Framework name with link to architecture doc] - [Brief description]
- **Test Strategy**: [Strategy description with links to architecture doc sections]
- **Test Location**: [Where tests should be created based on architecture standards]

#### Required Test Implementation

> [!attention] **AI Required Test Instructions:**
> - Create test specifications that directly validate acceptance criteria
> - Include both happy path and error scenario tests
> - Reference specific acceptance criteria for each test
> - Provide technical implementation guidance

##### 1. [Primary Test Name] ([Test Type])
- **Purpose**: [What this test validates from acceptance criteria]
- **Acceptance Criteria**: [Reference to specific AC this test validates]
- **Implementation Guidance**: [Technical details for implementing this test]

##### 2. [Error Scenario Test Name] ([Test Type])
- **Purpose**: [What error scenario this test validates]
- **Acceptance Criteria**: [Reference to specific AC this test validates]
- **Implementation Guidance**: [Technical details for implementing this test]

> [!example] **AI Required Test Example**
> ##### 1. Version Detection Integration Test (Integration Test)
> - **Purpose**: Verify that when a version is detected, the correct directory is created
> - **Acceptance Criteria**: Validates [[#^US1-1AC1|AC1]] and [[#^US1-1AC2|AC2]]
> - **Implementation Guidance**: Set up mock binary, run orchestrator, assert directory creation
>
> ##### 2. Version Detection Failure Test (Error Scenario)
> - **Purpose**: Verify system handles version detection failure gracefully
> - **Acceptance Criteria**: Validates [[#^US1-1AC3|AC3]]
> - **Implementation Guidance**: Mock binary failure, verify fallback directory creation

### Agent Workflow Sequence

> [!attention] **AI Agent Workflow Instructions:**
> - Define the recommended sequence of agent usage for task implementation
> - Specify what each agent should focus on based on their capabilities
> - Include validation and quality gates between agent handoffs
> - Reference the agents available in the system

## Change Log

> [!attention] **AI Change Log Instructions:**
> Always include the initial creation entry. Additional entries will be added as the story evolves through phases.

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| [YYYY-MM-DD] | 1.0 | Initial story creation (Phase 1) | [Agent Name] |
| | | | |

## Development Agent Record

> [!attention] **AI Development Agent Record Instructions:**
> This section is intentionally left blank in Phase 1 and will be populated by agents during implementation phases to track their work.

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
> This section is intentionally left blank in Phase 1 and will be populated by the QA validation agent after implementation to document test results and validation outcomes.

[Results from QA Agent review will be populated here after implementation]
## Phase 1 Completion Checklist

> [!attention] **AI Phase 1 Completion Instructions:**
> Before proceeding to Phase 2, verify all items are complete:

- [ ] **Story Definition**: Copied exactly from epic with proper citation
- [ ] **Acceptance Criteria**: Copied exactly from epic with anchor references
- [ ] **Architectural Context**: All affected components identified with citations
- [ ] **Technical Details**: File paths, dependencies, and constraints documented
- [ ] **Design Principles**: Relevant principles identified and application guidance provided
- [ ] **Testing Requirements**: Framework and test specifications defined
- [ ] **Agent Workflow**: Recommended agent sequence documented
- [ ] **Citation Validation**: All architectural references validated using citation manager
- [ ] **Phase 1 Progress**: All progress tracking items marked complete

**Phase 1 Ready for Phase 2**: [ ] (Check when all above items complete)

## Next Phase

When Phase 1 is complete, proceed to Phase 2 using the [task generation prompt](../prompts/phase-2-task-generation-prompt.md) to create high-level tasks based on the architectural context gathered in this phase.
