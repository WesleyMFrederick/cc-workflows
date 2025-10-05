---
argument-hint: "<user-story-file-path>" "[wave-number]" "[task-id]"
---

# Create Implementation Prompt

## Usage
- `/create-implementation-prompt "path/to/us1.4b.md" "1a" "1.1"` - Create prompt for specific task
- `/create-implementation-prompt "path/to/us1.4b.md" "1a"` - Create prompts for all tasks in wave 1a
- `/create-implementation-prompt "path/to/us1.4b.md"` - Create prompts for all tasks in story

**Generate** lean, focused implementation detail files for user story tasks. **Target** 150-200 lines per task with high semantic density. **Follow** Prime Directives for focused context, code-first gap analysis, executable validation, and lean templates. **Eliminate** bloat: other tasks, future phases, architectural philosophy, redundant explanations.

## Input Validation
If no user story file path is provided ($1 is empty), respond with: "Error: Please provide a user story file path. Usage: /create-implementation-prompt '<user-story-file-path>' '[wave-number]' '[task-id]'"

<story-file-input>
$1
</story-file-input>

<wave-filter-input>
$2
</wave-filter-input>

<task-filter-input>
$3
</task-filter-input>

<prime-directives>
**Prime Directive #1: Focused Context**
Include ONLY information needed to execute THIS task. Exclude: other tasks, future phases, architectural philosophy, redundant explanations. Keep semantic density high - every line must directly support task execution.

**Prime Directive #2: Trust-Based Specification**
Show BEFORE/AFTER transformation patterns with clear examples. State WHAT needs to change (objective, scope, components) not HOW line-by-line (trust capable agents). Avoid brittle line-number instructions that break with any edit.

**Prime Directive #3: Executable Validation**
Provide bash commands with expected outputs that verify success. Make validation concrete and executable, not abstract criteria.

**Prime Directive #4: Lean Template (~200 lines max)**
Target 150-200 lines per task file. Remove all bloat: integration context for future phases, architectural philosophy, design principles justification, redundant explanations, line-by-line edit instructions.
</prime-directives>

<file-processing-methodology>
**Story File Processing**:
1. **Read Story File**: Extract user story content from $1 file path
2. **Initialize Context**: Run citation manager to gather base path files
   ```bash
   npm run citation:base-paths "$1" -- --format json
   ```
3. **Read All Base Paths**: Process all discovered architectural context files
4. **Extract Task Definitions**: Parse tasks/subtasks section for implementation specifications
5. **Filter Tasks**: Apply wave ($2) and task-id ($3) filters if provided

**Context Gathering Requirements**:
- **MUST** run citation manager on story file first
- **MUST** read all base path files for architectural context
- **MUST** extract current code state from source files
- **MUST** identify design principles and patterns from architecture docs

**Task Selection Logic**:
- If $3 provided: Generate prompt for single task matching task-id
- If $2 provided: Generate prompts for all tasks in specified wave
- If neither provided: Generate prompts for ALL tasks in story
</file-processing-methodology>

<implementation-prompt-structure>
For each selected task, create a comprehensive implementation detail file with:

**File Naming Convention**:

```plaintext
[phase-number]-[task-number]-[subtask-number]-[task-slug]-us[story-number].md
```

Example: `01-1-1-refactor-citation-validator-constructor-di-us1.4b.md`

**Required Sections**:

1. **Frontmatter Metadata** (YAML)

   ```yaml
   ---
   story: "[User Story Title]"
   epic: "[Epic Name]"
   phase: "[Phase Name]"
   task-id: "[Task ID]"
   task-anchor: "[Task Anchor Reference]"
   wave: "[Wave Number]"
   implementation-agent: "[Agent Type]"
   evaluation-agent: "[Agent Type]"
   status: "ready"
   ---
   ```

2. **Objective Section**
   - Clear, specific objective from subtask definition (1-2 sentences)
   - Link to task anchor in story file

