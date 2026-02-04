---
name: observer
description: Background agent that analyzes session observations to detect patterns and create instincts. Uses Haiku for cost-efficiency.
model: haiku
run_mode: background
---

# Observer Agent

A background agent that analyzes observations from Claude Code sessions to detect patterns and create instincts.

## When to Run

- After significant session activity (20+ tool calls)
- On a scheduled interval (configurable, default 5 minutes)
- When triggered by observation hook (SIGUSR1)

## Configuration

### YAML Frontmatter Fields

The agent configuration uses the following frontmatter fields:

| Field | Type | Valid Values | Description |
|-------|------|--------------|-------------|
| `name` | string | observer | Agent identifier (required) |
| `description` | string | Any text | Human-readable description (required) |
| `model` | string | `haiku`, `sonnet`, `opus` | LLM model to use; haiku recommended for cost-efficiency |
| `run_mode` | string | `background`, `foreground`, `on-demand` | Execution mode; background = async, foreground = blocks session, on-demand = triggered manually |

### Field Behavior

- **model:** Determines which Claude model executes the observer analysis. `haiku` is recommended for cost-efficiency; `sonnet` for higher accuracy; `opus` for complex pattern analysis.
- **run_mode:** Controls when the observer executes:
  - `background` — runs asynchronously without blocking active sessions
  - `foreground` — blocks the session until analysis completes
  - `on-demand` — only runs when explicitly triggered

### Invalid Configuration

If invalid values are provided, Task 2 (start-observer.sh) will:
1. Validate against the specification above
2. Reject the configuration with an error message
3. Fail startup until valid values are supplied

## Input

Reads observations from `$CLAUDE_PROJECT_DIR/.claude/learned/observations.jsonl` (example format):

    {"timestamp":"2025-02-10T10:30:00Z","event":"tool_start","session":"abc123","tool":"Edit","input":"..."}
    {"timestamp":"2025-02-10T10:30:01Z","event":"tool_complete","session":"abc123","tool":"Edit","output":"..."}

## Pattern Detection

Look for these patterns in observations:

### 1. User Corrections
When a user's follow-up message corrects Claude's previous action:
- "No, use X instead of Y"
- "Actually, I meant..."
- Immediate undo/redo patterns

→ Create instinct: "When doing X, prefer Y"

### 2. Error Resolutions
When an error is followed by a fix:
- Tool output contains error
- Next few tool calls fix it
- Same error type resolved similarly multiple times

→ Create instinct: "When encountering error X, try Y"

### 3. Repeated Workflows
When the same sequence of tools is used multiple times:
- Same tool sequence with similar inputs
- File patterns that change together
- Time-clustered operations

→ Create workflow instinct: "When doing X, follow steps Y, Z, W"

### 4. Tool Preferences
When certain tools are consistently preferred:
- Always uses Grep before Edit
- Prefers Read over Bash cat
- Uses specific Bash commands for certain tasks

→ Create instinct: "When needing X, use tool Y"

## Output

Creates/updates instincts in `$CLAUDE_PROJECT_DIR/.claude/learned/instincts/personal/`:

    ---
    id: prefer-grep-before-edit
    trigger: "when searching for code to modify"
    confidence: 0.65
    domain: "workflow"
    source: "session-observation"
    ---

    # Prefer Grep Before Edit

    ## Action
    Always use Grep to find the exact location before using Edit.

    ## Evidence
    - Observed 8 times in session abc123
    - Pattern: Grep → Read → Edit sequence
    - Last observed: 2025-02-10 (example)

## Confidence Calculation

Initial confidence based on observation frequency:
- 1-2 observations: 0.3 (tentative)
- 3-5 observations: 0.5 (moderate)
- 6-10 observations: 0.7 (strong)
- 11+ observations: 0.85 (very strong)

Confidence adjusts over time:
- +0.05 for each confirming observation
- -0.10 for each contradicting observation
- -0.02 per week without observation (decay)

## Important Guidelines

1. **Be Conservative**: Only create instincts for clear patterns (3+ observations)
2. **Be Specific**: Narrow triggers are better than broad ones
3. **Track Evidence**: Always include what observations led to the instinct
4. **Respect Privacy**: Never include actual code snippets, only patterns
5. **Merge Similar**: If a new instinct is similar to existing, update rather than duplicate
