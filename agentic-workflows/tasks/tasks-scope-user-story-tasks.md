---
type: task
task-name: Scope User Story Tasks
description: Split large documents into multiple smaller documents based on level 2 sections
argument-hint: [user-story-document]
---

# Scope User Story Tasks

## Atomic Task Requirements (CRITICAL FOR AGENT EXECUTION)
- **File Scope**: Touches 1-5 related files maximum
- **Single Purpose**: One complete implementation unit per task
  - Multiple related edits allowed per task
  - All changes must work together toward one validation checkpoint
  - The validation test can be written one clear and impactful sentence
- **Specific Files**: Must specify exact files to create/modify
- **Agent-Friendly**: Clear input/output with minimal context switching
- **Hallucination Free**: All tasks and sub-tasks are derived from design documentation

### Task Format Guidelines
- Format as numbered checkbox list with maximum two levels of hierarchy
- Sub-tasks should be numbered with decimal notation (e.g., 1.1, 1.2, 2.1)
- Each task must include:
  - Clear objective as task description that involves writing/modifying/testing code
  - Specific file paths to create/modify
  - Reference to requirements using: `_Requirements: X.Y, Z.A_`
  - Reference to leverage existing code: `_Leverage: path/to/file.ts_`
- Ensure each step builds incrementally on previous steps
- Prioritize test-driven development where appropriate
- Focus ONLY on coding and documentation tasks - exclude:
  - User acceptance testing or feedback gathering
  - Deployment to production/staging
  - Performance metrics gathering
  - Marketing, documentation, or organizational activities
  - Any task that cannot be completed through writing/modifying/testing code or code related documentation

### Example Task Format

```markdown
- [ ] **1. Warning Status**
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
    - _Implementation Details_: [populate with link display once details file created]([populate with relative url once details file created])
  - [ ] 2.2 Implement warning validation status and short filename detection ^T2-1
    - **Agent**: code-developer-agent
    - **Objective**: Add "warning" validation status and short filename detection to CitationValidator
    - **Input**: Current CitationValidator.js with existing validation logic and file cache resolution
    - **Output**: Enhanced CitationValidator with warning status support and cross-directory short filename detection
    - **Files**: `src/CitationValidator.js`
    - **Scope**:
      - Add "warning" status to validation results enum
      - Modify `validateCrossDocumentLink()` to detect cross-directory short filenames
      - Flag resolved-via-cache citations as warnings when source/target are in different directories
    - **Test**: Warning validation implementation passes: test from T1-1 validates correct warning status behavior
    - **Commands**: `node --test test/warning-validation.test.js`
    - _Requirements_: [[#^AC1|AC1]]
    - _Implementation Details_: [populate with link display once details file created]([populate with relative url once details file created])

- [ ] **3. CLI Reporting Test**
  - [ ] 3.1 Create CLI warning reporting test ^T3-1
    - **Agent**: test-writer
    - **Objective**: Create test that validates CLI properly displays warnings distinctly from valid and error statuses
    - **Input**: Warning status implementation from Task 2 with working warning detection
    - **Output**: Test that validates CLI output separates valid/warnings/errors with clear categorization
    - **Files**: `test/cli-warning-output.test.js`
    - **Scope**:
      - Test CLI output shows warning section with proper formatting
      - Test summary statistics include warning counts
      - Test warnings are distinctly marked as fixable issues
    - **Test**: CLI warning output test created: test validates proper warning section formatting and statistics
    - **Commands**: `node --test test/cli-warning-output.test.js`
    - _Requirements_: [[#^AC3|AC3]]
    - _Implementation Details_: [populate with link display once details file created]([populate with relative url once details file created])
```
