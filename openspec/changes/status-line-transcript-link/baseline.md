# status-line-transcript-link — Baseline

> **Change:** status-line-transcript-link
> **Domain:** Status Line / Session Management
> **Date:** 2026-02-27
> **Evidence taxonomy:** See `whiteboard.md` Evidence Glossary section

---

## Artifacts (minimum set for this baseline)

| Artifact | Path | Role in Baseline |
|----------|------|------------------|
| Status line script | `/Users/wesleyfrederick/.claude/scripts/status-line/statusline-script.sh` | Primary system being changed — produces the status line output |
| Config | `/Users/wesleyfrederick/.claude/scripts/status-line/config.sh` | Defines BASE_PATH used by status line |
| Context tracker | `/Users/wesleyfrederick/.claude/scripts/status-line/claude-context-tracker.js` | Demonstrates `transcript_path` extraction pattern from same JSON input |
| Settings | `/Users/wesleyfrederick/.claude/settings.json` (lines 192-195) | Registers status line command |
| Statusline reference | `/Users/wesleyfrederick/.claude/plugins/cache/superpowers-marketplace/superpowers-developing-for-claude-code/0.3.1/skills/working-with-claude-code/references/statusline.md` | Official docs — JSON input schema, ANSI support, update cadence |

---

## Traces

```text
TRACE: Status line script execution (Claude Code Status event, ~300ms cadence)
═══════════════════════════════════════════════════════════════════════════════

 TRIGGER
 ───────
 1. [C: Claude Code runtime]
    Event: Status line update fires (at most every 300ms)
    Claude Code pipes JSON to stdin of statusline-script.sh

 INPUT: READ + DEBUG
 ───────────────────
 2. [OBS: statusline-script.sh:7]
    input=$(cat)
    Reads entire JSON blob from stdin into $input

 3. [OBS: statusline-script.sh:4,10-22]
    Guard: DEBUG==false → skip
    (When true: writes JSON to debug JSONL file)

 CONFIG
 ──────
 4. [OBS: statusline-script.sh:25-31]
    Source: config.sh → sets BASE_PATH
    Fallback: $HOME/Documents/ObsidianVault/0_SoftwareDevelopment

 EXTRACT FIELDS FROM JSON
 ────────────────────────
 5. [OBS: statusline-script.sh:34-37]                    ← KEY LINE
    Extracts via jq:
    ├── model_name   (.model.display_name // "Claude")
    ├── current_dir  (.workspace.current_dir // "")
    ├── project_dir  (.workspace.project_dir // "")
    └── session_id   (.session_id // "")
    NOTE: transcript_path is AVAILABLE in input JSON but NOT extracted

 COMPUTE: PROJECT NAME
 ─────────────────────
 6. [OBS: statusline-script.sh:52-124, 127-130]
    CALL ──→ get_project_name "$current_dir"
    │
    │  6a. [OBS: statusline-script.sh:56-95]
    │      Check .git exists → worktree file or regular dir
    │      Extract project name from remote URL or toplevel
    │
    │  6b. [OBS: statusline-script.sh:97-120]
    │      Fallback: git worktree list, remote, toplevel
    │
    │  6c. [OBS: statusline-script.sh:123]
    │      Final fallback: basename of current_dir
    │
    RETURN ←── project_name string (e.g., "cc-workflows")

 COMPUTE: GIT RELATIVE PATH
 ──────────────────────────
 7. [OBS: statusline-script.sh:132-203]
    Calculates relative path from git root to current_dir
    Handles worktree vs regular repo vs subdirectory

 COMPUTE: BRANCH + DIRTY STATE
 ─────────────────────────────
 8. [OBS: statusline-script.sh:206-231]
    branch=$(git branch --show-current)
    dirty="*" if uncommitted changes exist

 COMPUTE: CONTEXT WINDOW
 ───────────────────────
 9. [OBS: statusline-script.sh:270-304]
    CALL ──→ echo "$input" | node claude-context-tracker.js
    │
    │  9a. [OBS: claude-context-tracker.js:218-219]          ← KEY LINE
    │      Parses SAME JSON input
    │      Extracts: { session_id, transcript_path }
    │      NOTE: This proves transcript_path is reliably in the JSON
    │
    │  9b. [OBS: claude-context-tracker.js:228-235]
    │      Reads transcript JSONL via transcript_path
    │      Calculates token usage from current session boundary
    │
    RETURN ←── "Context usage: 125.3K/1M tokens (13%)"

10. [OBS: statusline-script.sh:280-288]
    Parse context tracker output via sed:
    ├── context_tokens (e.g., "125.3K")
    ├── context_limit  (e.g., "1M")
    └── context_percent (e.g., "13")

 COMPUTE: ACTIVE TASK
 ────────────────────
11. [OBS: statusline-script.sh:306-323]
    Guard: session_id non-empty AND $HOME/.claude/tasks/$session_id/ exists
    Loop: find first task JSON with status=="in_progress"
    Extract: task_id + activeForm → "📋 1. Implementing feature"

 ASSEMBLE OUTPUT
 ───────────────
12. [OBS: statusline-script.sh:325-356]                  ← KEY LINE
    Concatenation order:
    ├── project_name              (e.g., "cc-workflows")
    ├── " ($branch$dirty)"        (e.g., " (main*)")
    ├── " | $model_name"          (e.g., " | Opus 4.6")
    ├── " | tokens/limit pct%"    (e.g., " | 0.0K/1M 0%")
    ├── " | $git_relative_path"   (if different from root)
    ├── " | 🔑 $session_id"      (e.g., " | 🔑 b317e1f4-...")   ← TARGET OF CHANGE
    └── " | $active_task"         (if in_progress task exists)

 OUTPUT
 ──────
13. [OBS: statusline-script.sh:364]
    printf "%s" "$final_output"
    Single line to stdout → Claude Code renders as status bar

═══════════════════════════════════════════════════════════════════════════════
END TRACE
```

