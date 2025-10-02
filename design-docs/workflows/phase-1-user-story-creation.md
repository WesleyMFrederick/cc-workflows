# Phase 1: Create User Story Shell

## Objective
Create a self-contained user story file with complete technical context, ready for task decomposition in Phase 2. This workflow combines the story structure with the execution logic, guiding an agent through context gathering, file creation, and validation.

---
## Execution Checklist
- [ ] **Critical** Gather all required files
	- [ ] Requirements document that contains epics and user stories
	- [ ] Requirements architecture document
	- [ ] Citation guidelines document
	- [ ] 
- [ ] Identify the target user story and file path.
- [ ] Gather all required architectural context and citations.
- [ ] Populate all sections of the user story template below.
- [ ] Create the final user story markdown file.
- [ ] Perform final validation and citation checks. 

---
## Step 1: Identify Next User Story

> [!attention] **AI Story Selection Instructions**
> Determine the next user story to create by following this logic:
> 1. Scan the project's story directory (`design-docs/features/**/user-stories/`) to find existing stories.
> 2. **If no stories exist:** Default to the first story of the first epic (e.g., User Story 1.1).
> 3. **If the last story is incomplete:** Alert the user and ask for confirmation to proceed.
> 4. **If an epic is complete:** Ask the user which epic to start next. **NEVER** automatically skip to a new epic.
> 5. **Default case:** Identify the next sequential story number.
> 6. Determine the final output path for the new story file using the convention: `design-docs/features/{{feature-path}}/user-stories/us{{story-number}}-{{story-title-slug}}.md`

---
## Step 2: Create Story File Content

> [!attention] **AI Content Generation Instructions**
> Use the template below as the complete content for the new user story file you identified in Step 1. You must populate all sections, especially the `## Dev Notes` section, by following the specific context-gathering instructions provided within it.

<user-story-template-content>

> [!done] **AI Story Title Goal**
> Populate the Story Number (e.g., 1.1) and Title from the story identified in Step 1.

# Story [Story Number]: [Story Title]

**Critial LLM Initialization Instructions**: When first reading this file, you MUST IMMEDIATELY run citation manager to extract base paths: `npm run citation:base-paths <this-file-path> -- --format json`. Read ALL discovered base path files to gather complete architectural context before proceeding.

## Status
Draft

## Story
> [!done] **AI Story Definition Goal**
> Populate this section from the relevant Product Requirements Document (PRD). Use the standard "As a... I want... so that..." format.

**As a** [user role],
**I want** [capability or feature],
**so that** [business value or benefit].

## Acceptance Criteria
> [!done] **AI Acceptance Criteria Goal**
> Copy the acceptance criteria **exactly** from the PRD for this user story. Ensure each criterion has a unique anchor reference (e.g., `^US1-1AC1`).

1. WHEN [trigger condition], THEN the system SHALL [expected behavior]. ^US[story-number]AC1
2. IF [condition], THEN the system SHALL [expected behavior]. ^US[story-number]AC2

## Tasks / Subtasks
> [!done] **AI Tasks Goal**
> Leave this section empty. It will be populated in Phase 2.

_[This section will be populated in Phase 2]_

## Dev Notes

> [!attention] **AI Context Gathering Instructions**
> You must populate this entire section by gathering context from the project's architecture documents. Follow the C4 model reading strategy: start with high-level containers, then drill down into specific components and implementation guides relevant to **this story only**. Every technical detail **must** include a markdown citation back to its source document as per `agentic-workflows/rules/citation-guidelines.md`.

### Architectural Context (C4)
- **Components Affected**:
  - `[Populate with links to affected components from the architecture documents]`
- **Implementation Guides**:
  - `[Populate with links to relevant implementation guides]`

### Technical Details
- **File Locations**:
  - `[Specify proposed/existing file paths relevant to the story]`
- **Technology Stack**:
  - `[Reference the tech stack from the architecture doc]`
- **Dependencies**:
  - `[List any key dependencies]`
- **Technical Constraints**:
  - `[List constraints from implementation guides or architecture principles]`

### Design Principles Adherence
> Reference `design-docs/Architecture Principles.md` to identify critical principles and anti-patterns relevant to this story.
**Critical Principles:**
- [**[Principle Name]**]([link-to-principle]): [How this principle applies.]
**Anti-Patterns to Avoid:**
- [**[Anti-Pattern Name]**]([link-to-anti-pattern]): [Guidance on how to avoid it.]

### Previous Story Insights
> Review the "Development Agent Record" from the previous story, if one exists, and summarize any key learnings or course corrections.

[Summary of insights or "No previous stories - this is the first story in Epic [number]"]

### Testing
- **Test Framework**: [Reference from architecture doc]
- **Test Strategy**: [Reference from architecture doc]

#### Required Test Implementation
> Leave this section empty. It will be populated in Phase 2/3.

## Agent Workflow Sequence
**Implementation should follow this agent workflow:**
1. **Setup Phase** (`test-writer` agent)
2. **Core Implementation** (`code-developer-agent`)
3. **Integration Validation** (`application-tech-lead` agent)
4. **Final Testing** (`qa-validation` agent)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-28 | 1.0 | Initial story creation | Application Tech Lead Agent |

## Development Agent Record
_[This section will be populated by development agents during implementation]_

### Agent Model Used
[To be filled by development agent]

### Debug Log References
[To be filled by development agent]

### Completion Notes List
[To be filled by development agent]

### File List
[To be filled by development agent]

## QA Results
_[Results from QA Agent review will be populated here after implementation]_

</user-story-template-content>

---
## Step 3: Final Validation

> [!attention] **AI Validation and Finalization Instructions**
> 1. **Create the File:** Write the populated content from Step 2 to the file path determined in Step 1.
> 2. **Run Citation Check:** After saving the file, execute the citation validator as a final quality gate.
>
>     ```bash
>     npm run citation:validate <path-to-new-story-file.md>
>     ```
>
> 3. **Report Completion:** Output a summary confirming the file was created, its path, and that the citation check passed.
