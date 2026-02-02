# Agent Output Capture — Phase 1 Whiteboard

> **Feature:** Agent Output Capture
> **Phase:** Discovery / Elicitation / Sense-Making
> **Date:** 2026-02-02
> **Session:** c0b6ce1f-7229-4f77-96cd-4e11e62cf6e7

---

## Problem Statement

Agent output lives only in JSONL transcript — not accessible, not resumable,
not surfaceable. Cannot resume agent work across sessions without re-exploring.
No way to feed agent activity to statusline, status files, or new sessions.

---

## Session Discoveries

### JSONL Transcript Schema

**Location:** `~/.claude/projects/{project-hash}/{session-id}.jsonl`

Each line is a JSON object. Agent entries have this structure:

```json
{
  "type": "progress",
  "data": {
    "message": {
      "type": "assistant|user",
      "message": {
        "role": "assistant",
        "content": [
          { "type": "text", "text": "..." },
          { "type": "tool_use", "id": "...", "name": "Bash", "input": {} }
        ]
      }
    },
    "type": "agent_progress",
    "prompt": "original prompt to agent",
    "agentId": "a0b22a5"
  },
  "toolUseID": "agent_msg_...",
  "parentToolUseID": "toolu_...",
  "sessionId": "c0b6ce1f-...",
  "slug": "vivid-bouncing-spindle"
}
```

**Key fields for extraction:**

| Field | Purpose |
|---|---|
| `data.agentId` | Unique agent identifier, used for resume |
| `data.prompt` | Original prompt sent to agent |
| `data.message.type` | `"assistant"` (agent output) vs `"user"` (tool results) |
| `data.message.message.content[]` | Array of text/tool_use blocks |
| `data.type` | `"agent_progress"` identifies agent entries |
| `parentToolUseID` | Links agent to parent Task tool call |
| `toolUseID` | Identifies the specific agent message |

**Tool result entries** (user type) contain:

```json
{
  "content": [
    { "type": "tool_result", "tool_use_id": "...", "content": "output text" }
  ]
}
```

### Extraction Attempts and Corrections

**Attempt 1 (Failed):** Node.js script filtering `agent_progress` assistant
entries for text blocks. Captured only 134 chars because ALL assistant
`agent_progress` entries contain ONLY `tool_use` blocks — no `text` blocks.

**Attempt 2 (Failed):** jq filtering `agent_progress` + assistant + text.
Same problem — zero output.

**Key Discovery:** Agent text output is NOT in `agent_progress` entries.
It arrives as a `tool_result` in the **parent conversation**, matching
the `tool_use_id` of the original Task tool call.

### Correct Extraction Architecture (Two Data Paths)

**Path 1 — Agent final output (the report):**

```text
Top-level type=="assistant" entries
  → content[] where type=="tool_use" AND name=="Task"
  → capture tool_use.id

Top-level type=="user" entries
  → content[] where type=="tool_result" AND tool_use_id matches
  → .content[].text = the full agent report
```

**Path 2 — Agent activity (internal tool usage):**

```text
type=="progress" + data.type=="agent_progress" entries
  → Shows tool_use blocks the agent executed internally
  → Useful for understanding HOW the agent worked, not WHAT it concluded
```

### Working Script

Reference implementation: `extract-agent-output.sh` (in this folder)

- Finds all Task tool calls in assistant entries
- Matches their tool_use_id to tool_result entries
- Extracts full text content from each agent
- Tested: 3 agents, 50KB total output from real transcript

**Extracted research data:** [[research/agent-output-c0b6ce1f|Session c0b6ce1f Agent Output]]

### Research: everything-claude-code Continuous Learning

**Key findings:**

1. **Session files are EMPTY templates** — session-end.js creates placeholder,
   nothing auto-populates Current State/Completed/In Progress sections
2. **Stop hook runs EVERY response** — not "once per session" as guide claims
3. **SessionEnd hook** is correct for session termination (official Anthropic)
4. **SubagentStop hook** exists — fires when subagent (Task tool) completes
5. **Hook output routing:**
   - SessionEnd: stderr to debug only, Claude never sees it
   - SessionStart: stdout added as context to Claude
   - Stop: exit code 2 stderr goes to Claude, blocks stopping
6. **Continuous learning v2** uses hooks for 100% reliable observation
   (PreToolUse/PostToolUse -> observations.jsonl -> background Haiku analysis)
7. **Instincts** = atomic learned behaviors with confidence scores (0.3-0.9)
8. **Evolution** = clustering instincts into skills/commands/agents

---

## Functional Requirements (Brainstorm-Level)

- **FR1:** Auto-capture agent output on SubagentStop hook
- **FR2:** Store output as formatted markdown in project
- **FR3:** Link output to feature/plan/focus topic AND session ID
- **FR4:** Enable resume — load agent context in new session
- **FR5:** Feed statusline and current-status.json with agent activity
- **FR6:** Extract transcript schema for reuse by other tools

---

## Architecture Principles Alignment

| Principle | Alignment |
|---|---|
| **Deterministic Offloading** ^mechanical-separation | Hook = deterministic capture, LLM = semantic summary |
| **Data-First** ^data-model-first | Define transcript schema and agent output schema BEFORE building tools |
| **MVP** ^mvp-first | Start with SubagentStop -> markdown file |
| **Modular** ^single-responsibility | Hook (capture) separate from formatter (output) separate from loader (resume) |
| **Safety-First** ^error-recovery | Don't lose agent work if hook fails |

---

## Open Questions

- What fields from JSONL are needed for resume vs. archive?
- How to link agent output to feature/plan? Filename? Metadata header?
- Should hook produce raw extraction or summarized output?
- How does current-status.json integrate?
- What's the MVP scope boundary?
- Where should extracted files live? Per-feature? Per-session? Central?

---

## Next Steps

1. ✅ ~~Validate extraction script against real transcript data~~ — Complete
2. Define output schema (what the markdown file looks like)
3. Design SubagentStop hook integration
4. Define MVP scope boundary for Phase 2 (requirements)
