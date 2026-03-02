# status-line-transcript-link — Whiteboard

> **Change:** status-line-transcript-link
> **Domain:** Status Line / Session Management
> **Date:** 2026-02-27

## Original Request

> I want to update the status-line so the session id is a clickable link that:
> - copies the transcript from /Users/wesleyfrederick/.claude/projects to the current working folders /claude-code-transcripts folder
>
> current status line
> cc-workflows (main*) | Opus 4.6 | 0.0K/1M 0% | 🔑 b317e1f4-ecc9-4936-981f-a43c2943f56a

**Goal:** Make the session ID in the status line a clickable element that copies the current session's transcript JSONL file into a `claude-code-transcripts/` folder within the project working directory.

---

## Evidence Glossary

| Tag | Meaning |
|-----|---------|
| **[OBS]** | **Observation** — code reviewed, behavior confirmed (cite file:line) |
| **[M]** | **Measured** — quantified data exists (cite command + result) |
| **[F-LK]** | **Fact Locked** — empirical conclusion frozen for analysis |
| **[F-ID]** | **Fact by Identity** — true by definition, math, or structural logic |
| **[A]** | **Assumed** — hypothesis, not yet tested |
| **[C]** | **Constraint** — external requirement, cannot change |
| **[D]** | **Decision** — commitment of a resource (time, effort, scope) |
| **[Q]** | **Question** — open unknown, needs investigation |

---

## Artifacts & Paths

### Documentation

- [statusline.md](/Users/wesleyfrederick/.claude/plugins/cache/superpowers-marketplace/superpowers-developing-for-claude-code/0.3.1/skills/working-with-claude-code/references/statusline.md) — Claude Code official statusline reference (JSON input structure, ANSI support, examples)


### Source — Status Line

- `/Users/wesleyfrederick/.claude/scripts/status-line/statusline-script.sh` — Main status line script (364 lines)
  - Lines 7: Reads JSON from stdin via `cat`
  - Lines 34-37: Extracts `model_name`, `current_dir`, `project_dir`, `session_id` from JSON
  - Lines 353-356: Session ID output: `final_output="$final_output | 🔑 $session_id"`
  - **Note:** `transcript_path` is NOT currently extracted despite being available in input JSON
- `/Users/wesleyfrederick/.claude/scripts/status-line/config.sh` — Config (BASE_PATH)
- `/Users/wesleyfrederick/.claude/scripts/status-line/claude-context-tracker.js` — Context tracker
  - Line 219: Extracts `transcript_path` from JSON input (proves field is available)
  - Line 235: Reads transcript JSONL file directly via this path

### Source — Hooks & Session Management

- `/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/.claude/hooks/session-start.sh` — Session start hook (reads current-status.json)
- `/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/.claude/hooks/status/stop-sync.sh` — Stop hook (reads transcript for focus summary)

### Source — Settings

- `/Users/wesleyfrederick/.claude/settings.json` — Lines 192-195: statusLine config pointing to `statusline-script.sh`

### Data

- `/Users/wesleyfrederick/.claude/projects/-Users-wesleyfrederick-Documents-ObsidianVault-0-SoftwareDevelopment-cc-workflows/` — Transcript JSONL storage directory
- `/Users/wesleyfrederick/.claude/projects/-Users-wesleyfrederick-Documents-ObsidianVault-0-SoftwareDevelopment-cc-workflows/sessions-index.json` — Session index with metadata

---

## Baseline Bucket

- **[OBS]** Status line is a bash script that outputs plain text to stdout; "ANSI color codes are supported for styling" per official docs (`statusline.md:30`) — **[Q]** Does the Claude Code status line renderer support OSC 8 terminal hyperlinks (escape sequences for clickable URLs), or only basic ANSI color codes?
- **[OBS]** Status line receives JSON via stdin containing `session_id` and `transcript_path` (`statusline.md:38-41`)
- **[OBS]** `statusline-script.sh` currently extracts `session_id` (line 37) but does NOT extract `transcript_path` — field is available but unused
- **[OBS]** `claude-context-tracker.js` already extracts and uses `transcript_path` from the same JSON input (line 219), proving the field is reliably present
- **[OBS]** Session ID displayed as plain text: `🔑 $session_id` (line 355)
- **[OBS]** Transcripts stored as JSONL files named `{session_id}.jsonl` in the project-hashed directory under `~/.claude/projects/`
- **[OBS]** No `claude-code-transcripts/` folder exists in the project (`Glob` returned no matches)
- **[C]** Status line updates at most every 300ms (`statusline.md:28`) — any side-effect operations should be lightweight
- **[OBS]** Status line script already does I/O side effects: debug mode writes JSON to file (lines 10-22)

---

## Ideal Bucket

- **[D]** Session ID in status line should be "clickable" and trigger a transcript copy
- **[D]** Copy source: `transcript_path` from JSON input (the live JSONL file)
- **[D]** Copy destination: `{project_dir}/claude-code-transcripts/` (new folder in project working dir)
- **[OBS]** "Clickable" means cmd+click opens in VS Code — same behavior as file paths in Claude Code's main output area (user confirmed via screenshot)
- **[C]** Cmd+click in Claude Code only works on **file paths** — not arbitrary text, not URLs, not UUIDs (user confirmed: "only works on paths")
- **[M]** Status line text is NOT clickable today — cmd+click on session UUID does nothing (user tested)
- **[F-LK]** To make session ID "clickable", it must be rendered as a recognizable file path, not a UUID — and it must appear in a rendering context where Claude Code detects paths (status line may not qualify)
- **[Q]** Does Claude Code's path detection work in the status line, or only in the main conversation output area?
- **[Q]** Should the copy happen continuously (live sync on each status update), once (on session start/end), or on-demand?
- **[Q]** Should the JSONL be copied as-is, or transformed (e.g., to readable markdown)?
- **[Q]** Should the destination filename be `{session_id}.jsonl` or include metadata (date, branch, focus)?

---

## Delta Bucket

- Extract `transcript_path` from JSON in `statusline-script.sh`
- Add copy logic to status line script or a separate hook
- Create `claude-code-transcripts/` directory if it doesn't exist
- Modify session ID display format (if OSC 8 or other link format)
- **[Q]** Does this change belong in the status line script itself (side effect) or in a hook (session start/stop)?
- **[Q]** Should `claude-code-transcripts/` be gitignored?
