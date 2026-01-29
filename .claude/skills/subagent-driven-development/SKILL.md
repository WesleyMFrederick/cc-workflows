---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks in the current session - dispatches fresh subagent for each task with code review between tasks, enabling fast iteration with quality gates
---

# Subagent-Driven Development

Execute plan by dispatching fresh subagent per task, with code review after each.

**Core principle:** Fresh subagent per task + review between tasks = high quality, fast iteration

**Autonomy principle:** Execute ALL tasks without stopping for user input. Only stop on 3 consecutive errors OR all tasks complete. Commits, reviews, and fixes are subagent responsibilities — orchestrator never pauses to ask permission.

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

**File Organization:**
- Task result files save to `{{epic-or-user-story-folder}}/tasks/` subfolder
- This pattern applies to BOTH epic-level (`epic{{X}}-{{name}}/tasks/`) AND user-story-level (`us{{X.Y}}-{{name}}/tasks/`) implementations

### 1. Load Plan

- Read plan file if not in context window
- Check it Task list exists for plan
  - Validate tasks align with plan
  - If task list does not exist, use `/decompose-plan` skill

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
    6. Clean up test processes (MANDATORY - see below)
    7. Write results to file
    8. Report back

    CRITICAL - Test Process Cleanup (Step 6):
    Before writing results, you MUST clean up any test processes you spawned:

    ```bash
    # Check for running vitest processes
    ps aux | grep -i vitest | grep -v grep

    # If any found, kill them
    pkill -f "vitest" || true

    # Verify cleanup succeeded (should return nothing)
    ps aux | grep -i vitest | grep -v grep
    ```

    NEVER skip this step. Orphaned test processes consume ~14GB memory each.

    CRITICAL: Write your results to {{epic-or-user-story-folder}}/tasks/task-{{task-number}}-dev-results.md with:
    - Model used for implementation
    - Task number and name
    - What you implemented
    - Tests written and test results
    - Files changed
    - Any issues encountered
    - Commit SHA

    Report: Summary + confirm results file written
  model: haiku
