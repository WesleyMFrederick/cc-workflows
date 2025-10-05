---
type: task
task-name: create-next-story
description: Identify and prepare comprehensive, self-contained user story for developer implementation
required-inputs:
  - name: config-file
    path: agentic-workflows/config.yaml
    description: 'Project agentic workflows configuration file'
    validation: file-exists
imports:
  - '@../rules/citation-guidelines.md'
---

# Create Next Story Task

## Purpose

Identify the next logical story and prepare a comprehensive, self-contained story file with complete technical context for developer implementation.

## What It Does

1. ~~**Loads configuration** and identifies the next story to create~~
2. **Gathers context** from epic requirements and architecture documents
3. **Generates story** using template with technical details
4. **Validates** story completeness with checklist

## Task Execution

~~**FIRST:** Load `{{required-inputs.config-file.path}}` and extract configuration values.~~

### Phase 1: Identify Next Story

**Story Selection Logic:**

| Condition | Action |
|-----------|--------|
| No stories exist | Start with 1.1 (first story of first epic) |
| Last story incomplete | Alert user, ask to override |
| Epic complete | Ask user which epic to start |
| Normal case | Next sequential story |

~~1. Based on `prdSharded` from config, locate epic files~~
~~1. Check `devStoryLocation` for existing story files~~
1. Apply story selection logic above
2. **NEVER automatically skip to another epic** - user must explicitly choose

### Phase 2: Gather Context

#### 2.1 Epic Requirements and Previous Story Context
- Extract story requirements from the identified epic file
- If previous story exists, review Dev Agent Record sections for insights and lessons learned

#### 2.2 Architecture Context (Using C4 Framework)

The architecture follows the C4 model for systematic navigation:
- **Level 1 (System Context)**: Overall system boundaries and external interactions
- **Level 2 (Containers)**: High-level architecture and technology choices
- **Level 3 (Components)**: Component responsibilities and relationships
- **Level 4 (Code)**: Implementation details and patterns

#### 2.3 Extract Story-Specific Information

Extract ONLY information directly relevant to implementing the current story:

- System Context (if impacted)
- Containers (if impacted)
- Components affected (from C4 Level 3)
- Relevant constraints (from implementation guides)
- File paths and naming conventions
- Testing requirements
- Technical constraints

ALWAYS cite source documents using proper markdown links: `[Source Description](../architecture/{filename}.md#{section})`

##### Citation Rules
@agentic-workflows/rules/citation-guidelines.md

### Phase 3: Generate Story

1. **Load Story Template** from configured template path
2. **Create new story file**: Using `Architecture.Development Workflow` patterns
3. **Populate sections**:
   - Basic information: Title, status (Draft), Story statement, Acceptance Criteria from Epic
   - **Dev Notes**: Package architectural information for developer


#### Dev Notes Section Structure

Package all gathered architectural information:

```markdown
## Dev Notes

### Architectural Context (C4)
- **Components Affected**: [From C4 Level 3]
- **Implementation Guides**: [References to relevant guides]

### Technical Details
- **Data Models**: [User Schema](../architecture/data-models.md#user-schema)
- **API Specifications**: [REST Endpoints](../architecture/api-standards.md#rest-endpoints)
- **File Locations**: [Component Structure](../architecture/project-structure.md#component-layout)
- **Testing Requirements**: [Integration Tests](../architecture/testing-strategy.md#integration-tests)
- **Technical Constraints**: [Implementation Guidelines](../architecture/implementation-guides.md#constraints)

### Previous Story Insights
- [Key learnings from previous story if applicable]
```

**Requirements:**
- Include ONLY information extracted from architecture documents
- Every technical detail MUST include proper markdown link citation: `[Description](../architecture/{filename}.md#{section})`
- If information not found, state: "No specific guidance found in architecture docs"
- Reference implementation guides as constraints, not instructions

### Phase 4: Validate & Report

1. **Review story** for completeness and accuracy
2. **Verify** all source references are included
~~3. **Execute checklist**: `{{config.tasksPath}}/execute-checklist {{config.checklistsPath}}/story-draft-checklist`~~
3. **Save completion summary**:
   - Story created with file path
   - Status: Draft
   - Key technical components included
   ~~- Checklist results~~
   - Next steps for review
