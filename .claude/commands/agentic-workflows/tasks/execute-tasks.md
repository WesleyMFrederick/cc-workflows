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

4. **Create Todo List**: Track each agent execution per task

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

### Step 5: Report Results

**Generate summary report:**

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

## Todo List Management

**Create initial todo list** with entries including branch creation and agent execution:

- Branch creation entry (first task only)
- Implementation agent execution entry (if agent defined)
- Validation agent execution entry (if agent defined)

**Update status in real-time:**
- Mark `in_progress` before launching agent or creating branch
- Mark `completed` when agent returns successfully or branch created
- Mark `failed` if agent reports errors or branch creation fails

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

## Examples

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
3. Creates todos: ["Execute Task 1.1 with code-developer-agent", "Validate Task 1.1 with application-tech-lead"]
4. Launches code-developer-agent with implementation prompt
5. Launches application-tech-lead with validation prompt
6. Reports: "✅ Task 1.1 - 2 agents executed successfully on branch feature/us1.4a-migrate-test-suite"

### Example 2: Execute Multiple Tasks (Branch Already Exists)

```bash
/execute-tasks @tasks/02-2-1-convert-core-validation-tests-us1.4a.md @tasks/02-2-2-convert-enhanced-citation-tests-us1.4a.md
```

**Expected Workflow:**
1. Checks current branch → already on `feature/us1.4a-migrate-test-suite` (created from previous task execution)
2. Skips branch creation (already on correct feature branch)
3. Processes both files sequentially
4. Reads frontmatter for each → finds `implementation-agent: "test-writer"`, `evaluation-agent: "application-tech-lead"`
5. Executes Task 2.1 (implement + validate)
6. Executes Task 2.2 (implement + validate)
7. Reports summary for both tasks

### Example 3: Execute All Tasks in Folder

```bash
/execute-tasks @tasks/
```

**Expected Workflow:**
1. Globs for all .md files in tasks/ folder
2. Filters to only files with agent frontmatter
3. **Before first task**: Creates feature branch from story frontmatter
4. Executes each task sequentially (implementation + validation for each)
5. Reports comprehensive summary with branch name

## Quality Assurance

**Before completing, verify:**
- [ ] Feature branch created for first task (if needed)
- [ ] All task files discovered and processed
- [ ] Frontmatter correctly parsed for each file
- [ ] Agents launched only if defined in frontmatter
- [ ] Todo list reflects actual execution status
- [ ] Final report includes all tasks with accurate status and branch name
- [ ] Error messages clear and actionable
- [ ] Implementation and validation notes populated in task files