```

**Subagent reports back** with summary and results file location.

### 3. Review Subagent's Work

**Dispatch code-reviewer subagent:**

```plaintext
Task tool (superpowers:code-reviewer):
  Use template at requesting-code-review/code-reviewer.md

  prompt: |
    You are reviewing Task {{task-number}} implementation.

    MANDATORY: Use the `elements-of-style:writing-clearly-and-concisely` skill when writing your review.

    CRITICAL: This is a task-level review. Be concise.
    - Target 10-30 lines for approved tasks
    - Target 30-80 lines for tasks with issues

    CRITICAL: Extract task context from plan using citation tool:

    ```bash
    citation-manager extract header {{plan-file-path}} "{{task-header-name}}"
    ```

    Read implementation results:
    - Dev results: {{epic-or-user-story-folder}}/tasks/task-{{task-number}}-dev-results.md

    Your job:
    1. Read plan task to understand requirements
    2. Read dev results to understand what was implemented
    3. Review code changes (BASE_SHA to HEAD_SHA)
    4. Identify issues (BLOCKING/Critical/Important/Minor)
    5. Clean up test processes (MANDATORY - see below)
    6. Write concise review results

    CRITICAL - Test Process Cleanup (Step 5):
    Before writing results, you MUST clean up any test processes you spawned:

    ```bash
    # Check for running vitest processes
    ps aux | grep -i vitest | grep -v grep

    # If any found, kill them
    pkill -f "vitest" || true

    # Verify cleanup succeeded (should return nothing)
    ps aux | grep -i vitest | grep -v grep
    ```

    NEVER skip this step. Orphaned test processes consume ~14GB memory each.

    CRITICAL: Write concise review to {{epic-or-user-story-folder}}/tasks/task-{{task-number}}-review-results.md with:
    - Model used for review
    - Brief summary (1-2 sentences)
    - Issues (only include categories with actual issues)
    - Verdict: APPROVED or FIX REQUIRED

    CRITICAL VERDICT RULE: If you found ANY issues (BLOCKING/Critical/Important/Minor), you MUST set verdict to FIX REQUIRED. NEVER approve tasks that have documented issues.

    Keep it brief:
    - Skip "Strengths" section for approved tasks (ZERO issues)
    - Skip empty issue categories (don't write "Critical: None")
    - No comprehensive analysis - this is task-level, not PR-level

    BASE_SHA: [commit before task]
    HEAD_SHA: [current commit]
```

**Code reviewer returns:** Summary + review results file location.

### 3a. Cleanup Background Processes

**MANDATORY: After each task review, before proceeding to fixes.**

Subagents may spawn vitest test processes (watch mode, UI mode) that don't cleanup automatically. Each orphaned process consumes ~14GB memory.

**Check for orphaned processes:**

```bash
# Check for running vitest processes
ps aux | grep -i vitest | grep -v grep
```

**If vitest processes found:**

```bash
# Kill vitest processes
pkill -f "vitest" || true

# Verify cleanup succeeded
ps aux | grep -i vitest | grep -v grep
# Should return nothing
```

**VERIFICATION REQUIRED:** Process list must be empty before proceeding to Step 4.

**Common sources:**
- Subagent used `npm run test:watch` instead of `npm test`
- Subagent ran tests in background without cleanup
- Test failures left worker processes hanging

**Red flags indicating you're about to skip this:**
- "No processes showing up now" → Verify EVERY time, evidence before assumptions
- "Cleanup can wait until end" → 14GB × 4 processes × N tasks = exponential waste
- "forceExit handles this" → Only works when vitest completes normally, not watch/UI modes
- "Process will timeout eventually" → No timeout configured, runs indefinitely

### 4. Apply Review Feedback

**If BLOCKING issues found:**
- See section 4a below (requires app-tech-lead escalation)
- Do NOT proceed to section 4b until BLOCKING resolved

**If Critical/Important/Minor issues found:**
- See section 4b below (standard fix workflow)

### 4a. Handle Blocking Issues (Architectural Decisions)

**CRITICAL: BLOCKING issues MUST be resolved by app-tech-lead subagent. NEVER escalate to user.**

**Foundational principle:** Architectural decisions require research, principle evaluation, and documentation. App-tech-lead subagent provides this. User escalation without context and recomendations breaks the workflow and annoys ceo/user by asking for their attention when you could do research to clarify the issue yourself. Once App-tech-lead does research and a MAJOR change is needed, then involve the user. Otherwise provide additional context to fixing agent.

Code-reviewer may identify BLOCKING when:
- Implementation made architectural choice not specified in plan
- Multiple valid approaches exist, choice affects codebase architecture
- Decision requires evaluation against architecture principles
- Cannot be "fixed" with code changes alone

**When code-reviewer returns BLOCKING issues:**

1. **MANDATORY - Launch `application-tech-lead` subagent**

   You MUST launch `application-tech-lead`. This is NOT optional. This is NOT a suggestion.

   **DO NOT:**
   - ❌ Ask user "What should I do?"
   - ❌ Ask user "Is Redux OK?"
   - ❌ "Escalate to user for architectural decision"
   - ❌ "Present options to user and wait for their choice"
   - ❌ Dispatch fix subagent to "just pick one"
   - ❌ Proceed to next task

   **Why NO user escalation:**
   - User expects app-tech-lead to handle architectural decisions
   - App-tech-lead provides research, evaluation, documentation
   - User escalation = undocumented decision without principle evaluation
   - Interrupts workflow unnecessarily

2. **Launch `application-tech-lead` with this task:**

   ```plaintext
   Task tool (application-tech-lead):
     description: "Resolve blocking architectural decision from Task N"
     prompt: |
       A code review identified a blocking architectural decision for Task {{task-number}}.

       CRITICAL: Extract task context from plan using citation tool:

       ```bash
       citation-manager extract header {{plan-file-path}} "{{task-header-name}}"
       ```

       Read context files:
       - Dev results: {{epic-or-user-story-folder}}/tasks/task-{{task-number}}-dev-results.md
       - Review results: {{epic-or-user-story-folder}}/tasks/task-{{task-number}}-review-results.md

       BLOCKING ISSUE:
       [paste full BLOCKING issue from code-reviewer]

       Your job:
       1. Read plan task to understand context
       2. Read dev results to understand what was implemented
       3. Read review results to understand the blocking issue
       4. Read architecture documentation to understand context
       5. Read PRD to understand requirements and scope
       6. Research options using Perplexity with "{{query}} best practices 2025"
       7. Evaluate options against architecture principles using evaluate-against-architecture-principles skill
       8. Update implementation plan with specific choice
       9. Write decision document
       10. Report back

       CRITICAL: Write your decision to {{epic-or-user-story-folder}}/tasks/task-{{task-number}}-arch-decision.md with:
       - Task number and name
       - Decision date
       - BLOCKING issue summary
       - Options considered (2-3 options minimum)
       - Evaluation against architecture principles
       - Perplexity research findings
       - Recommendation with clear rationale
       - Plan update confirmation

       Critical: Your decision must be grounded in architecture principles, not just "best practice" popularity.
   ```

3. **After `application-tech-lead` returns:**
   - Review decision rationale
   - Verify plan updated with specific choice
   - Determine if change is MAJOR (see criteria below)

   **MAJOR Change Criteria:**
   - Adds new external dependency/library
   - Changes fundamental architecture pattern (state management, data flow, auth)
   - Adds new infrastructure (database, cache, queue)
   - Switches frameworks or core technologies
   - Impacts bundle size significantly (>10KB)
   - Requires team learning curve
   - High migration cost if reversed

   **If MAJOR change:**
   - Present decision to CEO/user with full context:
     - Options evaluated
     - Architecture principle evaluation
     - Perplexity research findings
     - App-tech-lead recommendation
     - Impact summary (bundle size, learning curve, migration cost)
   - Wait for CEO approval before proceeding
   - If approved: Continue to implementation
   - If rejected: Ask app-tech-lead to reconsider with CEO feedback

   **If minor change (built-in APIs, internal refactoring, no new dependencies):**
   - Proceed autonomously to implementation

   **Then proceed to implementation:**
   - Either: Approve existing implementation (if matches decision)
   - Or: Dispatch fix subagent to implement chosen approach
   - Re-run code-reviewer to verify BLOCKING resolved

4. **Then proceed to section 4b** for any remaining Critical/Important/Minor issues

### 4b. Handle Standard Issues (Implementation Fixes)

**If Critical/Important/Minor issues found:**
- Fix Critical issues immediately
- Fix Important issues before next task
- Note Minor issues

**Orchestrator Dynamic Decision (YOU):**

Before dispatching fix agent, determine which files to include:

1. Check if `task-{{task-number}}-arch-decision.md` exists (BLOCKING was resolved)
2. Build file list for fix agent:
   - Always include: plan task, dev results, review results
   - Conditionally include: arch decision (if exists)

**Dispatch follow-up subagent with context files:**

```plaintext
Task tool (general-purpose):
  description: "Fix Task {{task-number}} issues from review"
  prompt: |
    You are fixing issues found in code review for Task {{task-number}}.

    CRITICAL: Extract task context from plan using citation tool:

    ```bash
    citation-manager extract header {{plan-file-path}} "{{task-header-name}}"
    ```

    Read context files:
    - Plan task (via citation extraction above)
    - Dev results: {{epic-or-user-story-folder}}/tasks/task-{{task-number}}-dev-results.md
    - Review results: {{epic-or-user-story-folder}}/tasks/task-{{task-number}}-review-results.md
    {{#if arch-decision-exists}}
    - Arch decision: {{epic-or-user-story-folder}}/tasks/task-{{task-number}}-arch-decision.md
    {{/if}}

    Issues to fix:
    [paste issues from review-results.md]

    Your job:
    1. Read plan task to understand requirements
    2. Read dev results to understand what was implemented
    3. Read review results to understand issues
    {{#if arch-decision-exists}}
    4. Read arch decision to understand architectural choice
    5. Implement fixes following architectural decision
    {{else}}
    4. Implement fixes for all issues
    {{/if}}
    6. Verify fixes work (run tests)
    7. Commit your work
    8. Write fix results

    CRITICAL: Write your results to {{epic-or-user-story-folder}}/tasks/task-{{task-number}}-fix-results.md with:
    - Task number and name
    - Issues addressed
    - Changes made
    - Test results
    - Files changed
    - Commit SHA

    Report: Summary + confirm results file written
  model: haiku
```

### 5. Mark Complete, Next Task

- Mark task as completed in Task tool
- Reset consecutive error counter to 0
- Move to next task immediately — do NOT pause for user input
- Repeat steps 2-5

## Autonomous Execution Rules

### Never Stop For

- Commit confirmation ("ready to commit?")
- Task completion acknowledgment ("task done, proceed?")
- Review results sharing (just log and continue)
- Minor/Important issues (fix and continue)

### Stop Only When

1. **All tasks complete** — normal exit
2. **3 consecutive task failures** — subagent fails same task 3 times after fix attempts
3. **MAJOR architectural decision** — requires CEO approval (see 4a)

### Error Tracking

Track consecutive failures per task:

```text
consecutive_errors = 0

For each task:
  dispatch subagent → review
  if review = APPROVED:
    consecutive_errors = 0
    next task
  if review = FIX REQUIRED:
    dispatch fix → re-review
    if re-review = APPROVED:
      consecutive_errors = 0
      next task
    else:
      consecutive_errors += 1
      if consecutive_errors >= 3:
        STOP — report failures to user
      else:
        attempt fix again
```

### Rationalizations for Stopping Early (REJECT These)

| Excuse | Reality |
|--------|---------|
| "Let me check with user first" | You have the plan. Execute it. |
| "Ready to commit?" | Commits are subagent responsibility. Keep going. |
| "Should I proceed?" | Yes. Always. Until done or 3 errors. |
| "User might want to review" | Code reviewer subagent handles review. Keep going. |
| "This task was complex, pause" | Complexity is not a stop condition. Next task. |

### 6. Final Review

After all tasks complete, dispatch final `code-reviewer`:
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

Task 4.1.1: Validation script

[Dispatch implementation subagent]
Subagent: Implemented validation script with 7 checkpoints, wrote task-4.1.1-dev-results.md

[Get git SHAs, dispatch code-reviewer]
Reviewer: Read task-4.1.1-dev-results.md, wrote task-4.1.1-review-results.md
         Strengths: Good test coverage. Issues: None. Ready.

[Mark Task 4.1.1 complete]

Task 4.1.2: Type library

[Dispatch implementation subagent]
Subagent: Created citationTypes.ts, wrote task-4.1.2-dev-results.md

[Dispatch code-reviewer]
Reviewer: Read task-4.1.2-dev-results.md, wrote task-4.1.2-review-results.md
         Issues (BLOCKING): No architectural decision on type organization pattern

[Launch app-tech-lead]
App-tech-lead: Evaluated options, wrote task-4.1.2-arch-decision.md
               Recommendation: Colocation pattern (minor change)

[Check: arch decision exists, minor change - proceed autonomously]

[Dispatch fix subagent with arch decision file]
Fix agent: Read arch decision, reorganized types, wrote task-4.1.2-fix-results.md

[Dispatch code-reviewer for fixes]
Reviewer: BLOCKING resolved, implementation matches decision. Approved.

[Mark Task 4.1.2 complete]

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
- Stop to ask user "ready to commit?" or "should I proceed?"
- Pause between tasks for user acknowledgment
- Skip code review between tasks
- Skip process cleanup after task review (Step 3a)
- Proceed with unfixed Critical issues
- Dispatch multiple implementation subagents in parallel (conflicts)
- Implement without reading plan task

**Process cleanup rationalizations to reject:**
- "No processes showing up now" → Verify EVERY time with evidence
- "Cleanup can wait until end" → Memory waste compounds across tasks
- "forceExit handles this" → Only works when vitest exits normally
- "Process will timeout eventually" → No timeout configured, runs indefinitely

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
