# Team Orchestration Workflow — Ideal Trace

> **Domain:** Claude Code Team / Multi-Agent Coordination
> **Date:** 2026-03-01
> **Derived from:** status-line-transcript-link implementation session (friction analysis)

---

## Artifacts

| Artifact | Role in Trace |
|----------|---------------|
| TeamCreate tool | Creates team + shared task list |
| Agent tool | Spawns sub-agents (coder, reviewer, committer) |
| TaskCreate / TaskUpdate | Task lifecycle management |
| SendMessage tool | Inter-agent communication + shutdown |
| `/commit` skill (`.claude/commands/git-and-github/git-create-commit.md`) | Delegated commit workflow |

---

## Ideal Trace

```text
TRACE: Team orchestration — spec implementation with code review (ideal state)
═══════════════════════════════════════════════════════════════════════════════

 USER REQUEST
 ────────────
 1. [C: user message]
    User provides: implementation spec + instruction to use team
    Orchestrator receives task

 ORCHESTRATOR: READ SPEC
 ───────────────────────
 2. [D: orchestrator action]
    Read: spec file, baseline, ideal, delta, target source files
    Purpose: understand full scope BEFORE creating tasks
    NOTE: orchestrator reads context to write good task descriptions,
          NOT to do the implementation work itself

 ORCHESTRATOR: CREATE TEAM
 ─────────────────────────
 3. [D: TeamCreate tool]
    Creates team with name + description
    Result: team config at ~/.claude/teams/{name}/config.json
            task list dir at ~/.claude/tasks/{name}/

 ORCHESTRATOR: CREATE TASKS
 ──────────────────────────
 4. [D: TaskCreate tool × N]
    Create tasks with clear descriptions including:
    ├── Task #1: Implement (RED→GREEN) — assigned to coder
    ├── Task #2: Review — assigned to reviewer, blockedBy: [1]
    └── Task #3: Commit — assigned to coder, blockedBy: [2]
    NOTE: commit is a TASK, not orchestrator work

 5. [D: TaskUpdate tool]
    Set dependencies: task #2 blockedBy #1, task #3 blockedBy #2

 ORCHESTRATOR → CODER (boundary crossing)
 ─────────────────────────────────────────
 6. [D: Agent tool]
    SPAWN ──→ coder agent (subagent_type: general-purpose)
    │
    │  Prompt includes:
    │  ├── Task #1 reference (TaskGet)
    │  ├── All file paths needed
    │  ├── TDD workflow (RED then GREEN)
    │  ├── Instruction: do NOT commit — mark task complete + message lead
    │  └── After task #1 done: check TaskList for next available work
    │
    │  CODER: EXECUTES TASK #1
    │  ────────────────────────
    │  6a. [D] Reads spec + source files
    │  6b. [D] Writes test (RED phase — expects failures)
    │  6c. [D] Runs test → confirms failures
    │  6d. [D] Implements changes (GREEN phase)
    │  6e. [D] Runs test → confirms all pass
    │  6f. [D] TaskUpdate: task #1 → completed
    │  6g. [D] SendMessage → team-lead: "Task #1 done, N/N tests pass"
    │
    RETURN ←── message notification to orchestrator

 ORCHESTRATOR: ROUTE TO REVIEWER
 ────────────────────────────────
 7. [D: orchestrator receives coder completion message]
    Action: TaskUpdate task #1 → completed (if not already)
    Task #2 is now unblocked

 8. [D: Agent tool]                                          ← KEY STEP
    SPAWN ──→ reviewer agent (subagent_type: code-reviewer)
    │
    │  Prompt includes:
    │  ├── Task #2 reference
    │  ├── Spec + delta file paths (for scope boundary check)
    │  ├── Script + test file paths
    │  ├── Review checklist from spec
    │  └── Verdict: report APPROVED or FIX_REQUIRED to team-lead
    │
    │  REVIEWER: EXECUTES TASK #2
    │  ───────────────────────────
    │  8a. [D] Runs test script → verifies all assertions pass
    │  8b. [D] Reads modified source → verifies boundary placement
    │  8c. [D] Reads delta → verifies scope boundary
    │  8d. [D] Checks risk mitigations
    │  8e. [D] TaskUpdate: task #2 → completed
    │  8f. [D] SendMessage → team-lead: "APPROVED" or "FIX_REQUIRED: {details}"
    │
    RETURN ←── verdict message to orchestrator

 ORCHESTRATOR: BRANCH ON VERDICT
 ────────────────────────────────
 9. [D: orchestrator receives reviewer verdict]

    ├── APPROVED → continue to step 10
    │
    └── FIX_REQUIRED → loop
        9a. [D] SendMessage → coder: "Reviewer found: {issues}. Fix and re-run tests."
        9b. [D] Coder fixes → messages back
        9c. [D] SendMessage → reviewer: "Coder fixed. Re-review."
        9d. [D] Reviewer re-reviews → messages back
        9e. [D] Max 2 cycles, then escalate to user
        GOTO step 9

 ORCHESTRATOR → CODER: COMMIT                               ← KEY STEP
 ─────────────────────────────────────────────────────────────
10. [D: SendMessage → coder]
    Message: "Reviewer approved. Commit using /commit skill.
    Files: {list from coder's earlier report}"
    │
    │  CODER: EXECUTES TASK #3
    │  ────────────────────────
    │  10a. [D] Uses /commit skill (git-create-commit.md)
    │  10b. [D] Skill handles: git status, diff, staging, commit message
    │  10c. [D] TaskUpdate: task #3 → completed
    │  10d. [D] SendMessage → team-lead: "Committed: {sha} {message}"
    │
    RETURN ←── commit confirmation to orchestrator

    NOTE: Orchestrator does NOT touch git.
    Orchestrator does NOT read diffs, stage files, or write commit messages.

 ORCHESTRATOR: SHUTDOWN + REPORT
 ───────────────────────────────
11. [D: SendMessage type: shutdown_request × N]
    Shut down: coder, reviewer (all agents)

12. [D: TeamDelete tool]
    Cleans up: team config + task list directories

13. [D: text output to user]
    Report: commit SHA, summary of what shipped, reviewer verdict

═══════════════════════════════════════════════════════════════════════════════
END TRACE
```

