# Citation Guidelines

This document establishes the standard formats for creating citations and references in user stories, PRD documents, and architectural documentation.

## Citation Types

### 1. Within Same Document (Wiki-style Links)
Use wiki-style syntax for references within the same document:

**Format**: `[[#anchor|Display Text]]`

**Examples**:
- `[[#^FR1|FR1]]` - Links to functional requirement FR1 in same document
- `[[#user-authentication|User Authentication]]` - Links to heading anchor

### 2. Cross-Document References (Markdown Links)
Use standard markdown syntax for references to external documents:

**Format**: `[Display Text](path/to/file.md#anchor)`

**Examples**:
- `[Source: architecture/tech-stack.md#database](../architecture/tech-stack.md#database)`
- `[Component Details](../components/auth-service.md#implementation)`
- `[Testing Strategy](../testing-strategy.md#integration-tests)`

## Creating Anchors

### Caret Syntax (For Requirements/Criteria)
Add unique anchors at the end of lines using caret syntax:

```markdown
- FR1: System shall detect CLI version automatically. ^FR1
- AC1: WHEN system starts, THEN version is extracted. ^US1-1AC1
```

### Heading Anchors (For Sections)
Use explicit anchor IDs for section headings:

```markdown
## Database Configuration {#database-config}
### Authentication Service {#auth-service}
```

### Emphasis-Marked Headings (For Architecture Components)
When headings contain markdown markers, include the full formatting in the anchor:

```markdown
### ==**Code Processing Application.SetupOrchestrator**==
```

**Reference format**: `[Component Name](path/to/file.md#==**Full%20Component%20Name**==)`

**Examples**:
- `[SetupOrchestrator](../architecture/arch-level-3-components.md#==**Code%20Processing%20Application.SetupOrchestrator**==)`
- `[DirectoryManager](../architecture/arch-level-3-components.md#==**Code%20Processing%20Application.DirectoryManager**==)`

Note: Use URL encoding for spaces (%20) and maintain all emphasis markers in the anchor.

## Usage in Story Creation

### Dev Notes Section
When referencing architecture documents in story Dev Notes, use markdown links:

```markdown
## Dev Notes

### Architectural Context (C4)
- **Components Affected**: [Auth Service](../architecture/components.md#auth-service), [Database Layer](../architecture/components.md#database)
- **Implementation Guides**: [API Standards](../architecture/api-standards.md#rest-endpoints)

### Technical Details
- **Data Models**: [User Schema](../architecture/data-models.md#user-schema)
- **Testing Requirements**: [Integration Test Strategy](../architecture/testing-strategy.md#integration-tests)
```

### Story Cross-References
When linking between stories or to requirements, use appropriate format:

**Same epic/document**: `[[#^US1-1AC1|AC1]]`
**Different documents**: `[Epic 2 Story 1](../epic-2-stories.md#story-2-1)`

## Best Practices

1. **Always Include Source References**: Every technical detail must cite its source document
2. **Use Descriptive Link Text**: Avoid generic "here" or "link" text
3. **Verify Links Work**: Test that anchors exist in target documents
4. **Consistent Anchor Naming**: Use kebab-case for heading anchors, caret syntax for requirements
5. **Relative Paths**: Use relative paths from the story file location

## @ Import Usage

When using @ imports in workflow files, cite this document as:

```markdown
@../rules/citation-guidelines.md
```

This ensures all workflow participants follow consistent citation standards.
