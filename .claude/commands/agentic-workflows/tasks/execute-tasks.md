---
argument-hint: "<task-file-or-folder-path> [additional-paths...]"
---

# Execute Tasks

Execute implementation and validation workflows for task files using dynamic agent orchestration.

## Usage

- `/execute-tasks @tasks/task1.md` - Execute single task file
- `/execute-tasks /full/path/to/task.md` - Execute with full path
- `/execute-tasks @tasks/folder/` - Execute all tasks in folder
- `/execute-tasks @task1.md @task2.md` - Execute multiple tasks
- `/execute-tasks @task1.md /full/path/task2.md` - Mixed path formats

## Input Validation

If no path is provided ($1 is empty), respond with: "Error: Please provide at least one task file or folder path. Usage: /execute-tasks '<path>' '[additional-paths...]'"

<task-paths-input>
Arguments: $1 $2 $3 $4 $5 $6 $7 $8 $9
</task-paths-input>

<execution-workflow>
## Execution Workflow

### Step 1: Parse Input & Discover Task Files

**For each argument ($1, $2, $3...):**
1. **Resolve Path**: Convert `@file.md` to absolute path, accept full paths as-is
2. **Determine Type**:
   - If path ends with `.md`: Single file
   - If path is directory: Glob for `*.md` files (exclude README.md, index.md)
3. **Collect Task Files**: Build array of absolute paths to process

**Validation**:
- Verify each discovered file exists
- If file not found, report error and continue with remaining files

### Step 2: Read Frontmatter & Build Execution Plan

**For each task file:**

1. **Read Frontmatter** (YAML between `---` markers)

2. **Extract Agent Configuration**:
   - `task-id`: Task identifier for reporting
   - `story`: Story title for branch naming
   - `implementation-agent`: Agent type for implementation (if present)
   - `evaluation-agent`: Agent type for validation (if present)
   - Any other `*-agent` fields for future flexibility

3. **Build Agent Execution List**:
   - If `implementation-agent` present: Add to execution plan
   - If `evaluation-agent` present: Add to execution plan (runs AFTER implementation)
   - If no agents defined: Skip task with warning

4. **Create Todo List with Execution Todos and QA Checkpoints**:
   - Build unified todo list with execution todos (actual work) and QA checkpoints (quality gates) interspersed logically
   - See Todo List Structure section below for detailed specification

### Step 3: Feature Branch Creation (First Task Only)

**Before executing the first task:**

1. **Detect First Task**: Check if this is the first task being executed in the current session
2. **Extract Story Identifier**: Parse frontmatter for `story` field to generate branch name
3. **Create Feature Branch**:
   - Generate `{story-slug}` from story frontmatter (lowercase, hyphens for spaces/special chars)
   - Create branch: `git checkout -b feature/{story-slug}`

4. **Confirm Branch Creation**: Report branch name to user

**If feature branch already exists:**
- Check if already on the feature branch
- If on different branch, ask user whether to:
  - Switch to existing feature branch
  - Create new branch with incremented suffix
  - Continue on current branch

**Skip branch creation if:**
- Already on a feature branch matching the story
- User explicitly disabled branch creation
- Not on main/master branch (assume intentional branch already selected)

### Step 4: Execute Agents Sequentially

**For each task in execution plan:**

#### If `implementation-agent` is defined

Launch the specified agent with this prompt:

```text
Execute [Task ID: {task-id}] from the task document at `{absolute-file-path}`

Read the task document, follow the complete specification under "Objective" and "Required Changes by Component", then populate the "Implementation Agent Notes" section with your completion details.
```

**Mark todo as in_progress before launch, completed after agent returns.**

#### If `evaluation-agent` is defined

Launch the specified agent with this prompt:

```text
Validate [Task ID: {task-id}] from the task document at `{absolute-file-path}`

Review the completed "Implementation Agent Notes" section, execute validation per the "Evaluation Agent Instructions" section, then populate the "Evaluation Agent Notes" section with your findings.
```

