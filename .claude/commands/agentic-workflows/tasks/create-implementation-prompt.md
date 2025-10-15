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

**AFTER Code Block Guidelines**:
- Use **MEDIUM-IMPLEMENTATION level** from [Pseudocode Style Guide](../../../agentic-workflows/patterns/Psuedocode%20Style%20Guide.md#MEDIUM-IMPLEMENTATION)
- **Show pattern structure, not complete implementation**
- Use **numbered decision points** (// 1., // 2., // 3...) to show control flow
- Use __inline comments in /_ ... _/__ to indicate implementation strategy without writing the code
- Use **real syntax** (tsx/javascript) but replace implementation details with descriptive comments
- **Trust the agent** to fill in the implementation based on the pattern shown
- Focus on **what** changes (structure, flow, integration points) not **how** line-by-line

**For component implementation:**
- Show the method structure and control flow
- Indicate key decision points (if/else, loops)
- Show integration patterns (how it calls dependencies)
- Use `/* placeholder */` for actual implementation code
- Annotate with WHY comments, not WHAT-TO-DO comments

**Example - Test Creation Task**:

```tsx
// First test: Complete pattern showing structure
it("should validate using factory", () => {
  const validator = createValidator()
  const result = validator.validate(fixture)
  expect(result.isValid).toBe(true)
  expect(result.errors).toHaveLength(...)  // Value agent determines
})

// Remaining tests: Abbreviated with Given-When-Then
it("should detect errors", () => {
  // Given: Factory-created validator
  // When: Process invalid fixture
  // Then: Errors detected
  ...
})
```

**Example - Component Implementation Task**:

```javascript
// GOOD: MEDIUM-IMPLEMENTATION (shows pattern, not complete code)
async resolveParsedFile(filePath) {
  // 1. Normalize path to absolute for consistent cache keys
  const cacheKey = /* path.resolve(path.normalize(filePath)) */;

  // 2. Decision point: Check cache
  if (this.cache.has(cacheKey)) {
    // Cache hit: Return existing Promise
    return /* cached Promise */;
  }

  // 3. Cache miss: Create parse operation
  const parsePromise = /* this.parser.parseFile(cacheKey) */;

  // 4. Store Promise IMMEDIATELY (handles concurrent requests)
  this.cache.set(cacheKey, parsePromise);

  // 5. Error handling: Cleanup on failure
  parsePromise.catch(() => {
    /* remove failed promise from cache */
  });

  return parsePromise;
}

// BAD: Full implementation (agent's job, not spec's job)
async resolveParsedFile(filePath) {
  const cacheKey = resolve(normalize(filePath));
  if (this.cache.has(cacheKey)) {
    return this.cache.get(cacheKey);
  }
  const parsePromise = this.parser.parseFile(cacheKey);
  this.cache.set(cacheKey, parsePromise);
  parsePromise.catch(() => {
    this.cache.delete(cacheKey);
  });
  return parsePromise;
}
```

**Prime Directive #3: Executable Validation**
Provide bash commands with expected outputs that verify success. Make validation concrete and executable, not abstract criteria.

**Prime Directive #4: Lean Template (~500 lines max)**
Target 150-500 lines per task file. Remove all bloat: integration context for future phases, architectural philosophy, design principles justification, redundant explanations, line-by-line edit instructions.

**Anti-Patterns to Avoid in AFTER Code Blocks**:

❌ **Complete Implementation** (violates Prime Directive #2)

```javascript
// This is the agent's job, not the spec's job
const cacheKey = resolve(normalize(filePath));
if (this.cache.has(cacheKey)) {
  return this.cache.get(cacheKey);
}
```

✅ **Pattern-Level Specification** (correct approach)

```javascript
// This shows WHAT needs to happen, trusts agent for HOW
const cacheKey = /* normalize to absolute path using path.resolve() */;
if (this.cache.has(cacheKey)) {
  return /* cached Promise */;
}
```

❌ **Line-by-line instructions**

```javascript
// Line 1: Import resolve and normalize
// Line 2: Define async method
// Line 3: Create cacheKey variable...
```

✅ **Flow-level pattern with decision points**

```javascript
// 1. Normalize path → 2. Check cache → 3. Return cached or create new
```

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

**Story File Update**:
After creating each implementation detail file, update the user story file to add bidirectional link:
- Locate the corresponding task/subtask section in the story file
- Add implementation detail file path under the task heading
- Format: `**Implementation Details**: [tasks/[filename].md](tasks/[filename].md)`
</file-processing-methodology>

<implementation-prompt-structure>
For each selected task, create a comprehensive implementation detail file with:

**File Naming Convention**:

```plaintext
[phase-number]-[task-number]-[subtask-number]-[task-slug]-us[story-number].md
```

Example: `01-1-1-refactor-citation-validator-constructor-di-us1.4b.md`

**Required Sections**:

1. **Frontmatter Metadata** (YAML) - **MANDATORY FIRST SECTION**

   **CRITICAL**: Every generated task file MUST begin with YAML frontmatter. This is required for `/execute-tasks` orchestration.

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

   **Required Fields**:
   - `story`: Full user story title from story file
   - `epic`: Epic name from story frontmatter
   - `phase`: Phase name (e.g., "Phase 1: Test File Relocation and Setup")
   - `task-id`: Task identifier (e.g., "1.1", "2.3")
   - `task-anchor`: Anchor link to task in story file (e.g., "#task-11-relocate-test-files")
   - `wave`: Wave identifier (e.g., "1a", "2b")
   - `implementation-agent`: Agent type for implementation (e.g., "code-developer", "test-writer")
   - `evaluation-agent`: Agent type for validation (e.g., "application-tech-lead", "qa-validation")
   - `status`: Always set to "ready" for new tasks

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

   **Scope Boundaries** (Anti-Patterns & Validation):
   - **Explicitly OUT OF SCOPE**: Anti-pattern examples with ❌ markers showing common scope violations
   - **Validation Commands**: Bash commands to verify scope boundaries not exceeded (git-based checks)

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

   ```markdown
   ## Evaluation Agent Instructions

   Validate the implementation above against the task specification. Your validation must answer:

   **Did implementation follow task specification exactly?**

   Reference these specification sections:
   - **"Required Changes by Component"**: Verify component transformations completed
   - **"Success Criteria"**: Check all ✅ items pass
   - **"Validation" → "Verify Changes"**: Run provided bash commands
   - **"Scope Boundaries"**: Confirm no modifications outside allowed scope

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

   **Scope Boundary Validation** (Task-Specific):
   - [ ] [Customize based on task type - see examples below]
   - [ ] [Add negative criteria preventing common scope violations]
   - [ ] [Include git-based validation checks where applicable]

   ### Validation Outcome
   [PASS or FAIL with specific deviations if FAIL]

   ### Remediation Required
   [Specific fixes needed if FAIL, empty if PASS]
   ```

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
- ✅ Clear scope boundaries with anti-pattern examples

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
</critical-success-factors>

<scope-boundary-pattern-library>
**Common Scope Violation Patterns by Task Type**:

Use these patterns to generate task-specific scope boundaries. Select relevant anti-patterns based on task type:

**Refactoring Tasks** (e.g., DI refactoring, method extraction):

```markdown
❌ **Adding validation logic during refactoring**
```javascript
// ❌ VIOLATION: Don't add new validation
constructor(dependency) {
  if (!dependency) throw new Error("Required");
  this.dependency = dependency;
}
```

❌ **Modifying business logic during structural changes**

```javascript
// ❌ VIOLATION: Don't "improve" existing methods
method() {
  // Adding new optimization/error handling
  if (edge_case) return optimized_path;
}
```

❌ **Creating helper utilities** (if not in scope)
❌ **Modifying test files** (if test updates are separate phase)
❌ **Reorganizing imports** beyond removing unused ones

**Test Migration Tasks** (e.g., framework conversion):

```markdown
❌ **Adding new test cases** (maintain existing coverage only)
❌ **Modifying test assertions** beyond framework syntax conversion
❌ **Updating fixtures** (preserve exact fixture content)
❌ **Changing test descriptions** (preserve original intent)

**Validation Commands**:
```bash
# Verify line count unchanged (± 5% tolerance)
OLD_LINES=$(git show HEAD:path/to/test.js | wc -l)
NEW_LINES=$(wc -l < path/to/test.js)
# Expected: NEW_LINES ≈ OLD_LINES
```

**Vitest Process Cleanup** (for CLI integration tests):

Tests using `execSync()` for CLI integration testing may leave Vitest worker processes in memory. Add cleanup configuration to prevent memory accumulation:

```javascript
// vitest.config.js additions
export default defineConfig({
  test: {
    forceExit: true,  // Exit after tests complete
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true }  // Reduce memory footprint
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  }
});
```

Manual cleanup if processes hang:

```bash
pkill -f "vitest"  # Kill all Vitest worker processes
```

Reference: [Workspace Testing Infrastructure - Vitest Process Management](../../../design-docs/features/20250928-cc-workflows-workspace-scaffolding/cc-workflows-workspace-architecture.md#Vitest%20Process%20Management%20and%20Cleanup)

**Feature Implementation Tasks** (e.g., new component):

```markdown
❌ **Modifying existing components** not specified in scope
❌ **Creating additional components** beyond specification
❌ **Adding configuration files** not explicitly required
❌ **Implementing extra features** (stick to AC only)

**Validation Commands**:
```bash
# Should show ONLY specified new files
git status --short | grep "^??" | wc -l  # Expected: [exact count]

# Should show NO modifications to existing files
git status --short | grep "^ M"  # Expected: empty
```

**Documentation Tasks** (e.g., architecture updates):

```markdown
❌ **Adding implementation details** before code exists
❌ **Documenting future enhancements** not yet planned
❌ **Creating additional documentation files** beyond scope
❌ **Modifying related documentation** not explicitly listed
```

**Component Integration Tasks** (e.g., wiring new feature):

```markdown
❌ **Refactoring existing code** while integrating
❌ **Adding error handling** beyond integration requirements
❌ **Creating abstraction layers** not in specification
❌ **Modifying component internals** (integration points only)
```

**CLI/API Tasks** (e.g., new command):

```markdown
❌ **Adding extra flags/options** beyond specification
❌ **Implementing auto-complete/help** if not required
❌ **Adding validation** beyond basic requirements
❌ **Creating aliases or shortcuts** not specified
```

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
   Story Updated: ✅ Added link to implementation details
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
7. **Update Story File**: Add implementation detail links to each task
8. **Validate Output**: Confirm all Prime Directives satisfied
9. **Report Completion**: Summary of files created and story file updated
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

## Example Usage

### Example 1: Generate Single Task Implementation Prompt

```bash
/create-implementation-prompt "tools/citation-manager/design-docs/features/20251003-content-aggregation/user-stories/us1.4b-refactor-components-for-di/us1.4b-refactor-components-for-di.md" "1a" "1.1"
```

**Expected Output**:

```text
🔍 Initializing context...
✅ Citation manager extracted 6 base paths
✅ Read all architectural context files
✅ Extracted task 1.1 from Wave 1a

📝 Generating implementation prompt...
✅ Current state analyzed: CitationValidator.js (751 lines)
✅ Required state defined: Constructor DI pattern
✅ Implementation gap identified: Replace hard-coded dependencies

✅ Created: tools/citation-manager/design-docs/features/20251003-content-aggregation/user-stories/us1.4b-refactor-components-for-di/tasks/01-1-1-refactor-citation-validator-constructor-di-us1.4b.md
   Task: 1.1 - Refactor CitationValidator for Constructor DI
   Wave: 1a
   Lines: ~200 (lean format)

📋 Implementation file ready for code-developer-agent execution
```

### Example 2: Generate All Wave 1a Tasks

```bash
/create-implementation-prompt "tools/citation-manager/design-docs/features/20251003-content-aggregation/user-stories/us1.4b-refactor-components-for-di/us1.4b-refactor-components-for-di.md" "1a"
```

**Expected Output**:

```text
🔍 Initializing context...
✅ Citation manager extracted 6 base paths
✅ Read all architectural context files
✅ Found 3 tasks in Wave 1a

📝 Generating implementation prompts...

✅ Created: 01-1-1-refactor-citation-validator-constructor-di-us1.4b.md
   Task: 1.1 - Refactor CitationValidator for Constructor DI
   Wave: 1a

✅ Created: 01-1-2-refactor-markdown-parser-constructor-di-us1.4b.md
   Task: 1.2 - Refactor MarkdownParser for Constructor DI
   Wave: 1a

✅ Created: 01-1-3-refactor-file-cache-constructor-di-us1.4b.md
   Task: 1.3 - Refactor FileCache for Constructor DI
   Wave: 1a

📋 3 implementation files ready for parallel execution
```

## Quality Checklist

Before finalizing each implementation file, verify:

**Prime Directive Compliance:**
- [ ] **#1 Focused Context**: ONLY this task info, NO other tasks/phases/philosophy
- [ ] **#2 Trust-Based Spec**: BEFORE/AFTER patterns + component-level changes (NO complete implementations, use `/* placeholders */`)
- [ ] **#3 Executable Validation**: Bash commands with expected outputs
- [ ] **#4 Lean Template**: 150-500 lines max, NO bloat

**Code Block Quality:**
- [ ] **AFTER blocks use MEDIUM-IMPLEMENTATION level** (pattern structure, not complete code)
- [ ] **Numbered decision points** (// 1., // 2., // 3...) show control flow
- [ ] **Inline `/* ... */` comments** indicate implementation strategy without writing code
- [ ] **Good/Bad examples** demonstrate pattern vs. full implementation contrast

**Structure:**
- [ ] **File Naming**: `[phase]-[task]-[subtask]-[slug]-us[story].md`
- [ ] **Agent Templates**: Implementation & evaluation note sections included
