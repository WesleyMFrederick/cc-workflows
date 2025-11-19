---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks in the current session - dispatches fresh subagent for each task with code review between tasks, enabling fast iteration with quality gates
---

# Subagent-Driven Development

Execute plan by dispatching fresh subagent per task, with code review after each.

**Core principle:** Fresh subagent per task + review between tasks = high quality, fast iteration

## Overview

**vs. Executing Plans (parallel session):**
- Same session (no context switch)
- Fresh subagent per task (no context pollution)
- Code review after each task (catch issues early)
- Faster iteration (no human-in-loop between tasks)

**When to use:**
- Staying in this session
- Tasks are mostly independent
- Want continuous progress with quality gates

**When NOT to use:**
- Need to review plan first (use executing-plans)
- Tasks are tightly coupled (manual execution better)
- Plan needs revision (brainstorm first)

## The Process

### 1. Load Plan

Read plan file, create TodoWrite with all tasks.

### 2. Execute Task with Subagent

For each task:

**Dispatch fresh subagent:**
- Use `haiku` model for subagent to use a lightweight llm model

```plaintext
Task tool (
 subagent_type: {{agent}} | general-purpose
  description: "Implement Task {{task-number}}: {{task name}}"
  prompt: |
    You are implementing Task {{task-number}} from {{plan-file-path}}.

    Use `citation extract header` tool to extract {{Task N}} context:

    ```bash
    npm run citation:extract:header {{plan-file-path}} {{task-number-section-header}}
    ```

    Your job is to:
    1. Navigate to and work in {{worktree directory | feature-branch if worktree missing}}
    2. Implement exactly what the task specifies
    3. Write tests (following TDD if task says to)
    4. Verify implementation works
    5. Commit your work
    6. Write results to {{results-file-path}}
    7. Report back

    DO NOT install dependencies - work with existing dependencies only.

    Write your results to: {{results-file-path}}

    Results format (markdown):
    # Task {{task-number}} - Implementation Results
    **Date:** {{date}}
    **Commit:** {{commit-sha}}

    ## What Was Implemented
    [Description + files created/modified with line counts]

    ## What Was Tested
    [Test files + test counts + test output]

    ## Verification
    - [ ] TypeScript compiles
    - [ ] Tests pass
    - [ ] Committed

    ## Files Changed
    [List absolute paths]

    ## Issues
    [Any blockers or "None"]

    Report back: Summary of what you implemented, test results, results file written
  model: haiku
```

**Subagent reports back** with summary of work.

### 3. Review Subagent's Work

**Dispatch code-reviewer subagent:**

```plaintext
Task tool (superpowers:code-reviewer):
  Review Task {{task-number}} implementation.

  Read implementation results from: {{results-file-path}}

  Extract task requirements using:
  ```bash
  npm run citation:extract:header {{plan-file-path}} {{task-number-section-header}}
  ```

  **BASE_SHA:** {{commit-before-task}}
  **HEAD_SHA:** {{current-commit}}

  Review the implementation against requirements.

  Write review results to: {{review-results-file-path}}

  Review format (markdown):
## Strengths
  [What was done well]

## Issues Found

### BLOCKING
  [Issues requiring application-tech-lead review - missing dependencies, technology additions, architectural changes not in plan]

### Critical
  [Blockers that must be fixed by dev]

### Important
  [Should fix before next task]

### Minor
  [Nice to have fixes]

## Assessment
  Status: READY / NEEDS WORK / NEEDS ARCHITECTURE REVIEW
  [Rationale]

  If BLOCKING issues found, escalate to application-tech-lead for architecture review.

  Report back: Review summary + status + results file written

```plaintext

**Code reviewer returns:** Strengths, Issues (Blocking/Critical/Important/Minor), Assessment

### 4. Apply Review Feedback

**If BLOCKING issues found:**
- Escalate to application-tech-lead immediately
- Tech lead reviews ARCHITECTURE docs, design plan, implement plan
- Tech lead suggests modifications to plans
- User validates changes before proceeding

**If Critical issues found:**
- Fix immediately with follow-up dev subagent

**If Important issues found:**
- Fix before next task

**If Minor issues found:**
- Note for later

**Dispatch follow-up subagent if needed:**

```plaintext
"Fix issues from code review: [list issues]"
```

### 5. Mark Complete, Next Task

- Mark task as completed in TodoWrite
- Move to next task
- Repeat steps 2-5

### 6. Final Review

After all tasks complete, dispatch final code-reviewer:
- Reviews entire implementation
- Checks all plan requirements met
- Validates overall architecture

### 7. Complete Development

After final review passes:
- Announce: "I'm using the finishing-a-development-branch skill to complete this work."
- **REQUIRED SUB-SKILL:** Use superpowers:finishing-a-development-branch
- Follow that skill to verify tests, present options, execute choice

## Example Workflow

```plaintext
You: I'm using Subagent-Driven Development to execute this plan.

[Load plan, create TodoWrite]

Task 1: Hook installation script

[Dispatch implementation subagent]
Subagent: Implemented install-hook with tests, 5/5 passing

[Get git SHAs, dispatch code-reviewer]
Reviewer: Strengths: Good test coverage. Issues: None. Ready.

[Mark Task 1 complete]

Task 2: Recovery modes

[Dispatch implementation subagent]
Subagent: Added verify/repair, 8/8 tests passing

[Dispatch code-reviewer]
Reviewer: Strengths: Solid. Issues (Important): Missing progress reporting

[Dispatch fix subagent]
Fix subagent: Added progress every 100 conversations

[Verify fix, mark Task 2 complete]

...

[After all tasks]
[Dispatch final code-reviewer]
Final reviewer: All requirements met, ready to merge

Done!
```

## Advantages

**vs. Manual execution:**
- Subagents follow TDD naturally
- Fresh context per task (no confusion)
- Parallel-safe (subagents don't interfere)

**vs. Executing Plans:**
- Same session (no handoff)
- Continuous progress (no waiting)
- Review checkpoints automatic

**Cost:**
- More subagent invocations
- But catches issues early (cheaper than debugging later)

## Red Flags

**Never:**
- Skip code review between tasks
- Proceed with unfixed Critical issues
- Dispatch multiple implementation subagents in parallel (conflicts)
- Implement without reading plan task

**If subagent fails task:**
- Dispatch fix subagent with specific instructions
- Don't try to fix manually (context pollution)

## Integration

**Required workflow skills:**
- **writing-plans** - REQUIRED: Creates the plan that this skill executes
- **requesting-code-review** - REQUIRED: Review after each task (see Step 3)
- **finishing-a-development-branch** - REQUIRED: Complete development after all tasks (see Step 7)

**Subagents must use:**
- **test-driven-development** - Subagents follow TDD for each task

**Alternative workflow:**
- **executing-plans** - Use for parallel session instead of same-session execution

See code-reviewer template: requesting-code-review/code-reviewer.md
