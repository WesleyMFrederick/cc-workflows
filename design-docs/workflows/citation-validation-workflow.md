# Citation Validation Workflow

## Executive Summary

This workflow provides comprehensive guidance for citation validation throughout the 4-phase user story system, ensuring architectural references maintain integrity and accessibility across all documentation phases.

## Citation Integration Strategy

### Citation Types and Standards

The 4-phase system uses three primary citation types, each with specific validation requirements:

#### 1. Cross-Document References
**Format**: `[Description](path/to/file.md#anchor)`
**Usage**: Links to external files within the project
**Validation**: File existence and anchor accessibility

#### 2. Same-Document References
**Format**: `[[#anchor|Display Text]]`
**Usage**: Internal links within the same document
**Validation**: Anchor existence within current document

#### 3. Requirement Anchors
**Format**: `^US1-1AC1` (for acceptance criteria) or `^T1-1` (for tasks)
**Usage**: Unique identifiers for requirements and tasks
**Validation**: Anchor uniqueness and proper format

### Natural Language Integration

Citations should be woven naturally into narrative text rather than appearing as standalone links. This improves readability while maintaining technical accuracy.

**Good Example**:

```markdown
The DirectoryManager component follows the [atomic operations principle](../design-principles.md#Atomic%20Operations) to ensure consistent state management.
```

**Poor Example**:

```markdown
The DirectoryManager component follows atomic operations.
Reference: [atomic operations principle](../design-principles.md#Atomic%20Operations)
```

## Citation Validation Commands

### Core Validation Commands

The citation manager provides several commands for validation throughout the workflow:

#### Complete Citation Validation

```bash
npm run citation:validate <file-path>
```

Validates all citations in a specific file, checking both file existence and anchor accessibility.

#### Base Path Discovery

```bash
npm run citation:base-paths <file-path> -- --format json
```

Extracts and validates all base architectural paths referenced in a document, useful for Phase 1 architectural context gathering.

#### Type-Specific Validation

```bash
npm run citation:validate <file-path> -- --type cross-document
npm run citation:validate <file-path> -- --type same-document
npm run citation:validate <file-path> -- --type requirement-anchors
```

Validates specific citation types independently for targeted error resolution.

#### Batch Validation

```bash
find design-docs -name "*.md" -exec npm run citation:validate {} \;
```

Validates all markdown files in the design-docs directory for comprehensive system validation.

## Phase-Specific Validation Workflows

### Phase 1: Story Creation Validation

**Validation Points**:
- After architectural context gathering
- Before marking Phase 1 complete
- During epic requirements extraction

**Commands**:

```bash
# Discover architectural base paths
npm run citation:base-paths <story-file-path> -- --format json

# Validate all architectural references
npm run citation:validate <story-file-path>

# Verify specific architectural context citations
npm run citation:validate <story-file-path> -- --type cross-document
```

**Success Criteria**:
- All architectural component references validated
- Epic source citations working and accessible
- Design principle references confirmed
- Implementation guide links verified

### Phase 2: Task Generation Validation

**Validation Points**:
- After task creation and agent assignments
- Before proceeding to Phase 3
- When updating requirements mappings

**Commands**:

```bash
# Validate task requirement citations
npm run citation:validate <story-file-path> -- --type requirement-anchors

# Confirm architectural alignment references
npm run citation:validate <story-file-path> -- --type cross-document

# Full validation before Phase 3
npm run citation:validate <story-file-path>
```

**Success Criteria**:
- All acceptance criteria anchors working
- Architectural reference integrity maintained
- Task requirement mappings validated
- Agent assignment documentation accessible

### Phase 3: Task Scoping Validation

**Validation Points**:
- After subtask breakdown completion
- When updating dependency mappings
- Before proceeding to Phase 4

**Commands**:

```bash
# Validate subtask requirement anchors
npm run citation:validate <story-file-path> -- --type requirement-anchors

# Confirm same-document references
npm run citation:validate <story-file-path> -- --type same-document

# Complete validation before implementation details
npm run citation:validate <story-file-path>
```

**Success Criteria**:
- All subtask anchors properly formatted and unique
- Internal dependency references working
- Requirements traceability maintained
- Implementation guide references validated

### Phase 4: Implementation Details Validation

**Validation Points**:
- After each implementation details file creation
- When linking back to story file
- Before marking Phase 4 complete

**Commands**:

```bash
# Validate individual implementation details files
npm run citation:validate <implementation-details-file-path>

# Validate updated story file with implementation links
npm run citation:validate <story-file-path>

# Batch validate all implementation details files
find . -name "*-us[0-9]*.md" -exec npm run citation:validate {} \;
```

**Success Criteria**:
- All implementation details files self-contained with valid citations
- Story file implementation links working
- Architectural references maintained across all files
- Cross-reference integrity between implementation details files

## Automated Validation Integration

