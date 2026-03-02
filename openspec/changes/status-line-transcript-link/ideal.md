# status-line-transcript-link — Ideal

> **Change:** status-line-transcript-link
> **Domain:** Status Line / Session Management
> **Date:** 2026-02-27
> **Evidence taxonomy:** See `whiteboard.md` Evidence Glossary section

---

## Ideal Traces

```text
TRACE: Status line script execution — IDEAL STATE
═══════════════════════════════════════════════════════════════════════════════

 TRIGGER
 ───────
 1. [C: Claude Code runtime]
    Event: Status line update fires (at most every 300ms)
    Claude Code pipes JSON to stdin of statusline-script.sh
    ← UNCHANGED from baseline

 INPUT: READ + DEBUG
 ───────────────────
 2. [unchanged from baseline step 2]
    input=$(cat)

 3. [unchanged from baseline step 3]
    Guard: DEBUG==false → skip

 CONFIG
 ──────
 4. [unchanged from baseline step 4]
    Source: config.sh → sets BASE_PATH

 EXTRACT FIELDS FROM JSON
 ────────────────────────
 5. [D: add transcript_path extraction]                    ← CHANGED
    Extracts via jq:
    ├── model_name       (.model.display_name // "Claude")
    ├── current_dir      (.workspace.current_dir // "")
    ├── project_dir      (.workspace.project_dir // "")
    ├── session_id       (.session_id // "")
    └── transcript_path  (.transcript_path // "")            ← NEW FIELD
    NOTE: transcript_path was available but unused; now extracted

 COMPUTE: PROJECT NAME
 ─────────────────────
 6. [unchanged from baseline step 6]

 COMPUTE: GIT RELATIVE PATH
 ──────────────────────────
 7. [unchanged from baseline step 7]

 COMPUTE: BRANCH + DIRTY STATE
 ─────────────────────────────
 8. [unchanged from baseline step 8]

 COMPUTE: CONTEXT WINDOW
 ───────────────────────
 9. [unchanged from baseline step 9]

10. [unchanged from baseline step 10]

 COMPUTE: ACTIVE TASK
 ────────────────────
11. [unchanged from baseline step 11]

 COPY TRANSCRIPT (NEW)
 ─────────────────────
12. [D: new step — auto-copy transcript to project dir]     ← NEW STEP
    Guard: transcript_path non-empty AND file exists
    dest_dir="${project_dir}/claude-code-transcripts"
    dest_file="${dest_dir}/${session_id}.jsonl"
    │
    │  12a. [D] mkdir -p "$dest_dir"  (no-op if exists)
    │  12b. [D] Guard: [ "$transcript_path" -nt "$dest_file" ] (skip if unchanged)
    │  12c. [D] cp "$transcript_path" "$dest_file"
    │
    NOTE: Always auto-copies when source is newer than dest. No opt-in phase.
    cp on a ~50-500KB file is <10ms [A: utility=high, cost-to-test=low]

 ASSEMBLE OUTPUT
 ───────────────
13. [D: session ID becomes clickable link to local copy]     ← CHANGED
    Concatenation order:
    ├── project_name              (unchanged)
    ├── " ($branch$dirty)"        (unchanged)
    ├── " | $model_name"          (unchanged)
    ├── " | tokens/limit pct%"    (unchanged)
    ├── " | $git_relative_path"   (unchanged, if applicable)
    ├── " | 🔑 $session_id"      ← DISPLAY TEXT UNCHANGED (UUID)
    │       BUT: wrapped in OSC 8 hyperlink pointing to local copy
    │       Format: \e]8;;file://${dest_file}\a🔑 ${session_id}\e]8;;\a
    │       Cmd+click → opens local transcript in editor/viewer
    │       Terminal support: iTerm2, Kitty, WezTerm (NOT tmux, NOT Terminal.app)
    └── " | $active_task"         (unchanged, if applicable)

 OUTPUT
 ──────
14. [D: use printf '%b' for OSC 8 escape handling]           ← CHANGED
    printf '%b' "$final_output"
    (Changed from printf "%s" to '%b' for reliable OSC 8 rendering)

═══════════════════════════════════════════════════════════════════════════════
END TRACE
```

---

## Output Mockups

### Status line — after change

```text
cc-workflows (main*) | Opus 4.6 | 0.0K/1M 0% | 🔑 b317e1f4-ecc9-4936-981f-a43c2943f56a
```

**[D]** Display is identical to baseline — UUID only. The transcript copy is a silent side effect that does not alter the status line output.

### Filesystem — new directory

