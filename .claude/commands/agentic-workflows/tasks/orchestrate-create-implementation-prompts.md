---
argument-hint: "<user-story-file-path>" "[phase|wave|task-ids]"
---

# Orchestrate Create Implementation Prompts

## Usage
- `/orchestrate-create-implementation-prompts "path/to/us1.4b.md" "1a"` - Generate and evaluate prompts for wave 1a (parallel)
- `/orchestrate-create-implementation-prompts "path/to/us1.4b.md" "1.1,1.2,1.3"` - Generate and evaluate specific tasks (parallel)
- `/orchestrate-create-implementation-prompts "path/to/us1.4b.md"` - Generate and evaluate all tasks in story (parallel)

**Orchestrate parallel implementation prompt generation with architectural evaluation.** Each task runs its full workflow (generate → evaluate) in parallel. Within each task, prompt generation and evaluation execute serially.

## Input Validation
If no user story file path is provided ($1 is empty), respond with: "Error: Please provide a user story file path. Usage: /orchestrate-create-implementation-prompts '<user-story-file-path>' '[phase|wave|task-ids]'"

<story-file-input>
$1
</story-file-input>

<filter-input>
$2
</filter-input>

## Execution Model

### Parallel Task Execution
Each task identified by the filter runs its complete workflow **in parallel** with other tasks:

```text
Task 1.1: [Generate Prompt] → [Evaluate Prompt]  ─┐
Task 1.2: [Generate Prompt] → [Evaluate Prompt]  ├─ All run in parallel
Task 1.3: [Generate Prompt] → [Evaluate Prompt]  ─┘
```

### Serial Agent Execution Within Each Task
Within each task's workflow, execution is **serial**:
1. **Task Agent** (application-tech-lead): Generate implementation prompt file
2. **Eval Agent** (application-tech-lead): Evaluate generated prompt against architectural standards

## Orchestration Workflow

### Step 1: Parse Input & Discover Tasks

1. **Validate Story File**:
   - Read story file at $1 path
   - If file not found: `Error: Story file not found at path: {$1}`

2. **Parse Filter** ($2):
   - **Empty/Not Provided**: All tasks in story
   - **Wave Pattern** (e.g., "1a", "2b"): All tasks in that wave
   - **Phase Pattern** (e.g., "Phase 1", "1"): All tasks in that phase
   - **Task IDs** (e.g., "1.1,1.2,1.3"): Specific comma-separated task IDs

3. **Discover Tasks**:
   - Read story file task/subtask sections
   - Extract task metadata: task-id, wave, phase, task name, task anchor
   - Apply filter to build execution list
   - If no tasks match filter: `Error: No tasks found matching filter: {$2}`

4. **Create Todo List**:
   - One todo per task: "Process Task {task-id}: Generate and Evaluate"
   - Set all to pending initially

### Step 2: Launch Parallel Task Workflows

**CRITICAL**: Launch ALL task workflows in a SINGLE message with multiple Task tool calls. Each Task tool call coordinates one complete task workflow (generate → evaluate).

**For each task in execution list:**

Create one Task tool call with:
- **subagent_type**: `"application-tech-lead"`
- **description**: `"Process Task {task-id}: Generate and Evaluate Implementation Prompt"`
- **prompt**: See "Task Workflow Prompt Template" below

**Mark corresponding todo as `in_progress` before launching.**

### Step 3: Task Workflow Prompt Template

Each task agent receives this prompt:

