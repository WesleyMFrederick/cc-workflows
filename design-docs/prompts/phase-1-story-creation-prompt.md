# Phase 1: Story Creation Prompt

**Objective**: Transform epic requirements into a well-structured user story with complete architectural context, proper citations, and foundation for subsequent task generation phases.

## Phase 1 Execution Framework

### Pre-Execution Requirements

**Critical Required Inputs**:
1. **Epic Source Access**: Direct access to the epic or PRD containing the story definition
2. **Architecture Context**: Access to the project's C4 architecture documentation
3. **Citation Manager**: Ability to run `npm run citation:validate` and `npm run citation:base-paths`
4. **Template Access**: The [`story-shell-template.md`](../templates/story-shell-template.md) file loaded and ready for population
5. **Design Principles**: Access to project’s design principles document

### Execution Workflow

#### Step 1: Initialize Story Shell
1. **Create Story File**: Create new story file using naming conventions. Use shell template for file scaffold.
2. **Initialize Progress Tracking**: Mark Step 1 complete in Phase 1 Progress Tracking section

#### Step 2: Extract User Story Requirements

1. **Locate Source Story**: Find the specific story definition in the epic/PRD
2. **Copy Story Statement**: Extract the "As a... I want... so that..." statement EXACTLY as written
3. **Copy Acceptance Criteria**: Extract all acceptance criteria with original numbering and anchor references
4. **Add Source Citations**: Include proper citations to epic source with section anchors
5. **Update Progress**: Mark Step 2 complete in Phase 1 Progress Tracking section

#### Step 3: Gather Architectural Context

1. **Run Citation Base Paths**: Execute `npm run citation:base-paths <architecture-file-path> -- --format json`
2. **Identify Impacted Context, Containers, and Components**: Use C4 methodology to identify all System Contents, Containers, and Components affected by the story
3. **Extract Implementation Guides**: Locate and reference relevant implementation guides for each component
4. **Document Component Dependencies**: Map relationships between affected components
5. **Update Progress**: Mark Step 3 complete in Phase 1 Progress Tracking section

#### Step 4: Populate Technical Details

1. **Specify File Locations**: Define exact file paths for implementation (mark as PROPOSED for new files)
2. **Document Technology Stack**: Reference established technologies from architecture docs with links
3. **List Dependencies**: Extract all dependencies from architectural documentation
4. **Define Technical Constraints**: Include relevant constraints from architecture and design principles
5. **Note Integration Requirements**: Document how components integrate with existing architecture
6. **Update Progress**: Mark Step 4 complete in Phase 1 Progress Tracking section

#### Step 5: Apply Design Principles

1. **Load Design Principles**: Reference the project's design principles document
2. **Identify Relevant Principles**: Select principles most applicable to this story
3. **Provide Implementation Guidance**: Explain how each principle applies to this specific story
4. **Document Anti-Patterns**: List anti-patterns to avoid during implementation
5. **Update Progress**: Mark Step 5 complete in Phase 1 Progress Tracking section

#### Step 6: Define Testing Requirements

1. **Reference Test Strategy**: Link to architectural testing framework and strategy
2. **Specify Test Framework**: Document exact test framework from architecture standards
3. **Create Test Specifications**: Define specific tests that validate each acceptance criterion
4. **Include Error Scenarios**: Ensure both happy path and error scenarios are covered
5. **Update Progress**: Mark Step 6 complete in Phase 1 Progress Tracking section

#### Step 7: Validate Citation Links and Finalize

1. **Run Citation Validation**: Execute `npm run citation:validate <story-file-path>`
2. **Verify All Sections**: Ensure all template sections are properly populated
3. **Check Progress Tracking**: Confirm all Phase 1 progress items are marked complete
4. **Mark Phase Complete**: Check "Phase 1 Ready for Phase 2" in completion checklist
5. **Update Progress**: Mark Step 8 complete in Phase 1 Progress Tracking section

## Critical Success Factors

### Architectural Context Requirements

- **C4 Methodology**: Start with C4 framework, identify impacted levels
- **Component Notation**: Use proper Container.Component notation throughout
- **Implementation Guides**: Every component must reference its implementation guide
- **Integration Points**: Document how components connect and dependencies

### Citation Integrity Standards

- **Cross-Document Links**: Use markdown format `[Description](path/to/file.md#anchor)`
- **Same-Document Links**: Use wiki format `[[#anchor|Display Text]]`
- **Requirement Anchors**: Use caret syntax `^US1-1AC1` for acceptance criteria
- **Natural Language Integration**: Weave citations naturally into narrative text
- **Validation Required**: All citations must pass `npm run citation:validate`

### Story Quality Gates

- **Exact Epic Copy**: Story statement and acceptance criteria copied EXACTLY from epic
- **Complete Context**: All architectural information needed for task generation
- **Proper Citations**: All technical references validated via citation manager
- **Self-Contained**: Story contains sufficient context for independent Phase 2 execution

## Common Pitfalls and Solutions

### Pitfall: Incomplete Architectural Context
**Solution**: Use citation base paths command to discover all related architecture files.

### Pitfall: Invalid Citations
**Solution**: Run citation validation after each major section. Fix broken links immediately to prevent cascading issues.

### Pitfall: Missing Design Principles
**Solution**: Always reference the project's design principles document. Include both critical principles and anti-patterns to avoid.

### Pitfall: Insufficient Technical Detail
**Solution**: Specify exact file paths, technology stack with links, and all dependencies from architecture docs. Mark new files as PROPOSED.

## Phase 1 Completion Validation

Before proceeding to Phase 2, verify:

- [ ] **Story Definition**: Copied exactly from epic with proper citation
- [ ] **Acceptance Criteria**: Copied exactly from epic with anchor references
- [ ] **Architectural Context**: All affected components identified with citations
- [ ] **Technical Details**: File paths, dependencies, and constraints documented
- [ ] **Design Principles**: Relevant principles identified and application guidance provided
- [ ] **Testing Requirements**: Framework and test specifications defined
- [ ] **Citation Validation**: All architectural references validated using citation manager
- [ ] **Phase 1 Progress**: All progress tracking items marked complete

## Next Phase Transition

When Phase 1 is complete:

1. **Verify Completion**: Ensure all validation items are checked
2. **Save Story File**: Confirm story file is saved with proper naming convention
3. **Proceed to Phase 2**: Use `phase-2-task-generation-prompt.md` to create high-level tasks
4. **Maintain Context**: The completed story file serves as input for Phase 2

##  Guidance

- Focus on epic requirements extraction and story structure
- Ensure proper citation integration throughout the document
- Validate architectural alignment with established patterns
- Prepare context for subsequent task generation
- Emphasize architectural context gathering and component relationships
- Apply design principles with specific implementation guidance
- Define technical constraints and integration requirements
- Establish quality gates for subsequent implementation phases

### Quality Assurance Checkpoint

Phase 1 is considered complete when:

1. Story shell template is fully populated with relevant architectural context
2. All citations are validated and working
3. Epic requirements are exactly copied with proper source attribution
4. Technical details provide sufficient context for task generation
5. Phase 1 completion checklist is 100% complete
