# evidence-tag-numbering — Whiteboard

> **Change:** evidence-tag-numbering
> **Domain:** cc-workflows / openspec
> **Date:** 2026-02-19

## Original Request

> We want to have a deterministic script that numbers all evidence tags and makes sure they are labeled correctly. All tags should be `**[{{tag-type}}]**` in basic formatting (glossary definitions). All used tags should follow this pattern: `**[{{tag-type}}-{{nnn}}]**` with a corresponding `^block` at the end of the line (e.g., `^O-001`).

**Goal:** Create a deterministic script that auto-numbers evidence tag instances in openspec artifacts and appends Obsidian block anchors, while leaving glossary definitions and section header labels untouched.

---

## Evidence Glossary

| Tag         | Meaning                                                           |
| ----------- | ----------------------------------------------------------------- |
| **\[O\]**     | **Observed** — code reviewed, behavior confirmed (cite file:line) |
| **\[M\]**     | **Measured** — quantified data exists (cite command + result)     |
| **\[F-INF\]** | **Fact Inferred** — conclusion from combining O/M evidence        |
| **\[A\]**     | **Assumed** — hypothesis, not yet tested                          |
| **\[C\]**     | **Constraint** — external requirement, cannot change              |
| **\[D\]**     | **Decision** — commitment of a resource (time, effort, scope)     |
| **\[Q\]**     | **Question** — open unknown, needs investigation                  |

---

## Artifacts & Paths

### Documentation

- `openspec/schemas/my-workflow/schema.yaml` — workflow schema defining 8-artifact chain and evidence taxonomy instructions (lines 20-36)
- [whiteboard template](../../../openspec/schemas/my-workflow/templates/whiteboard.md) — standard evidence glossary (lines 17-25)
- [baseline template](../../../openspec/schemas/my-workflow/templates/baseline.md) — section header labels like `## Inferred Facts [F-INF]` (lines 36-54)

### Source / Examples

- [transcript-event-log-extraction/whiteboard.md](../transcript-event-log-extraction/whiteboard.md) — 43 unnumbered tag usages across 176 lines
- [slack-mcp-users-search-polish/whiteboard.md](../slack-mcp-users-search-polish/whiteboard.md) — extended glossary with `[R]`, `[R-LOCK]` custom tags
- [slack-mcp-users-search-polish/baseline.md](../slack-mcp-users-search-polish/baseline.md) — section header labels `## Constraints [C]` etc.

---

## Baseline Bucket

**\[O-001\]** Evidence tags appear in 3 distinct contexts across openspec artifacts: ^O-001

1. **Glossary definitions** (table rows): `**\[O\]**` — tag type only, no numbering, bold. Found in `## Evidence Glossary` section of whiteboards.
2. **Section header labels** (h2 headings): `## Inferred Facts [F-INF]` — tag type only, no bold, no numbering. Found in baseline templates.
3. **Body instances** (inline): `**\[O\]**` at start/middle of a sentence — these are evidence claims that need numbering.

**\[O-002\]** The glossary is extensible — `slack-mcp-users-search-polish` added `[R]` and `[R-LOCK]` beyond the standard 7 types. ^O-002

**\[M-001\]** The `transcript-event-log-extraction` whiteboard has 43 tag usages. Tag distribution: ^M-001
- `[O]` — most frequent (~15 usages)
- `[C]` — ~6 usages
- `[F-INF]` — ~6 usages
- `[A]` — ~6 usages
- `[Q]` — ~5 usages
- `[D]` — ~1 usage

**\[O-003\]** No existing tooling in `tools/` handles evidence tag numbering or validation. ^O-003

**\[O-004\]** Current tag format uses bold markdown: `**\[TAG\]**`. The bold wrapping is consistent across all artifacts. ^O-004

### OpenSpec Workflow Context

**\[O-005\]** Evidence tags are created as part of the openspec my-workflow schema. The schema defines an 8-artifact dependency chain: whiteboard → baseline → ideal → delta → proposal → specs → design → tasks. The schema lives at `openspec/schemas/my-workflow/schema.yaml`. ^O-005

