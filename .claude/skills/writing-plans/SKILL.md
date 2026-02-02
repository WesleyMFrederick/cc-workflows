---
name: writing-plans
description: Use when design is complete and you need detailed implementation tasks for engineers with zero codebase context - creates comprehensive implementation plans with exact file paths, complete code examples, and verification steps assuming engineer has minimal domain knowledge
---

<!-- markdownlint-disable-file MD048 -->
# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."
**Save plans to:** [Save implementation plan to the epic/user-story folder. If an implement plan already exists for the epic or user story, use that file by overwriting the placeholder text. If no plan exists, create a new one. Display location to user]

## Required Pre-Flight Checklist
1. Make sure [test-driven-development skill](../test-driven-development/SKILL.md) %% force-extract %% is in your context window
2. Make sure [sub-agent-driven-development](../subagent-driven-development/SKILL.md) %% force-extract %% is in your contenxt window

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

<critical-instruction>
## CRITICAL: Present Tasks To User
1. Present the list of tasks to user, along with a 1 sentence description of the task
2. Use the `AskUserTool` to your partner if they approve the tasks
3. I will be disappointed if you start writing an implement plan before presenting me a list of tasks
</critical-instruction>

## Plan Document Header

**Every plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
```

## Task Structure

~~~markdown
## Task {{task-number}} - {{task-name}}

### Files
- `exact/path/to/file.py` (CREATE)
- `exact/path/to/existing.py:123-145` (MODIFY)
- `tests/exact/path/to/test.py` (CREATE & TEST)

### Step 1: Write the failing test

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

### Step 2: Run test to verify it fails

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

### Step 3: Write minimal implementation

```python
def function(input):
    return expected
```

### Step 4: Run test to verify it passes

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

### Step 5: Commit
Use `create-git-commit` skill to commit

~~~

## Remember
- Exact file paths always
- Complete code in plan (not "add validation")
- Exact commands with expected output
- Reference relevant skills with @ syntax
- DRY, YAGNI, TDD, frequent commits

## Execution Handoff

After saving the plan, offer execution choice:

**"Plan complete and saved to `{{implement-plan-path}}`. Ready to execute?**

**1. Set up implementation worktree** - Create isolated workspace for this implementation

**2. Execute in this session (Subagent-Driven)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**3. Execute in parallel session** - Open new session with executing-plans, batch execution with checkpoints

**If Worktree Setup chosen:**
- **REQUIRED SUB-SKILL:** Use using-git-worktrees
- After worktree created, offer execution options again:
  - Execute now in this session (Subagent-Driven)
  - Execute later in new session (Parallel Session)

**If Subagent-Driven chosen:**
- **REQUIRED SUB-SKILL:** Use subagent-driven-development
- Stay in this session
- Fresh subagent per task + code review

**If Parallel Session chosen:**
- Guide them to open new session in worktree
- **REQUIRED SUB-SKILL:** New session uses executing-plans