```markdown
Execute implementation prompt generation and architectural evaluation for **Task {task-id}** from story file: `{story-file-path}`

## CRITICAL: Serial Execution Required

You MUST execute these steps in order. DO NOT proceed to Step 2 until Step 1 is complete.

### Step 1: Generate Implementation Prompt

Execute the `/agentic-workflows:tasks:create-implementation-prompt` slash command for this specific task:

```bash
/agentic-workflows:tasks:create-implementation-prompt "{story-file-path}" "{wave}" "{task-id}"
```

**Expected Output:**
- Implementation prompt file created in `tasks/` directory
- File follows naming pattern: `{phase}-{task}-{subtask}-{slug}-us{story}.md`
- Story file updated with bidirectional link to implementation file

**Capture the generated file path** for use in Step 2.

### Step 2: Evaluate Generated Prompt

Read the generated implementation prompt file and evaluate it against architectural standards.

**Evaluation Criteria:**

#### From Architecture Principles
Path: `/Users/wesleyfrederick/Documents/ObsidianVaultNew/0_SoftwareDevelopment/cc-workflows/design-docs/Architecture Principles.md`

Read this file and validate the generated prompt adheres to the software and architecture principles.

#### From Architecture Baseline (Testing Strategy)
Path: `/Users/wesleyfrederick/Documents/ObsidianVaultNew/0_SoftwareDevelopment/cc-workflows/design-docs/Architecture - Baseline.md`

Read the "Testing Strategy" section and validate the generated prompt adheres to the testing strategies.

#### Frontmatter Validation
**CRITICAL**: Verify the generated file has proper YAML frontmatter (required for `/execute-tasks` orchestration):

- [ ] File begins with `---` marker
- [ ] Contains all required fields: `story`, `epic`, `phase`, `task-id`, `task-anchor`, `wave`, `implementation-agent`, `evaluation-agent`, `status`
- [ ] Field values populated correctly (not placeholder text like "[User Story Title]")
- [ ] `status` field set to "ready"
- [ ] Agent fields specify appropriate agent types (e.g., "code-developer", "test-writer", "application-tech-lead")
- [ ] File ends frontmatter with `---` marker before content begins

#### Prime Directive Compliance
Verify the generated prompt follows all four Prime Directives from `/agentic-workflows:tasks:create-implementation-prompt`:

**Specific Validation Checks:**

1. **BEFORE/AFTER Code Blocks**:
   - [ ] Use MEDIUM-IMPLEMENTATION level (pattern structure, not complete code)
   - [ ] Show numbered decision points (// 1., // 2., // 3...)
   - [ ] Use `/* ... */` comments for implementation strategy
   - [ ] Avoid complete implementations (agent's job, not spec's job)

2. **Testing Approach** (if task involves tests):
   - [ ] Specifies BDD Given-When-Then structure
   - [ ] Uses integration testing approach (real dependencies)
   - [ ] Specifies factory usage for component creation OR constructor DI with real components
   - [ ] Avoids mocking application components
   - [ ] Includes executable validation commands

3. **Scope Boundaries**:
   - [ ] Explicitly defines what's OUT OF SCOPE with ❌ markers
   - [ ] Provides anti-pattern examples showing scope violations
   - [ ] Includes git-based validation commands for scope adherence

4. **Code Quality**:
   - [ ] Follows naming conventions (kebab-case files, PascalCase classes, camelCase functions)
   - [ ] Includes fail-fast error handling patterns
   - [ ] Specifies clear contracts and preconditions

### Step 3: Report Results

Provide a structured report with:

```markdown
## Task {task-id} - {task-name}

### Generation Phase
✅/❌ **Status**: {SUCCESS/FAILED}
📄 **File**: {generated-file-path}
📏 **Size**: ~{line-count} lines

### Evaluation Phase

#### Architectural Compliance
[Populate with compliance issues. 3-10 sentences]

#### Prime Directive Compliance
- **#1 Focused Context**: ✅/❌
- **#2 Trust-Based Spec**: ✅/❌
- **#3 Executable Validation**: ✅/❌
- **#4 Lean Template**: ✅/❌

#### Issues Found
{List specific violations with file line references, or "None" if all checks pass}

#### Recommendations
{Actionable fixes needed, or "Ready for implementation" if all checks pass}

### Overall Verdict
**PASS** / **NEEDS REVISION**
```

```text
**End of Task Workflow Prompt Template**

### Step 4: Aggregate Results

After ALL parallel Task tool calls complete:

1. **Parse Agent Responses**:
   - Extract generation status (success/failed)
   - Extract evaluation verdict (PASS/NEEDS REVISION)
   - Extract issues and recommendations
   - Mark corresponding todos as `completed` or `failed`

2. **Generate Summary Report**:

```markdown
## Orchestration Summary

**Story**: {story-title}
**Filter**: {filter-description}
**Tasks Processed**: {count} (in parallel)

### Results by Task

{For each task, include agent's structured report}

### Overall Results
- ✅ **Passed**: {pass-count}
- ❌ **Needs Revision**: {needs-revision-count}
- ⚠️ **Failed Generation**: {failed-count}

### Next Steps
{Context-aware recommendations based on results}
```

## Error Handling

### If Story File Not Found

```text
❌ Error: Story file not found at path: {$1}
Please verify the file path and try again.
```

### If No Tasks Match Filter

```text
❌ Error: No tasks found matching filter: {$2}

Available tasks in story:
- Task 1.1 (Wave 1a)
- Task 1.2 (Wave 1a)
- Task 2.1 (Wave 2a)
...

Usage: /orchestrate-create-implementation-prompts '{story-path}' '[wave|phase|task-ids]'
```