3. **Current State → Required State** (Prime Directive #2)
   - **BEFORE**: Current code with line numbers (code block)
   - **AFTER**: Required code with line numbers (code block)
   - **Problems**: Bullet list of issues with current state
   - **Improvements**: Bullet list of improvements in required state
   - **Required Changes by Component**: Component-level transformation description (what changes, not line-by-line how)
   - **Do NOT modify**: Explicit constraints on what must remain unchanged

4. **Validation** (Prime Directive #3)
   - **Verify Changes**: Bash commands with expected outputs
   - **Expected Test Behavior**: Test commands with expected results
   - **Success Criteria**: Checkable items with ✅ markers

5. **Implementation Agent Instructions & Notes** (Template - Blank)

   ```markdown
   ## Implementation Agent Instructions

   Execute the task specification above. When complete, populate the Implementation Agent Notes section below with:
   - Agent model and version used
   - Files created/modified
   - Implementation challenges encountered
   - Validation command results

   ### Implementation Agent Notes

   > [!attention] **AI Agent:**
   > Populate this section during implementation execution.

   ### Agent Model Used
   [Record the specific AI agent model and version used]

   ### Debug Log References
   [Reference any debug logs or traces generated]

   ### Completion Notes
   [Notes about completion and any issues encountered]

   ### File List
   [List all files created, modified, or affected]

   ### Implementation Challenges
   [Document challenges encountered and resolutions]

   ### Validation Results
   [Results of running validation commands]
   ```

6. **Evaluation Agent Instructions & Notes** (Template - Blank)

   ````markdown
   ## Evaluation Agent Instructions

   Validate the implementation above against the task specification. Your validation must answer:

   **Did implementation follow task specification exactly?**

   Reference these specification sections:
   - **"Required Changes by Component"**: Verify component transformations completed
   - **"Success Criteria"**: Check all ✅ items pass
   - **"Validation" → "Verify Changes"**: Run provided bash commands
   - **"Do NOT Modify"**: Confirm no modifications outside allowed scope

   Populate the Evaluation Agent Notes section below with your findings.

   ### Evaluation Agent Notes

   > [!attention] **Evaluation Agent:**
   > Populate this section during validation execution.

   ### Validator Model Used
   [Record model name and version]

   ### Task Specification Compliance
   [Compare implementation against exact task spec from story]

   **Validation Checklist**:
   - [ ] Files Modified: Only specified files modified per spec?
   - [ ] Scope Adherence: No scope creep beyond task specification?
   - [ ] Objective Met: Task objective fully achieved?
   - [ ] Critical Rules: All non-negotiable requirements followed?
   - [ ] Integration Points: Proper integration with existing code?

   **Scope Boundary Validation** (Customize based on task type):

   For **Refactoring Tasks**:
   - [ ] ONLY specified files modified (no test files, no factory files, no CLI files)?
   - [ ] NO constructor validation logic added?
   - [ ] NO business logic changes beyond structural refactoring?
   - [ ] NO new files created?
   - [ ] NO import reorganization beyond removing unused imports?
   - [ ] Git diff shows ONLY specified changes (constructors, dependency usage)?

   For **Test Migration Tasks**:
   - [ ] ONLY test files modified (no source code changes)?
   - [ ] NO new test cases added beyond migration?
   - [ ] NO test assertion logic changes beyond framework syntax?
   - [ ] Line count unchanged (± 5% tolerance)?
   - [ ] Test descriptions preserved exactly?

   For **Feature Implementation Tasks**:
   - [ ] ONLY new files created per spec?
   - [ ] NO modifications to existing files beyond integration points?
   - [ ] NO additional components beyond specification?
   - [ ] NO extra configuration files created?

   **Git-Based Validation Commands**:
   ```bash
   # Verify file count and types
   git status --short | grep "^ M" | wc -l  # Expected: [exact count per spec]
   git status --short | grep "^??" | wc -l  # Expected: [exact count per spec]

   # Verify specific directories unchanged (customize per task)
   git diff --stat [protected-directory]/  # Expected: no changes
   ```

   ### Validation Outcome
   [PASS or FAIL with specific deviations if FAIL]

   ### Remediation Required
   [Specific fixes needed if FAIL, empty if PASS]
   ````

</implementation-prompt-structure>

<critical-success-factors>
**Focused Context (Prime Directive #1)**:
- ✅ ONLY information for THIS task included
- ✅ NO references to other tasks, future phases, or architectural philosophy
- ✅ High semantic density - every line supports execution
- ✅ No external file reads required for agent execution

**Trust-Based Specification (Prime Directive #2)**:
- ✅ BEFORE/AFTER code blocks showing transformation pattern
- ✅ Component-level "what changes" (not brittle line-by-line "how")
- ✅ Minimal prose - code examples speak for themselves
- ✅ Clear scope boundaries with descriptive anti-patterns (NO CODE EXAMPLES)

**Executable Validation (Prime Directive #3)**:
- ✅ Bash commands with expected outputs
- ✅ Concrete, executable verification (not abstract criteria)
- ✅ Success criteria with checkable ✅ markers
- ✅ Scope boundary validation commands (git-based checks)
- ✅ Agent note templates for tracking

**Lean Template (Prime Directive #4)**:
- ✅ Target 150-200 lines per task file
- ✅ NO integration context for future phases
- ✅ NO design principles justification
- ✅ NO redundant explanations or summaries
- ✅ NO code examples in scope boundaries (descriptive text only)
</critical-success-factors>

<scope-boundary-pattern-library>
**Common Scope Violation Patterns by Task Type**:

Use these patterns to generate task-specific scope boundaries. Use DESCRIPTIVE TEXT ONLY - NO CODE EXAMPLES.

**Refactoring Tasks** (e.g., DI refactoring, method extraction):

❌ **Adding validation logic during refactoring** - No parameter validation, type checking, or error throwing in constructors
❌ **Modifying business logic during structural changes** - No "improvements", optimizations, or new error handling in existing methods
❌ **Creating helper utilities** (if not in scope) - No factory functions, wrapper utilities, or abstraction layers
❌ **Modifying test files** (if test updates are separate phase) - No test constructor updates or test fixes
❌ **Reorganizing imports** beyond removing unused ones - Keep existing import organization, only remove injected dependencies

**Test Migration Tasks** (e.g., framework conversion):

❌ **Adding new test cases** - Maintain existing coverage only, no new tests
❌ **Modifying test assertions** beyond framework syntax conversion - Preserve test logic exactly
❌ **Updating fixtures** - Preserve exact fixture content, no modifications
❌ **Changing test descriptions** - Preserve original test intent and descriptions

**Validation Commands**:

```bash
# Verify line count unchanged (± 5% tolerance)
OLD_LINES=$(git show HEAD:path/to/test.js | wc -l)
NEW_LINES=$(wc -l < path/to/test.js)
# Expected: NEW_LINES ≈ OLD_LINES
```

**Feature Implementation Tasks** (e.g., new component):

❌ **Modifying existing components** not specified in scope - Only create new files per spec
❌ **Creating additional components** beyond specification - Stick to AC requirements only
❌ **Adding configuration files** not explicitly required - No extra config files
❌ **Implementing extra features** - Stick to AC only, no scope creep

**Validation Commands**:

```bash
# Should show ONLY specified new files
git status --short | grep "^??" | wc -l  # Expected: [exact count]

# Should show NO modifications to existing files
git status --short | grep "^ M"  # Expected: empty
```

**Documentation Tasks** (e.g., architecture updates):

❌ **Adding implementation details** before code exists - Document only completed work
❌ **Documenting future enhancements** not yet planned - Stick to current scope
❌ **Creating additional documentation files** beyond scope - Only modify specified files
❌ **Modifying related documentation** not explicitly listed - Limit to specified files only

**Component Integration Tasks** (e.g., wiring new feature):

❌ **Refactoring existing code** while integrating - Integration points only, no refactoring
❌ **Adding error handling** beyond integration requirements - Minimal integration code only
❌ **Creating abstraction layers** not in specification - Direct integration per spec
❌ **Modifying component internals** - Integration points only, no internal changes

**CLI/API Tasks** (e.g., new command):

❌ **Adding extra flags/options** beyond specification - Stick to specified API surface
❌ **Implementing auto-complete/help** if not required - No extras beyond requirements
❌ **Adding validation** beyond basic requirements - Minimal validation per spec
❌ **Creating aliases or shortcuts** not specified - Exact interface per specification

</scope-boundary-pattern-library>

<output-file-organization>
**Directory Structure**:
```
[story-directory]/
└── tasks/
    ├── [phase]-[task]-[subtask]-[slug]-us[story].md
    ├── [phase]-[task]-[subtask]-[slug]-us[story].md
    └── ...
```

**File Location**:
- Extract story directory from $1 file path
- Create `tasks/` subdirectory if not exists
- Generate implementation detail files in tasks/ directory

**Output Confirmation**:
After generating each file, confirm with:

```text
✅ Created: [file-path]
   Task: [task-id] - [task-objective]
   Wave: [wave-number]
   Lines: [approximate-line-count]
```

</output-file-organization>

<execution-workflow>
1. **Validate Inputs**: Check $1 exists, validate $2/$3 if provided
2. **Initialize Context**:
   - Run citation manager on story file
   - Read all base path files
   - Extract architectural patterns
3. **Extract Tasks**: Parse story file for task definitions
4. **Filter Tasks**: Apply wave/task-id filters
5. **Gather Implementation Context**: For each task:
   - Read current source code files
   - Extract before/after states
   - Identify integration points
6. **Generate Implementation Files**: Create comprehensive specs
7. **Validate Output**: Confirm all Prime Directives satisfied
8. **Report Completion**: Summary of files created
</execution-workflow>

<resilience-instructions>
**If Story File Not Found**:
"Error: Story file not found at path: $1. Please verify the file path and try again."

**If Citation Manager Fails**:
"Warning: Citation manager failed to extract base paths. Proceeding with available context. Implementation files may require manual context supplementation."

**If No Tasks Match Filters**:
"Error: No tasks found matching wave=$2 and task-id=$3. Available tasks in story: [list task IDs and waves]"

**If Task Missing Required Fields**:
"Warning: Task $3 missing required fields [list fields]. Generating best-effort implementation file with available information."

**If Source Code Files Missing**:
"Warning: Cannot access source file [path] for current state analysis. Implementation file will include specification without current state comparison."
</resilience-instructions>

## Quality Checklist

Before finalizing each implementation file, verify:

**Prime Directive Compliance:**
- [ ] **#1 Focused Context**: ONLY this task info, NO other tasks/phases/philosophy
- [ ] **#2 Trust-Based Spec**: BEFORE/AFTER patterns + component-level changes (NO line-by-line instructions)
- [ ] **#3 Executable Validation**: Bash commands with expected outputs
- [ ] **#4 Lean Template**: 150-200 lines max, NO bloat, NO code examples in scope boundaries

**Structure:**
- [ ] **File Naming**: `[phase]-[task]-[subtask]-[slug]-us[story].md`
- [ ] **Agent Templates**: Implementation & evaluation note sections included
- [ ] **Line Count**: Target 150-200 lines (NOT 500+)
- [ ] **Scope Boundaries**: Descriptive text only, NO code examples