```text
{project_dir}/
├── claude-code-transcripts/
│   ├── b317e1f4-ecc9-4936-981f-a43c2943f56a.jsonl
│   └── (one file per session that opens this project)
└── .gitignore  ← [D] add claude-code-transcripts/ entry
```

---

## Ideal Claims

1. **[D]** `transcript_path` will be extracted from JSON input at step 5, alongside existing fields. One additional `jq` extraction.

2. **[D]** Always auto-copy: on every status update, copy transcript to `{project_dir}/claude-code-transcripts/{session_id}.jsonl` when source is newer than dest. No opt-in phase — copy is unconditional (guarded only by timestamp).

3. **[D]** Timestamp guard (`[ source -nt dest ]`) prevents redundant I/O on every 300ms tick. Actual `cp` only fires when source has changed.

4. **[A: utility=high, cost-to-test=low]** `cp` of a 50-500KB JSONL file completes in <10ms, well within the 300ms cadence budget.
   - **To strengthen → [M]:** Run `time cp` on a real transcript file.
   - **Utility of strengthening:** Low — implementation will surface this immediately if it's wrong.

5. **[D]** Session ID display text unchanged — keeps `🔑 $session_id` (UUID). Wrapped in OSC 8 hyperlink (`\e]8;;file://${dest_file}\a`) so Cmd+click opens the local transcript copy. Terminal support: iTerm2, Kitty, WezTerm. Not supported: Terminal.app, tmux. VSCode renders but clicking `file:///` is a known VSCode bug.

6. **[D]** `claude-code-transcripts/` will be added to `.gitignore` — transcripts are personal session data, not shared project artifacts.

7. **[D]** Transcript is copied as-is (raw JSONL). No transformation to markdown or other formats — that's a separate concern.

8. **[D]** Destination filename uses `{session_id}.jsonl` — matches source naming, simple to correlate.

9. **[D → DONE]** Research confirmed: Claude Code uses OSC 8 escape sequences for clickable links. Official docs at [code.claude.com/docs/en/statusline](https://code.claude.com/docs/en/statusline) include a working "Clickable links" example. Format: `\e]8;;URL\a TEXT \e]8;;\a` with `printf '%b'`.

10. **[D]** Output changed from `printf "%s"` to `printf '%b'` to support OSC 8 escape sequence rendering.

---

## Assumptions

- **[A: utility=medium, cost-to-test=low]** The `mkdir -p` call on each status update adds negligible overhead once the directory exists (no-op on existing dirs).
  - **To strengthen → [M]:** Run `time mkdir -p` on an existing directory.
  - **Utility of strengthening:** Very low — `mkdir -p` is a known fast no-op.

- **[A: utility=medium, cost-to-test=low]** The conditional timestamp guard (`[ source -nt dest ]`) adds negligible overhead (~1ms stat call) and prevents redundant copies on each 300ms tick.
  - **To strengthen → [M]:** Run script 10x in a loop, measure total time.
  - **Utility of strengthening:** Low — standard shell behavior.

---

## Resolved Questions

1. **[Q → RESOLVED]** How does Claude Code render clickable file links? **Answer: OSC 8 escape sequences.** Official docs confirm support in status line with `file://` URIs. See baseline Resolved Questions for full details and known issues.

---

## Same-Units Checklist

| Baseline Attribute | Ideal Value | Status |
|--------------------|-------------|--------|
| Input: JSON via stdin | Unchanged — same JSON | ✅ |
| Field extraction: session_id extracted | Unchanged — still extracted | ✅ |
| Field extraction: transcript_path NOT extracted | **CHANGED** → extracted via jq | ✅ |
| Session ID display: `🔑 $session_id` (plain UUID) | Unchanged text — wrapped in OSC 8 link | ✅ |
| Output format: `printf "%s"` single line | **CHANGED** → `printf '%b'` for OSC 8 support | ✅ |
| I/O side effects: debug writes, context tracker reads | **EXPANDED** → adds conditional transcript copy | ✅ |
| Cmd+click on status line text: not functional | **CHANGED** → OSC 8 `file://` link opens local transcript copy | ✅ |
| Transcript location: `~/.claude/projects/...` only | **EXPANDED** → also copied to `{project_dir}/claude-code-transcripts/` | ✅ |
| No `claude-code-transcripts/` folder | **CHANGED** → folder created, added to `.gitignore` | ✅ |
| Script line count: 364 | ~385 (estimated +20 lines for extraction, copy, OSC 8 logic) | ✅ |
| Update cadence: 300ms max | Unchanged — copy is conditional, <10ms when triggered | ✅ |

**Gaps:** None — all questions resolved.