### If Task Agent Fails

```text
❌ Task {task-id} - Generation Failed
Error: {error-message}

Continuing with remaining tasks...
```

### If Citation Manager Fails

```text
⚠️ Warning: Citation manager failed for Task {task-id}. Generated prompt may lack architectural context.
```

## Example Scenarios

### Example 1: Generate and Evaluate All Wave 1a Tasks (Parallel)

**Command:**

```bash
/orchestrate-create-implementation-prompts "tools/citation-manager/design-docs/features/20251003-content-aggregation/user-stories/us1.4b-refactor-components-for-di/us1.4b-refactor-components-for-di.md" "1a"
```

**Execution:**
1. Discovers 3 tasks in Wave 1a: 1.1, 1.2, 1.3
2. Creates 3 todos (all pending)
3. Launches 3 parallel Task tool calls in SINGLE message:
   - Task 1.1: application-tech-lead (generate → evaluate)
   - Task 1.2: application-tech-lead (generate → evaluate)
   - Task 1.3: application-tech-lead (generate → evaluate)
4. Each agent executes serially: `/agentic-workflows:tasks:create-implementation-prompt` → evaluation
5. Aggregates results and reports overall compliance

**Expected Output:**

```markdown
## Orchestration Summary

**Story**: US1.4b - Refactor Components for DI
**Filter**: Wave 1a
**Tasks Processed**: 3 (in parallel)

### Task 1.1 - Refactor CitationValidator for Constructor DI
✅ Generation: SUCCESS
📄 File: tasks/01-1-1-refactor-citation-validator-constructor-di-us1.4b.md
**Evaluation**: PASS
- All architectural principles: ✅
- All prime directives: ✅

### Task 1.2 - Refactor MarkdownParser for Constructor DI
✅ Generation: SUCCESS
📄 File: tasks/01-1-2-refactor-markdown-parser-constructor-di-us1.4b.md
**Evaluation**: NEEDS REVISION
Issues:
- Missing BDD Given-When-Then structure in test examples
- Factory pattern not clearly specified (line 145)

### Task 1.3 - Refactor FileCache for Constructor DI
✅ Generation: SUCCESS
📄 File: tasks/01-1-3-refactor-file-cache-constructor-di-us1.4b.md
**Evaluation**: PASS

### Overall Results
- ✅ Passed: 2
- ❌ Needs Revision: 1

### Next Steps
- Review Task 1.2 and address BDD structure and factory pattern issues
- Tasks 1.1 and 1.3 are ready for implementation
```

### Example 2: Generate and Evaluate Specific Tasks (Parallel)

**Command:**

```bash
/orchestrate-create-implementation-prompts "path/to/story.md" "1.1,2.3,3.1"
```

**Execution:**
1. Parses comma-separated task IDs: 1.1, 2.3, 3.1
2. Discovers 3 tasks across different waves/phases
3. Launches 3 parallel workflows
4. Each executes generate → evaluate serially
5. Reports results

### Example 3: Generate and Evaluate All Tasks in Story (Parallel)

**Command:**

```bash
/orchestrate-create-implementation-prompts "path/to/story.md"
```

**Execution:**
1. No filter provided → processes ALL tasks in story
2. Discovers N tasks
3. Launches N parallel workflows
4. Aggregates all results

## Quality Checklist

Before completing, verify:
- [ ] Story file successfully read and parsed
- [ ] Filter correctly applied (wave/phase/task-ids)
- [ ] All tasks launched in SINGLE message (parallel execution)
- [ ] Each task agent executes generate → evaluate serially
- [ ] Architectural evaluation includes both Principles and Baseline docs
- [ ] Prime Directive compliance validated for each generated prompt
- [ ] Todos reflect actual execution status (completed/failed)
- [ ] Summary report includes all tasks with clear verdicts
- [ ] Actionable recommendations provided for tasks needing revision
- [ ] Error messages clear and helpful

## Integration Notes

This orchestrator complements the existing workflow:
- **`/agentic-workflows:tasks:create-implementation-prompt`**: Direct single-task execution (no evaluation)
- **`/agentic-workflows:tasks:orchestrate-create-implementation-prompts`**: Orchestrated multi-task execution with architectural validation
- **`/agentic-workflows:tasks:execute-tasks`**: Implementation execution after prompts are validated

**Recommended Workflow:**
1. Use this orchestrator to generate and validate all task prompts
2. Address any "NEEDS REVISION" feedback
3. Use `/agentic-workflows:tasks:execute-tasks` to run the validated implementation prompts