**Mark todo as in_progress before launch, completed after agent returns.**

#### Error Handling

- If agent fails, mark as failed in todo list
- Continue with next agent/task (don't halt entire workflow)
- Collect errors for final report

### Step 5: Update Task Status

**After all agents complete for a task:**

1. **Determine Final Status**:
   - If all defined agents succeeded → Set `status: "Done"`
   - If any agent failed → Set `status: "Failed"`
   - If implementation succeeded but evaluation failed → Set `status: "Needs Review"`

2. **Update Frontmatter**:
   - Use Edit tool to modify the `status` field in the task file's YAML frontmatter
   - Locate the line containing `status:` within the frontmatter (between `---` markers)
   - Replace current status value with determined status

   **Step 3 Example: Status Update:**

   ```yaml
   # Before (in task file frontmatter)
   status: "ready"

   # After successful completion
   status: "Done"

   # After failure
   status: "Failed"
   ```

3. **Preserve Other Fields**: Keep all other frontmatter fields unchanged (story, epic, phase, task-id, agents)

4. **Update User Story Task Checkbox** (when status = "Done"):
   - Extract `story` field from task frontmatter to identify parent user story
   - Search for user story document containing matching story title
   - Find task checkbox corresponding to current `task-id`
   - Mark checkbox as complete: `- [ ]` → `- [x]`
   - Use Edit tool to update the user story document

   **Step 4 Example: User Story Checkbox Update:**

   ```markdown
   # In user story document

   ## Tasks
   - [x] Task 1.1: Relocate test files (marked when task completes)
   - [ ] Task 1.2: Update parser tests
   - [ ] Task 1.3: Refactor parser
   ```

5. **Update Execution Todo List** (AFTER checkbox update):
   - Mark task execution todo items as `completed` in the execution todo list
   - **Execution Order**: Checkbox updates happen first, then todo list updates
   - This ensures user story reflects completion before execution tracking is marked done
   - Provides proper observability: users see story progress before execution todos complete

### Step 6: Post-Execution Updates & Reporting

**After all tasks complete:**

#### 6.1: Check User Story Completion & Update PRD Status

1. **Extract User Story Reference**:
   - Get `story` field from task frontmatter
   - Locate the user story document containing this story title

2. **Check All Tasks Complete**:
   - Read all task checkboxes in the user story document
   - Count total tasks vs. completed tasks `[x]`
   - If any tasks remain incomplete `[ ]`, skip PRD update

3. **Update PRD Status When Story Complete**:
   - If all task checkboxes are marked complete `[x]`:
     - Search for PRD document that references this user story
     - Locate the status line for this user story in the PRD
     - Update status: `📋 PENDING` → `🔍 Needs Evaluation`
     - Use Edit tool to update the PRD document

   **Example PRD Status Update:**

   ```markdown
   # Before (in PRD)
   **Status**: 📋 PENDING

   # After (when all story tasks complete)
   **Status**: 🔍 Needs Evaluation
   ```

4. **Error Handling**:
   - If user story document not found: Log warning, continue to reporting
   - If PRD document not found: Log warning, continue to reporting
   - If status line not found in PRD: Log warning, continue to reporting

#### 6.2: Generate Execution Summary Report

```markdown
## Execution Summary

**Feature Branch**: {branch-name}
**Tasks Executed**: {total-count}

### Results by Task

**Task {task-id}** - {file-name}
- Implementation Agent: {agent-type} - {STATUS}
- Evaluation Agent: {agent-type} - {STATUS} (if present)

### Overall Status
- ✅ Passed: {pass-count}
- ❌ Failed: {fail-count}
- ⚠️ Warnings: {warning-count}

### Next Steps
[Recommendations based on results]
- Code is on branch: {branch-name}
- Ready to merge if all tests pass
```

</execution-workflow>

<agent-prompt-templates>
## Agent Prompt Templates

### Implementation Agent Prompt

```text
Execute [Task ID: {task-id}] from the task document at `{absolute-file-path}`

Read the task document, follow the complete specification under "Objective" and "Required Changes by Component", then populate the "Implementation Agent Notes" section with your completion details.

**Key Requirements:**
- Read and understand the full task specification
- Execute all changes specified in "Required Changes by Component"
- Run validation commands from "Validation → Verify Changes" section
- Populate "Implementation Agent Notes" with:
  - Agent model and version used
  - Files created/modified
  - Implementation challenges encountered
  - Validation command results
```

### Evaluation Agent Prompt

```text
Validate [Task ID: {task-id}] from the task document at `{absolute-file-path}`

Review the completed "Implementation Agent Notes" section, execute validation per the "Evaluation Agent Instructions" section, then populate the "Evaluation Agent Notes" section with your findings.

**Your Validation Tasks:**
1. Verify implementation followed "Required Changes by Component" exactly
2. Check all items in "Success Criteria" section pass
3. Run all validation commands from "Validation → Verify Changes" section
4. Confirm "Do NOT Modify" constraints were respected
5. Populate "Evaluation Agent Notes" with validation checklist results, outcome (PASS/FAIL), and any remediation needed
```

</agent-prompt-templates>

<todo-list-instructions>
## Todo List Structure

**Create unified todo list with execution todos and QA checkpoints interspersed:**

### For Single Task Execution

```javascript
TodoWrite({
  todos: [
    // Phase 1: Discovery & Planning
    { content: "Discover and validate task files", status: "pending", activeForm: "Discovering task files" },
    { content: "Parse frontmatter configuration", status: "pending", activeForm: "Parsing frontmatter" },

    // Phase 2: Branch Setup (first task only)
    { content: "Create feature branch: feature/{story-slug}", status: "pending", activeForm: "Creating feature branch" },
    { content: "✓ QA: Branch creation successful", status: "pending", activeForm: "Verifying branch creation" },

    // Phase 3: Implementation
    { content: "Execute Task {task-id} with {implementation-agent}", status: "pending", activeForm: "Executing Task {task-id} with {implementation-agent}" },
    { content: "✓ QA: Implementation agent completed successfully", status: "pending", activeForm: "Verifying implementation" },

    // Phase 4: Validation (if evaluation-agent defined)
    { content: "Validate Task {task-id} with {evaluation-agent}", status: "pending", activeForm: "Validating Task {task-id} with {evaluation-agent}" },
    { content: "✓ QA: Evaluation agent completed successfully", status: "pending", activeForm: "Verifying evaluation" },

    // Phase 5: Status Updates
    { content: "Update Task {task-id} status in task file", status: "pending", activeForm: "Updating task status" },
    { content: "Mark Task {task-id} checkbox in user story", status: "pending", activeForm: "Marking checkbox" },
    { content: "✓ QA: Task status and checkbox updated", status: "pending", activeForm: "Verifying status updates" },

    // Phase 6: Post-Execution & Reporting
    { content: "Check user story completion and update PRD status if complete", status: "pending", activeForm: "Checking story completion" },
    { content: "✓ QA: PRD status updated if applicable", status: "pending", activeForm: "Verifying PRD update" },
    { content: "Generate execution summary report", status: "pending", activeForm: "Generating report" },
    { content: "✓ QA: All workflow steps completed", status: "pending", activeForm: "Final verification" }
  ]
})
```

### For Multiple Task Execution

For multiple tasks, repeat Phases 3-5 for each task:

```javascript
TodoWrite({
  todos: [
    // Phase 1: Discovery & Planning
    { content: "Discover and validate all task files", status: "pending", activeForm: "Discovering task files" },
    { content: "Parse frontmatter for all tasks", status: "pending", activeForm: "Parsing frontmatter" },

    // Phase 2: Branch Setup (if needed)
    { content: "Create/verify feature branch", status: "pending", activeForm: "Setting up branch" },

    // === Task {task-id-1} ===
    { content: "Execute Task {task-id-1} with {implementation-agent-1}", status: "pending", activeForm: "Executing Task {task-id-1}" },
    { content: "Validate Task {task-id-1} with {evaluation-agent-1}", status: "pending", activeForm: "Validating Task {task-id-1}" },
    { content: "Update Task {task-id-1} status and checkbox", status: "pending", activeForm: "Updating Task {task-id-1} status" },
    { content: "✓ QA: Task {task-id-1} complete", status: "pending", activeForm: "Verifying Task {task-id-1}" },

    // === Task {task-id-2} ===
    { content: "Execute Task {task-id-2} with {implementation-agent-2}", status: "pending", activeForm: "Executing Task {task-id-2}" },
    { content: "Validate Task {task-id-2} with {evaluation-agent-2}", status: "pending", activeForm: "Validating Task {task-id-2}" },
    { content: "Update Task {task-id-2} status and checkbox", status: "pending", activeForm: "Updating Task {task-id-2} status" },
    { content: "✓ QA: Task {task-id-2} complete", status: "pending", activeForm: "Verifying Task {task-id-2}" },

    // Phase 6: Post-Execution & Reporting
    { content: "Check user story completion and update PRD status if complete", status: "pending", activeForm: "Checking story completion" },
    { content: "✓ QA: PRD status updated if applicable", status: "pending", activeForm: "Verifying PRD update" },
    { content: "Generate execution summary for all tasks", status: "pending", activeForm: "Generating summary" },
    { content: "✓ QA: All tasks completed successfully", status: "pending", activeForm: "Final verification" }
  ]
})
```

**Key Principles:**
- **Execution Todos**: Show actual work (agent launches, file updates) with specific task IDs and agent names from frontmatter
- **QA Checkpoints**: Prefixed with "✓ QA:" to validate preceding work
- **Dynamic Agents**: Use actual agent names from each task's frontmatter (not hardcoded)
- **Skip Missing Agents**: If no evaluation-agent defined, skip validation phase entirely

**Update Rules:**
- Mark `in_progress` immediately before starting each step
- Mark `completed` immediately after each step finishes successfully
- Mark `failed` if any step encounters errors
- QA checkpoints marked `completed` after verifying preceding work

</todo-list-instructions>

<error-handling-and-edge-cases>
## Error Handling & Edge Cases

**If feature branch creation fails:**

```text
❌ Error: Failed to create feature branch {branch-name}. Git error: {error-message}
Options:
1. Fix git issue and retry
2. Continue on current branch (not recommended)
3. Abort execution
```

**If no agents defined in frontmatter:**

```text
⚠️ Warning: Task {task-id} at {file-path} has no agents defined in frontmatter. Skipping.
```

**If task file missing required frontmatter:**

```text
❌ Error: Task file {file-path} missing required frontmatter fields. Skipping.
```

**If agent execution fails:**

```text
❌ Failed: {agent-type} for Task {task-id} encountered errors. See agent output for details.
```

**If file not found:**

```text
❌ Error: Task file not found at {file-path}. Skipping.
```

**If user story document not found:**

```text
⚠️ Warning: Could not find user story document for "{story-title}" to update task checkbox. Task status updated in task file only.
```

**If task checkbox not found in user story:**

```text
⚠️ Warning: Could not find checkbox for Task {task-id} in user story "{story-title}". Task status updated in task file only.
```

**If checkbox update Edit operation fails:**

```text
❌ Error: Failed to update checkbox for Task {task-id} in user story "{story-title}". Edit operation error: {error-message}
Task status successfully updated in task file, but user story checkbox update failed.
Options:
1. Manually update the checkbox in the user story document
2. Re-run the execute-tasks command with just this task
3. Continue - task status in task file is accurate
```

</error-handling-and-edge-cases>

<examples>

### Task File Frontmatter Structure

Example frontmatter that the command expects:

```yaml
---
story: "User Story 1.4a: Migrate Test Suite"
epic: "Citation Manager Test Migration & Content Aggregation"
phase: "Phase 1: Test File Relocation and Setup"
task-id: "1.1"
implementation-agent: "code-developer-agent"
evaluation-agent: "application-tech-lead"  # optional
status: "ready"
---
```

### Example 1: Execute Single Task (First Task Creates Branch)

```bash
/execute-tasks @tasks/01-1-1-relocate-test-files-us1.4a.md
```

**Task File Frontmatter:**

```yaml
story: "User Story 1.4a: Migrate Test Suite"
task-id: "1.1"
implementation-agent: "code-developer-agent"
evaluation-agent: "application-tech-lead"
```

**Expected Workflow:**
1. Reads frontmatter → extracts story, task-id, and agent types
2. **Creates feature branch**: `git checkout -b feature/us1.4a-migrate-test-suite`
3. Creates unified todo list with execution steps and QA checkpoints interspersed
4. Launches code-developer-agent with implementation prompt
5. Launches application-tech-lead with validation prompt
6. Update task status in task file and mark checkbox in user story file
7. Check if all user story tasks complete → update PRD status if needed
8. Mark todos as completed throughout execution
9. Reports: "✅ Task 1.1 - 2 agents executed successfully on branch feature/us1.4a-migrate-test-suite"

**Example Todo List During Execution:**
- ✅ Discover and validate task files
- ✅ Parse frontmatter configuration
- ✅ Create feature branch: feature/us1.4a-migrate-test-suite
- ✅ ✓ QA: Branch creation successful
- ✅ Execute Task 1.1 with code-developer
- ✅ ✓ QA: Implementation agent completed successfully
- ✅ Validate Task 1.1 with application-tech-lead
- ✅ ✓ QA: Evaluation agent completed successfully
- ✅ Update Task 1.1 status in task file
- ✅ Mark Task 1.1 checkbox in user story
- ✅ ✓ QA: Task status and checkbox updated
- ✅ Check user story completion and update PRD status if complete
- ✅ ✓ QA: PRD status updated if applicable
- ⏳ Generate execution summary report
- ☐ ✓ QA: All workflow steps completed

### Example 2: Execute Multiple Tasks (Branch Already Exists)

```bash
/execute-tasks @tasks/02-2-1-convert-core-validation-tests-us1.4a.md @tasks/02-2-2-convert-enhanced-citation-tests-us1.4a.md
```

**Expected Workflow:**
1. Checks current branch → already on `feature/us1.4a-migrate-test-suite` (created from previous task execution)
2. Skips branch creation (already on correct feature branch)
3. Creates unified todo list for both tasks
4. Processes both files sequentially (implement + validate for each)
5. Updates task status and checkbox after each task completes
6. Checks if all user story tasks complete → updates PRD status if needed
7. Reports summary for both tasks

**Example Todo List:**
- ✅ Discover and validate all task files
- ✅ Parse frontmatter for all tasks
- ✅ Create/verify feature branch (skipped - already on correct branch)
- ✅ Execute Task 2.1 with test-writer
- ✅ Validate Task 2.1 with application-tech-lead
- ✅ Update Task 2.1 status and checkbox
- ✅ ✓ QA: Task 2.1 complete
- ⏳ Execute Task 2.2 with test-writer
- ☐ Validate Task 2.2 with application-tech-lead
- ☐ Update Task 2.2 status and checkbox
- ☐ ✓ QA: Task 2.2 complete
- ☐ Check user story completion and update PRD status if complete
- ☐ ✓ QA: PRD status updated if applicable
- ☐ Generate execution summary for all tasks
- ☐ ✓ QA: All tasks completed successfully

### Example 3: Execute All Tasks in Folder

```bash
/execute-tasks @tasks/
```

**Expected Workflow:**
1. Globs for all .md files in tasks/ folder
2. Filters to only files with agent frontmatter
3. **Before first task**: Creates feature branch from story frontmatter
4. Creates unified todo list with all tasks
5. Executes each task sequentially (implementation + validation for each)
6. Updates task status and checkbox after each task
7. Checks if all user story tasks complete → updates PRD status if needed
8. Reports comprehensive summary with branch name

</examples>