### Pre-Commit Validation

Integrate citation validation into the development workflow:

```bash
# Add to git pre-commit hook
#!/bin/bash
# Validate all modified markdown files
git diff --cached --name-only --diff-filter=ACM | grep '\.md$' | while read file; do
    npm run citation:validate "$file" || exit 1
done
```

### Continuous Integration

Add citation validation to CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: Citation Validation
on: [push, pull_request]
jobs:
  validate-citations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Validate citations
        run: find . -name "*.md" -exec npm run citation:validate {} \;
```

## Error Resolution Patterns

### Common Citation Errors and Solutions

#### Error: File Not Found
**Symptoms**: `Error: Referenced file does not exist: path/to/file.md`
**Solutions**:
1. Verify file path accuracy and case sensitivity
2. Check if file was moved or renamed
3. Update path to reflect current file location
4. Ensure relative path calculation is correct

#### Error: Anchor Not Found
**Symptoms**: `Error: Anchor '#section-name' not found in file.md`
**Solutions**:
1. Verify anchor exists in target file
2. Check anchor formatting (spaces become %20 or hyphens)
3. Ensure anchor case matches exactly
4. Verify heading structure in target file

#### Error: Malformed Requirement Anchor
**Symptoms**: `Error: Invalid requirement anchor format: ^US1AC1`
**Solutions**:
1. Follow exact format: `^US[story-number]-[item-number]AC[criteria-number]`
2. Ensure hyphen separation between story and item numbers
3. Verify anchor uniqueness within document
4. Check for proper caret prefix

#### Error: Circular References
**Symptoms**: `Error: Circular reference detected in citation chain`
**Solutions**:
1. Map citation dependency chain
2. Identify circular reference points
3. Restructure citations to eliminate loops
4. Use hierarchical citation patterns

### Validation Error Recovery

When validation errors occur:

1. **Stop Progression**: Do not proceed to next phase until all citation errors resolved
2. **Isolate Errors**: Use type-specific validation to identify error categories
3. **Fix Systematically**: Address errors in order of dependency (base files first)
4. **Re-validate**: Run complete validation after each fix
5. **Document Changes**: Update change log with citation corrections

## Quality Assurance Standards

### Citation Quality Metrics

Monitor citation quality throughout the workflow:

1. **Coverage**: Percentage of architectural references properly cited
2. **Accuracy**: Percentage of citations that validate successfully
3. **Completeness**: All required citations present per phase standards
4. **Consistency**: Citation format adherence across all documents

### Quality Gates

Each phase includes mandatory citation quality gates:

1. **Phase 1**: 100% architectural context citations validated
2. **Phase 2**: 100% requirement mapping citations validated
3. **Phase 3**: 100% subtask dependency citations validated
4. **Phase 4**: 100% implementation details citations validated

### Continuous Monitoring

Implement ongoing citation quality monitoring:

1. **Daily Validation**: Automated validation of all project documentation
2. **Broken Link Detection**: Regular scanning for inaccessible references
3. **Citation Drift**: Monitoring for citation accuracy degradation over time
4. **Compliance Reporting**: Regular reports on citation quality metrics

## Best Practices

### Citation Creation Guidelines

1. **Use Natural Language**: Integrate citations seamlessly into narrative text
2. **Provide Context**: Include sufficient context for citation purpose
3. **Maintain Hierarchy**: Structure citations to follow logical information architecture
4. **Avoid Redundancy**: Don't duplicate citations unnecessarily within same section
5. **Update Consistently**: Maintain citation currency as referenced content evolves

### Template-Specific Patterns

#### Story Shell Template Citations
- Epic source with specific section anchors
- Architectural component references with C4 notation
- Design principle applications with implementation guidance
- Implementation guide references for affected components

#### Task Framework Template Citations
- Acceptance criteria anchors for requirements mapping
- Architectural context references for alignment validation
- Agent capability documentation for assignment justification
- TDD methodology references for workflow compliance

#### Task Scoping Template Citations
- High-level task anchors for dependency mapping
- Subtask requirement anchors for traceability
- Implementation guide references for technical patterns
- Agent workflow documentation for handoff procedures

#### Implementation Details Template Citations
- Story file subtask anchors for context linkage
- Architectural documentation for background context
- Code example references for implementation patterns
- Validation guide references for success criteria

## Validation Workflow Summary

The complete citation validation workflow ensures:

1. **Architectural Integrity**: All architectural references remain accurate and accessible
2. **Requirements Traceability**: Clear linkage from epic through implementation details
3. **Quality Assurance**: Consistent validation standards across all phases
4. **Error Prevention**: Proactive identification and resolution of citation issues
5. **Workflow Efficiency**: Automated validation reduces manual verification overhead

By following this citation validation workflow, teams can maintain high-quality documentation with reliable architectural references throughout the entire 4-phase user story development process.
