# Citation Guidelines

This document establishes the standard formats for creating citations and references in user stories, PRD documents, and architectural documentation.

## Citation Types

### 1. Within Same Document (Wiki-style Links)
Use wiki-style syntax for references within the same document:

**Format**: `[[#anchor|Display Text]]`

**Examples**:
- `[[#^FR1|FR1]]` - Links to functional requirement FR1 in same document
- `[[#User%20Authentication|User Authentication]]` - Links to heading anchor

### 2. Cross-Document References (Markdown Links)
Use standard markdown syntax for references to external documents:

**Format**: `[Display Text](path/to/file.md#anchor)`

**Examples**:
- `[Source: architecture/tech-stack.md#Database](../architecture/tech-stack.md#Database)`
- `[Component Details](../components/auth-service.md#Implementation)`
- `[Testing Strategy](../testing-strategy.md#Integration%20Tests)`

## Creating Anchors

### Caret Syntax (For Requirements/Criteria)
Add unique anchors at the end of lines using caret syntax:

```markdown
- FR1: System shall detect CLI version automatically. ^FR1
- AC1: WHEN system starts, THEN version is extracted. ^US1-1AC1
```

### Heading Anchors (For Sections)
Reference headings using their exact text with URL encoding:

```markdown
## Database Configuration
### Authentication Service
```

**Reference format**: Use the exact heading text with URL encoding:
- `[Database Configuration](file.md#Database%20Configuration)`
- `[Authentication Service](file.md#Authentication%20Service)`

### Emphasis-Marked Headings (For Architecture Components)
When headings contain markdown markers, include the full formatting in the anchor:

```markdown
### ==**Code Processing Application.SetupOrchestrator**==
```

**Reference format**: `[Component Name](path/to/file.md#==**Full%20Component%20Name**==)`

**Examples**:
- `[SetupOrchestrator](../architecture/arch-level-3-components.md#==**Code%20Processing%20Application%2ESetupOrchestrator**==)`
- `[DirectoryManager](../architecture/arch-level-3-components.md#==**Code%20Processing%20Application%2EDirectoryManager**==)`

### URL Encoding Rules for Anchors

When referencing heading anchors, always preserve the original heading text with proper URL encoding:

- **Spaces** → `%20`: "User Authentication" becomes `User%20Authentication`
- **Special Characters** → Encoded equivalents: Periods become `%2E`, preserve symbols like `**`, `==`, parentheses
- **Case Sensitive**: Maintain original capitalization from heading text
- **No Conversion**: Do NOT convert to kebab-case, snake_case, or other formats

**Examples**:
- Heading: `## API Configuration` → Anchor: `#API%20Configuration`
- Heading: `### User Management System` → Anchor: `#User%20Management%20System`
- Heading: `### ==**Component.Service**==` → Anchor: `#==**Component%2EService**==`

## Usage in Story Creation

### Dev Notes Section
When referencing architecture documents in story Dev Notes, use markdown links:

```markdown
## Dev Notes

### Architectural Context (C4)
- **Components Affected**: [Auth Service](../architecture/components.md#Auth%20Service), [Database Layer](../architecture/components.md#Database%20Layer)
- **Implementation Guides**: [API Standards](../architecture/api-standards.md#REST%20Endpoints)

### Technical Details
- **Data Models**: [User Schema](../architecture/data-models.md#User%20Schema)
- **Testing Requirements**: [Integration Test Strategy](../architecture/testing-strategy.md#Integration%20Test%20Strategy)
```

### Story Cross-References
When linking between stories or to requirements, use appropriate format:

**Same epic/document**: `[[#^US1-1AC1|AC1]]`
**Different documents**: `[Epic 2 Story 1](../epic-2-stories.md#Story%202-1)`

## Citation Integration Best Practices

### Natural Language Integration
Whenever possible, wrap citations around natural language text instead of placing them at sentence ends. To improve readability, only wrap 1-5 words. Wrap the most natural connecting words.

**✅ Preferred - Natural Integration:**

```markdown
These principles are derived directly from the project's stated goals to create a [refined, repeatable, and robust framework](../../Project%20Overview.md#Vision%20Statement).
```

**❌ Avoid - End-of-Sentence Citations:**

```markdown
These principles are derived directly from the project's stated goals to create a refined, repeatable, and robust framework [Vision Statement](../../Project%20Overview.md#Vision%20Statement).
```

### Multiple Citations Pattern
When multiple sources support a single statement and/or natural integration would be awkward, use the _Sources_ pattern:

```markdown
The workspace eliminates development fragmentation through centralized tooling and shared infrastructure. _Sources_: [Problem Statement](../../Project%20Overview.md#Problem%20Statement), [Architecture Principles](../../Architecture%20Principles.md#^deterministic-offloading-principles-definition), [Research Analysis](research/content-aggregation-research.md#2%2E1%20NPM%20Workspaces%20vs%20Alternatives).
```

## Link Validation and Anti-Hallucination

### Never Create Unvalidated Links
**CRITICAL**: Never include links to documents or anchors that you haven't verified exist. This is a common source of broken documentation.

**❌ Prohibited - Hallucinated Links:**

```markdown
See the [Component Architecture](../architecture/components.md#Auth%20Service) for details.
```

*Without first verifying that `../architecture/components.md` exists and contains an "Auth Service" heading._

**✅ Required - Validated Links:**
Only create links after confirming:
1. The target file exists at the specified path
2. The target anchor/heading exists in that file
3. The relative path is correct from your current document location

### Intentional Future References
When you want to reference a document that **should** exist but doesn't yet, make this explicitly clear:

**Format for Future Documents:**

```markdown
This principle is detailed in the [Tool Design Patterns](../patterns/tool-design-patterns.md) document *(to be created)*.
```

**Format for Future Anchors:**

```markdown
The implementation follows [Safety-First Design Patterns](../../Architecture%20Principles.md#Safety-First%20Design%20Patterns) *(anchor to be added)*.
```

### Validation Process
Before including any link:
1. **File Check**: Verify the target file exists at the specified relative path
2. **Anchor Check**: Confirm the heading or anchor exists in the target file
3. **Path Check**: Ensure the relative path is correct from your document's location
4. **Test Click**: If possible, test the link works in your documentation system

## Best Practices

1. **Always Include Source References**: Every technical detail must cite its source document
2. **Natural Citation Flow**: Integrate citations into natural language whenever possible
3. **Use Descriptive Link Text**: Avoid generic "here" or "link" text
4. **Verify Links Work**: Test that anchors exist in target documents
5. **Consistent Anchor Naming**: Use URL-encoded original heading text for anchors, caret syntax for requirements
6. **Relative Paths**: Use relative paths from the story file location

## @ Import Usage

When using @imports in workflow files, cite this document as:

```markdown
@../rules/citation-guidelines.md
```

This ensures all workflow participants follow consistent citation standards.
