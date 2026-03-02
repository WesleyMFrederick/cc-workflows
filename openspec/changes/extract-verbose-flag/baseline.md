# Extract Verbose Flag — Whiteboard v2

> **Change:** extract-verbose-flag
> **Domain:** tools/citation-manager
> **Date:** 2026-02-17

## Original Request

> Create a `--verbose` output flag that displays the current output. Make a new default that will reduce the number of tokens sent back to LLM when it runs `citation-manager extract`.

**Goal:** Reduce token cost across `citation-manager extract` AND `validate` by introducing compact default output with `--verbose` flag to restore current behavior.

---

## Evidence Glossary

Every claim in this document is tagged with an evidence type and source.

| Tag | Meaning | Example |
|-----|---------|---------|
| **[OBS]** | **Observation** — code reviewed, behavior confirmed | `[OBS: extractor.sh:109]` |
| **[M]** | **Measured** — quantified data exists | `[M: 94KB extract output]` |
| **[F-LK]** | **Fact Locked** — empirical conclusion frozen for analysis | `[F-LK: from OBS+M]` |
| **[F-ID]** | **Fact by Identity** — true by definition, math, or structural logic | `[F-ID: total = A + B]` |
| **[A]** | **Assumed** — hypothesis, not yet tested | `[A: LLM ignores metadata]` |
| **[C]** | **Constraint** — external requirement, cannot change | `[C: jq required by hook]` |
| **[D]** | **Decision** — commitment of a resource (time, effort, scope) | `[D: use --verbose flag]` |
| **[Q]** | **Question** — open unknown, needs investigation | `[Q: does header extract use same path?]` |

**Rule:** No untagged claims. If a claim can't be tagged, it's either [Q] or shouldn't be here.

---

## Baseline: Extractor Hook Trace

### Artifacts (minimum set for this trace)

| Artifact     | Path                                                                                                                                         | Role in Trace                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Hook config  | `.claude/settings.json` (Claude Code config, not source) | Context only: maps PostToolUse:Read → extractor.sh     |
| Hook script  | `.claude/hooks/citation-manager/extractor.sh`                                                                                                | Orchestrator: calls CLI, parses output, formats result |
| CLI entry    | `tools/citation-manager/src/citation-manager.ts`                                                                                             | Execution: parses args, runs command, writes stdout    |
| Extraction   | `tools/citation-manager/src/core/ContentExtractor/ContentExtractor.ts`                                                                       | Processing: extract + deduplicate content              |
| Output types | `tools/citation-manager/src/types/contentExtractorTypes.ts`                                                                                  | Contract: defines JSON output structure                |

### Trace: PostToolUse:Read → Context Injection

Reading the trace top-to-bottom is the execution path. Each step is evidence-tagged to its source.

```text
TRACE: extractor hook (PostToolUse:Read)
══════════════════════════════════════════

 HOOK TRIGGER
 ─────────────
 1. [C: Claude Code runtime]
    Event: PostToolUse:Read fires
    Matcher: "Read" → extractor.sh

 HOOK: GUARDS
 ────────────
 2. [OBS: extractor.sh:27-30]
    Guard: jq available?
    FAIL → exit 0 (silent skip)

 3. [OBS: extractor.sh:34-45]
    Resolve: citation-manager binary
    Try: local build (dist/citation-manager.js)
    Fallback: global CLI
    FAIL → exit 0 (silent skip)

 4. [OBS: extractor.sh:56-63]
    Parse: stdin JSON from Claude Code
    Extract: file_path, session_id
    FAIL (no file_path) → exit 0

 5. [OBS: extractor.sh:77-80]
    Guard: file_path ends in .md?
    FAIL → exit 0 (silent skip)

 HOOK → CLI (boundary crossing)
 ──────────────────────────────
 6. [OBS: extractor.sh:92]
    CALL ──→ citation-manager extract links "$file_path" --session "$session_id"
    │
    │  CLI: PARSE ARGS
    │  ────────────────
    │  6a. [OBS: citation-manager.ts:1131-1291]
    │      Commander.js parses: extract links <file> --session <id>
    │
    │  CLI: ORCHESTRATE
    │  ────────────────
    │  6b. [OBS: citation-manager.ts:429-480]
    │      extractLinks() → validate links → extract content
    │
    │  CLI: EXTRACT + DEDUPLICATE
    │  ──────────────────────────
    │  6c. [OBS: ContentExtractor.ts:88-235]
    │      Strategy chain → content extraction → SHA-256 dedup
    │
    │  CLI: OUTPUT
    │  ───────────
    │  6d. [OBS: citation-manager.ts:466]
    │      console.log(JSON.stringify(result, null, 2))
    │      ├── extractedContentBlocks  (50KB)  [M]
    │      ├── outgoingLinksReport     (44KB)  [M]
    │      └── stats                   (124B)  [M]
    │      TOTAL: 94KB to stdout               [M]
    │
    │  6e. [OBS: citation-manager.ts:exit codes]
    │      Exit: 0 (success) | 1 (no content) | 2 (error)
    │
    RETURN ←── stdout (94KB JSON) + exit code
    │

 HOOK: PROCESS CLI OUTPUT
 ────────────────────────
 7. [OBS: extractor.sh:93]
    Capture: exit code from CLI

 8. [OBS: extractor.sh:97-106]
    Branch on exit code:
    ├── 0 + empty output → exit 0 (cache hit, already extracted)
    ├── 1             → exit 0 (no citations found)
    └── 2 or empty    → exit 0 (error, silent)

 9. [OBS: extractor.sh:109]                         ← KEY LINE
    Parse: jq '.extractedContentBlocks'
    USES:    50KB (content blocks)
    DISCARDS: 44KB (outgoingLinksReport) + 124B (stats)
    WASTE:   46% of received data                  [M: 44KB / 94KB]

10. [OBS: extractor.sh:112-116]
    Guard: extracted content not null/empty?
    FAIL → exit 0

11. [OBS: extractor.sh:121]                         ← KEY LINE
    Transform: jq maps content blocks →
    "## Citation: <contentId>\n\n<content>\n---"

    INPUT FORMAT:  JSON (extractedContentBlocks object)
    OUTPUT FORMAT: markdown text (flat string)

 HOOK: EMIT RESULT
 ─────────────────
12. [OBS: extractor.sh:132-139]
    Wrap: jq builds hookSpecificOutput JSON envelope
    {
      "hookSpecificOutput": {
        "hookEventName": "PostToolUse",
        "additionalContext": "<formatted markdown>"
      }
    }

13. [OBS: extractor.sh:141]
    Output: JSON to stdout → Claude Code injects as additionalContext

14. [OBS: extractor.sh:144]
    Exit: 0 (always non-blocking)

══════════════════════════════════════════
END TRACE
```