**\[O-006\]** The evidence taxonomy is defined in `schema.yaml` lines 20-34 (whiteboard instruction) and propagated via "Use the evidence taxonomy from whiteboard.md" instructions in baseline (line 67), ideal (line 121), and other artifact instructions. The rule "No untagged claims" appears at line 36. ^O-006

**\[O-007\]** Artifact templates at `openspec/schemas/my-workflow/templates/` embed the glossary table (whiteboard template lines 17-25) and use tag-type labels in section headers (baseline template: `## Inferred Facts [F-INF]`, `## Constraints [C]`, etc.). ^O-007

**\[O-008\]** The `openspec` CLI creates artifacts via `openspec new change`, `openspec instructions`, and skill-driven creation (e.g., `/brainstorming` for whiteboards). Tags are written by the LLM during artifact creation — no automated numbering or validation exists today. ^O-008

**\[C-001\]** Obsidian interprets `[text]` as wikilink syntax. Brackets in evidence tags MUST be escaped: `**\[O\]**` not `**[O]**`. Without escapes, Obsidian renders tags as broken wikilinks. ^C-001

**\[Q-004\]** What happens when a tag appears mid-line alongside other tags on the same line? (e.g., `**[O]** some text **[O]** more text`) ^Q-004

---

## Ideal Bucket

**\[A-001\]** After running the script, a body tag like `**[O]**` becomes `**\[O-001\]**` with ` ^O-001` appended to the line end. Escaped brackets (`\[` and `\]`) prevent Obsidian from interpreting tags as wikilinks. ^A-001

**\[D-001\]** Scope: processes all artifacts in a change directory together, with continuous numbering across files (e.g., O-001 in whiteboard.md, O-015 continues in baseline.md). File processing order follows the schema dependency chain. ^D-001

**\[D-002\]** Form factor: MVP standalone script, run after artifact creation. Can later be wired into openspec artifact instructions or schema rules. ^D-002

**\[A-002\]** The script should: ^A-002
- Parse the Evidence Glossary from the whiteboard to discover valid tag types (handles custom tags like `[R]`)
- Skip glossary rows and section header labels — only number body instances
- Number sequentially per tag type: O-001, O-002, ..., C-001, C-002, etc.
- Escape brackets: `**\[O-001\]**`
- Append Obsidian block anchor `^TAG-NNN` at end of the tagged line

**\[A-003\]** The script should be idempotent — safe to re-run on already-numbered tags, stripping old numbers/anchors and renumbering from scratch. ^A-003

**\[D-003\]** Implementation approach: Node.js script using `marked` markdown parser (already a project dependency). AST-based parsing can structurally distinguish glossary tables, section headers, and body text. ^D-003

**\[A-004\]** Risk: `marked` will likely parse `**[O]**` as a link node (`[O]`) wrapped in bold (`**`), not as literal bracketed text. This means the AST won't expose `[O]` as a simple text pattern — it'll be a `link` node with `text: "O"` and no `href`. A PoC is needed to validate how `marked` represents evidence tags in the AST before committing to this approach. If `marked` can't reliably identify tags, fallback to regex on raw text with line-level context detection (skip lines matching glossary table or heading patterns). ^A-004

**\[Q-002\]** Should it process a single file or all artifacts in a change directory at once? ^Q-002
**\[D-005\]** Whole change directory, continuous numbering. ^D-005

**\[Q-003\]** Should numbering be per-file or continuous across all artifacts in a change? ^Q-003
**\[D-006\]** Continuous across files. ^D-006

**\[Q-005\]** Should the script validate that all body tags exist in the glossary and warn on unknown tags? ^Q-005

**\[Q-006\]** What file processing order? Schema dependency order (whiteboard → baseline → ideal → ...) or alphabetical? ^Q-006

---

## Delta Bucket

**\[Q-001\]** Should this be a Node.js CLI tool in `tools/`, a standalone bash script, or an `openspec` subcommand? ^Q-001
**\[D-004\]** MVP standalone script. ^D-004

**\[A-005\]** Changes needed (placeholder): ^A-005
1. **PoC**: Test how `marked` parses `**[O]** Some claim` — confirm AST node structure for evidence tags
2. New Node.js script that transforms openspec markdown files in a change directory
3. Pattern: read all artifacts → parse glossary from whiteboard → identify body tags → number continuously → escape brackets → append block anchors → write back