---

## Derived Facts

1. **[F-LK: from steps 2, 6, 8, 10]** The orchestrator reads source files exactly ONCE (step 2) to write task descriptions. All subsequent source reading is done by agents. The orchestrator never re-reads code after delegation.

2. **[F-LK: from steps 6g, 8f, 10d]** Every agent-to-orchestrator boundary crossing is a SendMessage. The orchestrator's decision logic is purely message-driven — it routes based on agent reports, not its own investigation.

3. **[F-LK: from step 10]** The commit is a delegated task, not orchestrator work. The coder agent uses the `/commit` skill which handles staging, diff analysis, and commit message generation — the same workflow a human would use.

4. **[F-LK: from step 9]** The fix loop has a max of 2 cycles before escalation. This prevents infinite review loops between coder and reviewer.

5. **[F-ID: from steps 4-5]** Task dependencies (blockedBy) enforce sequencing: code → review → commit. The orchestrator doesn't need to manually sequence — TaskUpdate handles unblocking.

---

## Anti-Patterns (observed in baseline session)

| Anti-Pattern | What Happened | Why It's Wrong |
|---|---|---|
| Orchestrator reads diff | Ran `git diff` after reviewer APPROVED | Duplicates reviewer's work; wastes orchestrator context |
| Orchestrator stages files | Ran `git add` | Implementation work — delegate to agent |
| Orchestrator commits | Ran `git commit` | Implementation work — delegate to agent with `/commit` skill |
| Orchestrator inspects code | Re-verified boundary placement | Reviewer already verified; orchestrator should trust verdict |
| No commit task | Commit wasn't in the task list | Commit is work — it needs a task so it can be delegated |
