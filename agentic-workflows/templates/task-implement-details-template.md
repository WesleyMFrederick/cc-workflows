# Task Implementation Details Template

> [!Purpose]
> This template creates self-contained task instructions that enable dev agents to execute specific implementation tasks without requiring external documentation or architectural context.

**Critical AI Instructions**: Populate this template. Follow all [AI instructions in bracket]. Replace all [Content instructions between brackets]. If a bracket ends with _Remove_, then follow the instructions in the bracket for the section, but remove the bracket from the section.

## Implementation Gap
[Define the current vs required state. Include the specific conflict or technical requirement driving the change. _Remove_]

- **Objective**: [Task objective]
- **Current State**: [What exists now]
- **Required State**: [What needs to be achieved]
- **Integration Requirement**: [How this connects to existing code]

## Background Context
[Provide essential context the agent needs to understand the system they're working with. Include tool/system location, execution patterns, key functionality, and current behavior that relates to the task. Keep it focused and practical - what does the agent need to know to execute the task successfully?]

### Context Gathering Steps
[If needed, provide 1-4 numbered steps that help the agent understand established patterns and architectural conventions before implementing. Each task will have different requirements. Task that build on previous tasks often need to ingest the output from the previous task. Focus on what this specific task needs to execute successfully. Be explicit about files and paths. If working in TDD workflows, make sure agents run tests first. If a step needs a specific tool (Context 7, Serena List Directories, etc.), be explicit in calling it out. DO NOT provide general or obscure steps that offer zero value.]

## Implementation Requirements

### Files
[Include all files that need to be modified or created. This incluides code files, test fixures, related documentation, etc. Anything the agent needs to touch to Write, Edit, or Update. _Remove_]

- `[exact file paths]` (modify|create)
- ... _repeat for all files_

### Change Patterns
[Use MEDIUM-IMPLEMENTATION level from @/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/claude-code-knowledgebase/agentic-workflows/patterns/Psuedocode Style Guide.md. Start with concrete scenarios/examples in plain language to illustrate what triggers the pattern, then show code transformation from current to target state. Focus on platform patterns, integration boundaries, and decision points rather than line-by-line code. _Remove_]

**[Concrete scenario/example name]:**
[Brief concrete example in plain language showing the real-world trigger condition - numbered steps, specific file paths, actual behavior that demonstrates the pattern. This makes abstract patterns understandable.]

```[language, example below is tsx but adapt comments and code to implement language]
// Current Pattern: [what exists now]
[Abbreviated actual code showing the most important elements we are targeting. Use line comments to populate non-critical functionality. Do not populate if this is a new pattern]

// Target Pattern: [what should exist]
[pseudocode showing specific implementation patterns, integration points, and platform differences - emphasize the TRANSFORMATION from current to target]
// Integration: [how it connects to existing systems]
// Validation: [how to verify the change works]
// Boundary: [architectural constraints and interfaces]
```

... _repeat 1-2x more if needed for clarity_

### Critical Rules
[List any specific rules or constraints that must be followed, typically 1-2 key requirements]

- [Critical rule]
- ... _repeat for all critical rules_

## Key Implementation Elements
[Number each element 1-3 items max. Focus on the primary transformation, integration points, and validation strategy.  _Remove_]

1. **Primary Change**: [What gets transformed]
2. **Integration Points**: [How it connects to existing code]
3. **Validation Strategy**: [How to verify success]

### Expected Outcome

**Output**: [What gets created - files, components, or functionality]
**Scope**:
- [Key deliverable aspects]
- [Coverage areas]
- [Implementation boundaries]

**Success Criteria**: [How to know the task is complete and working correctly]

## Immediate Validation

```bash
[exact command to verify success]
# Expected result: [what should happen]
```

## Integration Note
[Brief note about how this enables subsequent tasks or affects dependent code, typically 1-5 sentences]

## Task [Task Number] Implement Agent Notes
[This section is populated by the implement agent during implementation. _remove_]

### Agent Model Used
[Record the specific AI llm model, version, and agent used for development]

### Debug Log References
[Reference any debug logs or traces generated during development]

### Completion Notes List
[Notes about the completion of tasks and any issues encountered]

### File List
[List all files created, modified, or affected during story implementation]

---

## Example Tasks
<!-- markdownlint-disable MD024 -->

<example>
<example-task-list>
- [ ] **1. Warning Status Test**
  - [ ] 1.1 Create basic warning validation test ^T1-1
    - **Agent**: test-writer
    - **Objective**: Create focused test that validates short filename citations return "warning" status
    - **Input**: Current test structure and existing fixtures in test/ directory
    - **Output**: Single test file that validates warning status for cross-directory short filename citations
    - **Files**: `test/warning-validation.test.js`
    - **Scope**:
      - Create test fixture with short filename citation in different directory
      - Test CLI output shows warning section instead of valid section
      - Test JSON output contains "warning" status for cross-directory short filename
    - **Test**: Warning validation test created: test validates short filename citations resolving cross-directory via file cache trigger warning status
    - **Commands**: `node --test test/warning-validation.test.js`
    - _Requirements_: [[#^AC1|AC1]]
    - _Implementation Details_: [01-1-warning-validation-test.md](./01-1-warning-validation-test.md)
</example-task-list>

<example-implement-details>
# Warning Validation Test Implementation Details

## Implementation Gap

- **Objective**: Create test that validates short filename citations return "warning" status when resolving cross-directory via file cache
- **Current State**: CitationValidator returns only "valid" or "error" status. Cross-directory short filename citations that resolve via file cache are marked as "valid"
- **Required State**: Cross-directory short filename citations must trigger "warning" status and be displayed in distinct warning section
- **Integration Requirement**: Test must follow existing Node.js test runner patterns while preparing for warning status implementation in CitationValidator

## Background Context
Citation manager is located at `citation-manager.js` in the citation-links root directory. Tests execute it via Node.js with command pattern:

```bash
node citation-manager.js validate <file> --scope <folder> [--format json]
```

File cache functionality enables smart filename resolution - when `--scope` is provided, the tool scans all markdown files in the scope folder and can resolve short filenames like `target.md` even when the citation path is `../missing/target.md`. Currently these cross-directory resolutions are marked as "valid" but should be "warning" status.

### Context Gathering Steps

1. **Understand test/ folder structure:**
   Explore the test/ folder structure at `./agentic-workflows/utility-scripts/citation-links/test/` to understand existing test patterns and fixture organization

2. **Read key files:**
   - `test/validation.test.js` - Core test patterns
   - `test/story-validation.test.js` - Scope usage examples
   - `test/fixtures/scope-test.md` - Cross-directory test scenario
   - `citation-manager.js` - CLI interface understanding

3. **Test current behavior:**

   ```bash
   node citation-manager.js validate test/fixtures/scope-test.md --scope test/fixtures --format json
   ```

4. **Run existing tests to understand patterns:**

   ```bash
   node --test test/validation.test.js
   ```

## Implementation Requirements

### Files
- `test/warning-validation.test.js` (create)
- `test/fixtures/warning-test-source.md` (create)
- `test/fixtures/subdir/warning-test-target.md` (create)

### Change Patterns

**Warning scenario example:**
1. Source file: `test/fixtures/warning-source.md` contains citation `[Link](../wrong-path/target.md)`
2. Actual target file exists at: `test/fixtures/subdir/target.md`
3. Citation path `../wrong-path/target.md` is broken (wrong-path doesn't exist)
4. But file cache finds `target.md` in `subdir/` and resolves the citation as "valid"
5. **Should be**: Citation marked as "warning" because path is incorrect despite successful resolution

```javascript
// Current validation pattern: binary valid/error status
const result = JSON.parse(output);
assert(result.results.filter(r => r.status === "valid").length > 0);
assert(result.results.filter(r => r.status === "error").length > 0);

// Target pattern: three-tier status validation with warning detection
const result = JSON.parse(output);
field warningResults = result.results.filter(r => r.status === "warning")
field validResults = result.results.filter(r => r.status === "valid")
field errorResults = result.results.filter(r => r.status === "error")
// Integration: Warning status for cross-directory short filename citations resolved via file cache
// Validation: CLI output contains distinct warning section markup
// Boundary: JSON structure maintains compatibility while extending status enum
```

### Critical Rules
- Test must fail initially since "warning" status doesn't exist yet - validates test detects the gap
- Use existing file cache scope functionality to trigger cross-directory resolution scenario

## Key Implementation Elements

1. **Primary Change**: Create test fixture with cross-directory short filename citation, validate warning status detection
2. **Integration Points**: Leverages existing execSync testing pattern, file cache scope functionality, CLI/JSON output validation
3. **Validation Strategy**: Test both CLI warning section display and JSON warning status field

## Expected Outcome

**Output**: Test file validating warning status for cross-directory short filename citations
**Scope**:
- Test fixture demonstrating cross-directory short filename resolution via file cache
- CLI output validation for warning section display
- JSON output validation for warning status field
- Integration with existing scope/file cache functionality

**Success Criteria**: Test fails initially proving it detects missing warning functionality, then passes after warning implementation

## Immediate Validation

```bash
node --test test/warning-validation.test.js
# Expected result: Test fails with assertion error about missing warning status/section
```

## Integration Note

This test establishes validation criteria for warning status implementation. When warning detection is implemented in CitationValidator, this test transitions from failing to passing, confirming functionality works correctly.

## Task 1.1 Implement Agent Notes
[This section is populated by the implement agent during implementation. _remove_]

### Agent Model Used
[Record the specific AI llm model, version, and agent used for development]

### Debug Log References
[Reference any debug logs or traces generated during development]

### Completion Notes List
[Notes about the completion of tasks and any issues encountered]

### File List
[List all files created, modified, or affected during story implementation]
</example-implement-details>
</example>