---

## Process Tree

Omitted — the execution flow is purely linear (no branching that affects the session ID display).

---

## Measurements

- **[M: `wc -l statusline-script.sh` → 364]** Script is 364 lines total
- **[M: statusline.md:28]** Update cadence: at most every 300ms
- **[M: manual test]** Status line text is NOT cmd+clickable — user confirmed clicking session UUID does nothing
- **[M: observation]** JSON input contains `transcript_path` field (confirmed by `claude-context-tracker.js:219` which already extracts it)
- **[OBS: screenshot 2026-02-27 6:25 PM]** Claude Code renders short file paths (e.g., `openspec/changes/.../ideal.md`) as clickable links in tool output. Hovering shows a `file://` URI with the full absolute path. Display text does NOT need to be the full path — short/relative paths are linkable. Mechanism unknown (OSC 8? path regex? internal renderer?).

---

## Locked Facts [F-LK]

1. **[F-LK: from steps 5 + 9a]** The `transcript_path` is already available in the JSON input and reliably present — `claude-context-tracker.js` depends on it (line 221 errors if missing). Adding extraction to the main script requires only one new `jq` call at step 5.

2. **[F-LK: from step 12]** The session ID segment (`🔑 $session_id`) is assembled as a plain string concatenation. Changing what's displayed (e.g., replacing UUID with a file path) only requires modifying lines 353-356. No downstream consumers depend on this output format.

3. **[F-LK: from steps 3 + 9]** The status line script already performs I/O side effects — debug mode writes to disk (step 3) and the context tracker reads the transcript file (step 9). Adding a file copy operation is consistent with existing patterns.

4. **[F-LK: from step 13]** Output is `printf "%s"` — a single-line plain text string. ANSI escape codes are supported per docs but the script doesn't currently use them. OSC 8 hyperlink support is unknown.

---

## Constraints [C]

- **[C]** Status line runs at most every 300ms — any added I/O must be fast or conditional
- **[C]** Output must be a single line of stdout (Claude Code consumes first line only)
- **[C]** `transcript_path` points to a live JSONL file that grows during the session — any copy is a point-in-time snapshot

---

## Assumptions [A]

1. **[A]** Replacing the session UUID with a recognizable file path in the status line text will NOT make it cmd+clickable, because Claude Code's path detection doesn't apply to the status line renderer. (Testable: change the output to a known file path and see if cmd+click works.)
2. **[A]** A `cp` command on a growing JSONL file (~50-500KB typical) completes in <10ms and won't cause noticeable status line lag at 300ms cadence. (Testable: time a copy of the current transcript.)
3. **[A]** Cmd+click in Claude Code only works on file paths in the main conversation output area — not on status line text

---

## Resolved Questions

1. **[Q → RESOLVED]** Does Claude Code's status line renderer support OSC 8 terminal hyperlinks?
   - **Answer: YES.** Official docs ([code.claude.com/docs/en/statusline](https://code.claude.com/docs/en/statusline)) explicitly document OSC 8 support with a working clickable links example.
   - **Format:** `\e]8;;URL\a TEXT \e]8;;\a` — use `printf '%b'` for reliable escape handling
   - **Terminal support:** iTerm2, Kitty, WezTerm. NOT Terminal.app, NOT tmux (OSC sequences stripped).
   - **VSCode caveat:** Renders (underlined, hoverable) but clicking `file:///` URIs does nothing (VSCode bug [microsoft/vscode#242371](https://github.com/microsoft/vscode/issues/242371)).

2. **[Q → RESOLVED]** How does Claude Code render clickable file links in tool output?
   - **Answer: OSC 8 escape sequences** with `file:///` URIs. Same mechanism available to status line scripts.
   - **Implication:** Session ID can be made clickable by wrapping it in OSC 8 with a `file://` URI pointing to the transcript path.
   - **Known issues:** GitHub [#23438](https://github.com/anthropics/claude-code/issues/23438) — custom statusline OSC 8 links don't render in tmux. [#18717](https://github.com/anthropics/claude-code/issues/18717) — file:/// links not clickable in VSCode terminal.