### Locked/Identity Facts [F-LK / F-ID]

These conclusions come from combining evidence in the trace:

1. **[F-LK: from steps 6d + 9]** The hook receives 94KB but uses only 50KB. The 44KB (46%) is **pipe waste, not context waste** — the CLI serializes it, the pipe transmits it, and the hook immediately discards it via `jq '.extractedContentBlocks'`. Claude never sees the `outgoingLinksReport`. The waste is CPU/IO in the CLI→hook transfer, not tokens in Claude's context window.

2. **[F-LK: from steps 9 + 11]** The hook performs two format transformations: JSON → extracted blocks (jq) → markdown text (jq). The final output to Claude is markdown, not JSON. The intermediate JSON format is a means, not an end. **Final format Claude receives** [OBS: extractor.sh:121]:

```markdown
## Citation: d240fa5864c3063f

#### Citation Manager.Citation Validator
- **Path(s):** `tools/citation-manager/src/CitationValidator.js`
...content of the extracted section...

---

## Citation: 6db887882e007db3

#### Citation Manager.ContentExtractor
...content of the extracted section...
```

Each content block becomes a `## Citation: <sha256-hash>` heading followed by the raw content, separated by `---`. This is the format visible in this conversation's own hook output.

3. **[F-LK: from step 6d]** The CLI's `console.log(JSON.stringify(result, null, 2))` is the single output point. Any change to default output format affects ALL consumers simultaneously — there is no per-consumer output path.

4. **[F-ID: from steps 2-5]** The hook has 4 guard clauses that exit silently (exit 0). Any of these failing means no content injection. The hook is designed to be invisible when it can't operate.

5. **[F-LK: from OBS on lines 466, 1234, 1280]** All three extract subcommands use identical output format (`console.log(JSON.stringify(result, null, 2))`). Output point differs — `extractLinks` outputs inside the method (line 466), while `extractHeader` (line 1234) and `extractFile` (line 1280) return results to CLI wiring which outputs. But the format is the same: pretty-printed JSON of `OutgoingLinksExtractedContent`.

### Constraints [C]

1. **[C: extractor.sh:109]** Hook uses `jq` to parse CLI output. If CLI output changes from JSON to a non-JSON format, this line breaks.

2. **[C: extractor.sh:121]** Hook uses `jq` to transform content blocks to markdown. This assumes `.extractedContentBlocks` is a JSON object with a specific shape (keys = content IDs, values = objects with `.content` field).

3. **[C: Claude Code runtime]** Hook trigger is `PostToolUse:Read` for ALL Read operations on .md files. Cannot be scoped to specific files or commands.

### Assumptions [A]

1. **[A]** LLM does not use `outgoingLinksReport` metadata when consuming extract output directly via CLI. (Evidence: no observed usage pattern, but not measured.)

2. **[A]** The compact output (~50KB) would be sufficient for LLM context needs. (No measurement of what LLM actually consumes from the 94KB.)

3. ~~**[A]**~~ → **[OBS: citation-manager.ts:466,1234,1280]** All three extract subcommands use `console.log(JSON.stringify(result, null, 2))`. Confirmed: `extractLinks` at line 466, `extractHeader` at line 1234 (CLI wiring), `extractFile` at line 1280 (CLI wiring). Same format, different output locations.

### Open Questions [Q]


---

## What This v2 Changes From v1

| v1 Problem | v2 Fix |
|------------|--------|
| Evidence tags inconsistent (`[OBSERVED: file]` vs `[O](line)`) | Glossary defines 6 tag types, every claim tagged |
| Hook and CLI shown as sibling branches | Trace shows hook CALLING CLI as sub-process (steps 6-6e) |
| "call" jumps to "receive" with no intermediate | 14-step trace shows every boundary crossing |
| Artifacts listed flat, not connected to claims | Artifacts table links each file to its role in trace |
| Some evidence said "??? what lines ???" | Every tag has specific file:line reference |
| No distinction between what's derived vs observed | [D] section separates conclusions from raw observations |
| Constraints and assumptions mixed into prose | Separate [C], [A], [Q] sections |