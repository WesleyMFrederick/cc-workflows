# status-line-transcript-link — Delta

> **Change:** status-line-transcript-link
> **Domain:** Status Line / Session Management
> **Date:** 2026-02-27

---

## Same-Units Comparison Table

| Attribute | Baseline | Ideal | Delta |
|-----------|----------|-------|-------|
| Trigger: Claude Code pipes JSON to stdin | Every 300ms max | Every 300ms max | no change |
| Input read: `input=$(cat)` | Reads full JSON blob | Reads full JSON blob | no change |
| Debug mode: conditional write to JSONL | Writes when DEBUG=true | Writes when DEBUG=true | no change |
| Config: source config.sh for BASE_PATH | Sources config.sh | Sources config.sh | no change |
| Field extraction: `model_name` | Extracted via jq | Extracted via jq | no change |
| Field extraction: `current_dir` | Extracted via jq | Extracted via jq | no change |
| Field extraction: `project_dir` | Extracted via jq | Extracted via jq | no change |
| Field extraction: `session_id` | Extracted via jq | Extracted via jq | no change |
| Field extraction: `transcript_path` | **NOT extracted** (available but unused) | **Extracted via jq** (`.transcript_path // ""`) | **ADD** one jq call at step 5 |
| Compute: project name | git remote/toplevel/basename | Same logic | no change |
| Compute: git relative path | Relative path from git root | Same logic | no change |
| Compute: branch + dirty state | `git branch --show-current` + dirty check | Same logic | no change |
| Compute: context window | Pipes JSON to `claude-context-tracker.js` | Same logic | no change |
| Compute: active task | Checks session task dir for in_progress | Same logic | no change |
| Transcript copy to project dir | **Does not exist** | **Conditional copy**: `cp` when source `-nt` dest → `{project_dir}/claude-code-transcripts/{session_id}.jsonl` | **ADD** new step: mkdir + timestamp guard + cp (~8 lines) |
| Session ID display text | `🔑 $session_id` (plain UUID) | `🔑 $session_id` (same text) | no change to visible text |
| Session ID link behavior | Not clickable (plain text) | **OSC 8 hyperlink** wrapping UUID → `file://${dest_file}` | **CHANGE** wrap in `\e]8;;file://...\a...\e]8;;\a` |
| Output format | `printf "%s"` | `printf '%b'` | **CHANGE** — enables OSC 8 escape rendering |
| `claude-code-transcripts/` dir | Does not exist | Created by script, added to `.gitignore` | **ADD** dir creation + gitignore entry |
| Script line count | 364 | ~385 (est. +20 lines) | **GROW** ~20 lines |
| Update cadence impact | N/A | <10ms cp when triggered, <1ms stat guard otherwise | no change to perceived cadence |

---

## Unresolved Decisions

None — all whiteboard [Q]s were resolved during baseline and ideal:

| Original Question | Resolution | Source |
|---|---|---|
| OSC 8 support in status line? | YES — official docs confirm with working example | baseline Resolved Q #1 |
| Copy frequency? | Continuous with `-nt` timestamp guard | ideal claim #2, #3 |
| JSONL format or transform? | As-is, raw JSONL | ideal claim #7 |
| Destination filename? | `{session_id}.jsonl` | ideal claim #8 |
| Gitignore? | Yes | ideal claim #6 |
| Status line script vs hook? | Status line script (consistent with existing I/O pattern) | ideal trace step 12, baseline [F-LK] #3 |

---

## Risk Assessment

1. **`printf '%b'` interprets all backslash escapes in existing output** (rows: output format, session ID display)
   - **Risk:** If any existing variable content contains `\n`, `\t`, `\e`, or other backslash sequences, `printf '%b'` will interpret them — potentially breaking the status line layout.
   - **Mitigation:** Audit all variables concatenated into `$final_output`. If any could contain literal backslashes (e.g., branch names, project names, git paths), escape them or isolate the OSC 8 portion.
   - **Likelihood:** Low — branch names and paths rarely contain backslash sequences. But a branch named `feature\new` would break.

2. **OSC 8 not supported in tmux or Terminal.app** (row: session ID link behavior)
   - **Risk:** Users in tmux see raw escape codes instead of a clean UUID. Known issue: GitHub [#23438](https://github.com/anthropics/claude-code/issues/23438).
   - **Mitigation:** Detect `$TERM_PROGRAM` or `$TMUX` and fall back to plain text when OSC 8 is unsupported.
   - **Likelihood:** Medium — tmux is commonly used.

3. **VSCode terminal renders OSC 8 but `file:///` clicks do nothing** (row: session ID link behavior)
   - **Risk:** Users see underlined text that looks clickable but isn't. Known VSCode bug [microsoft/vscode#242371](https://github.com/microsoft/vscode/issues/242371).
   - **Mitigation:** Accept as known limitation. Link still works in iTerm2/Kitty/WezTerm. No harm from non-functional underline.
   - **Likelihood:** High for VSCode users — but impact is cosmetic only.

4. **Concurrent write during `cp`** (row: transcript copy)
   - **Risk:** Claude Code writes to the transcript JSONL while `cp` reads it. Could produce a truncated copy.
   - **Mitigation:** `cp` on a <500KB file completes in <10ms. Risk of mid-write truncation is very low. Even if truncated, next 300ms tick will re-copy (source newer than dest).
   - **Likelihood:** Very low — self-healing on next tick.

---

## Scope Boundary

Explicitly **OUT of scope** (derived from "no change" rows and baseline constraints):

- **Transcript transformation** — no markdown conversion, no pretty-printing. Raw JSONL only.
- **All existing computations** — project name, git path, branch, context window, active task logic untouched.
- **Debug mode** — no changes to debug write behavior.
- **Config** — no changes to `config.sh` or `BASE_PATH`.
- **Context tracker** — `claude-context-tracker.js` unchanged.
- **Session management hooks** — `session-start.sh`, `stop-sync.sh` untouched.
- **Settings** — `settings.json` statusLine config unchanged.
- **Status line update cadence** — remains 300ms max, no architectural change.
