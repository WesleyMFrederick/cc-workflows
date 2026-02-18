# Extract Verbose Flag — Whiteboard

> **Change:** extract-verbose-flag
> **Domain:** tools/citation-manager
> **Date:** 2026-02-17

## Original Request

> Create a `--verbose` output flag that displays the current output. Make a new default that will reduce the number of tokens sent back to LLM when it runs `citation-manager extract`.

**Goal:** Reduce token cost across `citation-manager extract` AND `validate` by introducing two output dimensions:
1. **Verbosity:** `--verbose` (current full output) vs default (compact)
2. **Format:** `--json` (programmatic) vs default CLI (human/hook readable)

---

## Artifacts & Paths

### Documentation

- [ARCHITECTURE-Citation-Manager.md](../../../tools/citation-manager/design-docs/ARCHITECTURE-Citation-Manager.md) — system architecture
- [tools/citation-manager/README.md](../../../tools/citation-manager/README.md) — tool overview and usage
- [tools/citation-manager/test/README.md](../../../tools/citation-manager/test/README.md) — test strategy

### Source - CLI & Orchestration (files reviewed)

- [`src/citation-manager.ts`](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/citation-manager.ts) — CLI entry point + `CitationManager` class
  - [Lines 1131-1291](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/citation-manager.ts:1131:1291): CLI wiring for all 3 extract subcommands
  - [Lines 429-480](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/citation-manager.ts:429): `extractLinks()` orchestration
  - [Lines 519-575](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/citation-manager.ts:519): `extractHeader()` orchestration
  - [Lines 612-687](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/citation-manager.ts:612): `extractFile()` orchestration
  - [Line 466](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/citation-manager.ts:466): `console.log(JSON.stringify(result, null, 2))` — the output call

### Source - Content Extraction (files reviewed)

- [`core/ContentExtractor/ContentExtractor.ts`](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/core/ContentExtractor/ContentExtractor.ts:88) — extraction + deduplication logic (Lines 88-235)
- [`core/ContentExtractor/extractLinksContent.ts`](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/core/ContentExtractor/extractLinksContent.ts:57) — direct source file extraction path (Lines 57-212)
- [`core/ContentExtractor/generateContentId.ts`](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/core/ContentExtractor/generateContentId.ts) — SHA-256 content hashing
- [`core/ContentExtractor/analyzeEligibility.ts`](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/core/ContentExtractor/analyzeEligibility.ts) — eligibility strategy chain

### Source - Types (files reviewed)

- [`types/contentExtractorTypes.ts`](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/types/contentExtractorTypes.ts) — output type definitions
  - [Lines 44-48](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/types/contentExtractorTypes.ts:44): `ExtractedContentBlock` — content, contentLength, sourceLinks
  - [Lines 54-67](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/types/contentExtractorTypes.ts:54): `ProcessedLinkEntry` — sourceLink, contentId, status, failureDetails
  - [Lines 80-86](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/types/contentExtractorTypes.ts:80): `ExtractionStats` — totalLinks, uniqueContent, duplicates, tokensSaved, compressionRatio
  - [Lines 95-102](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/types/contentExtractorTypes.ts:95): `OutgoingLinksExtractedContent` — top-level output structure
- [`types/validationTypes.ts`](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/types/validationTypes.ts) — `EnrichedLinkObject` with validation metadata
- [`types/citationTypes.ts`](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/types/citationTypes.ts) — `LinkObject` base type

### Source - Factories & Cache (files reviewed)

- [`factories/LinkObjectFactory.ts`](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/factories/LinkObjectFactory.ts) — synthetic link creation for header/file extraction
- [`factories/componentFactory.ts`](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/factories/componentFactory.ts) — eligibility strategy chain wiring
- [`cache/checkExtractCache.ts`](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/src/cache/checkExtractCache.ts) — session cache mechanism

### Hooks (files reviewed)

- `.claude/hooks/citation-manager/extractor.sh` — PostToolUse:Read hook, calls `extract links`, parses JSON with `jq`
- `.claude/hooks/citation-manager/validator.sh` — PostToolUse:Write|Edit hook, calls `validate`, checks exit codes only
- `.claude/hooks/hooks.json` — hook configuration (PostToolUse matchers)

### Tests (relevant to extract)

- [`test/cli-integration/extract-links-session-cache.test.ts`](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/test/cli-integration/extract-links-session-cache.test.ts) — CLI integration tests for extract
- [`test/unit/citation-manager-cli-wiring.test.ts`](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/test/unit/citation-manager-cli-wiring.test.ts) — CLI wiring unit tests
- [`test/unit/citation-manager-methods.test.ts`](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/test/unit/citation-manager-methods.test.ts) — method-level unit tests

### OpenSpec Change

- [`.openspec.yaml`](vscode://file//Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/openspec/changes/extract-verbose-flag/.openspec.yaml) — change metadata

---

## Baseline State

Claims about the current system, classified by evidence strength:
- **[MEASURED]** — quantified data exists
- **[OBSERVED]** — code/behavior reviewed and confirmed
- **[ASSUMED]** — hypothesis, untested

### Baseline Process Tree

Three entry points into citation-manager, each with different consumer needs:

```text
× (entry point — exclusive choice)
│
├── → (extractor hook: PostToolUse:Read)              [O](extractor.sh)
│   ├── trigger: LLM reads .md file
│   ├── call: citation-manager extract links <file> --session <id>
│   ├── receive: full JSON to stdout (94KB)            [M](### Baseline Measurements) 
│   ├── parse: jq '.extractedContentBlocks'            [O](line 109)
│   ├── discard: .outgoingLinksReport (44KB, 46%)      [O](??? what lines ???]
│   ├── format: "## Citation: <hash>\n\n<content>"    [O](line 121]
│   └── output: hookSpecificOutput.additionalContext [O](??? what lines ???)
│
├── → (validator hook: PostToolUse:Write|Edit)         [OBSERVED: validator.sh]
│   ├── trigger: LLM writes/edits .md file
│   ├── call: citation-manager validate <file>
│   ├── receive: text via 2>&1                         [OBSERVED: line 78]
│   ├── check: exit code only (0=pass, else=block)     [OBSERVED: lines 81-101]
│   └── output: colored text to stderr (no JSON parsing)
│
└── → (CLI direct)                                     [OBSERVED: whiteboard recon]
    ├── invoke: citation-manager <command> [options] <file>
    ├── × (command — exclusive choice)
    │   ├── extract links  → JSON stdout                [MEASURED: 94KB]
    │   ├── extract header → JSON stdout
    │   ├── extract file   → JSON stdout
    │   └── validate       → text stdout                [MEASURED: 7.6KB]
    └── consumer: LLM reads raw stdout
```

### Baseline Measurements

**Test file:** `producttank-sf/openspec/changes/pdf-split-pypdf-adapter/design.md`

```bash
# Reproduce measurements
TEST_FILE="/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/producttank-sf/openspec/changes/pdf-split-pypdf-adapter/design.md"

# Extract baseline
citation-manager extract links "$TEST_FILE" 2>/dev/null > /tmp/extract-baseline.json
cat /tmp/extract-baseline.json | jq '{total_chars: (. | tostring | length), content_blocks_chars: (.extractedContentBlocks | tostring | length), report_chars: (.outgoingLinksReport | tostring | length), stats_chars: (.stats | tostring | length), block_count: (.extractedContentBlocks | keys | length - 1), link_count: (.outgoingLinksReport.processedLinks | length), stats: .stats}'

# Validate baseline
citation-manager validate "$TEST_FILE" 2>&1 | wc -c
```

#### Extract Output [MEASURED]

**Total output: 94KB** — 41 links, 20 unique content blocks

| Section | Size | % of Total | Consumer Uses? |
|---------|------|-----------|----------------|
| `extractedContentBlocks` | 50KB | 54% | Yes — actual content |
| `outgoingLinksReport` | 44KB | 46% | No — hook discards, LLM ignores |
| `stats` | 124B | ~0% | Maybe — useful for status |

**Single processedLink entry: ~1KB** of nested paths, validation, and link metadata — repeated 41 times.

#### Validate Output [MEASURED]

- **File:** [design](../../../../producttank-sf/openspec/changes/pdf-split-pypdf-adapter/design.md)
- **Total output: 7.6KB** — 47 citations, all valid
- Current output lists every valid citation with file path and line number
- When all pass, useful information is just: `47 citations valid`
- Errors/warnings already display useful detail (file path, suggestion, line number)

### Token Waste Sources (ranked)

1. [MEASURED] **`processedLinks[].sourceLink`** — Each contains full EnrichedLinkObject:
   - `target.path.{raw, absolute, relative}` — 3 path variants per link
   - `validation: { status: "valid" }` — redundant for successful extractions
   - `linkType`, `scope`, `anchorType`, `line`, `column` — metadata LLM doesn't need
2. [OBSERVED] **`extractedContentBlocks` keys** — SHA-256 hashes as keys (64 chars each)
3. [OBSERVED] **Pretty-print indentation** — 2-space indent on deeply nested JSON
4. [OBSERVED] **`sourceLinks[]` in content blocks** — Traceability data (rawSourceLink, sourceLine)

### Baseline Output Shape (extract links)

```json
{
  "extractedContentBlocks": {
    "_totalContentCharacterLength": 4523,
    "sha256hash1": {
      "content": "## Header\n\nContent extracted from this section...",
      "contentLength": 152,
      "sourceLinks": [
        { "rawSourceLink": "[Link Text](path/to/file.md#Header)", "sourceLine": 10 }
      ]
    }
  },
  "outgoingLinksReport": {
    "processedLinks": [
      {
        "sourceLink": {
          "linkType": "markdown",
          "scope": "cross-document",
          "anchorType": "header",
          "target": {
            "path": {
              "raw": "path/to/file.md",
              "absolute": "/Users/.../path/to/file.md",
              "relative": "../../path/to/file.md"
            },
            "anchor": "Header"
          },
          "fullMatch": "[Link Text](path/to/file.md#Header)",
          "line": 10,
          "validation": { "status": "valid" }
        },
        "contentId": "sha256hash1",
        "status": "extracted"
      }
    ]
  },
  "stats": {
    "totalLinks": 2,
    "uniqueContent": 1,
    "duplicateContentDetected": 1,
    "tokensSaved": 152,
    "compressionRatio": 43.2
  }
}
```

### Baseline Exit Codes

- `0` — success (content extracted or cache hit)
- `1` — no content extracted / validation failure
- `2` — system error

### Existing CLI Options (extract links)

- `--scope <folder>` — base directory for resolution
- `--format <type>` — reserved (currently unused beyond "json")
- `--full-files` — enable full-file extraction
- `--session <id>` — session cache deduplication

---

## Ideal State

Target system configuration expressed in same units as Baseline.

### Ideal Process Tree

```text
× (entry point — exclusive choice)
│
├── → (extractor hook: PostToolUse:Read)
│   ├── trigger: LLM reads .md file
│   ├── call: citation-manager extract links <file> --session <id>
│   ├── receive: compact output to stdout (~50KB)
│   ├── parse: ???                                     ← depends on format decision
│   ├── format: "## Citation: <hash>\n\n<content>"
│   └── output: hookSpecificOutput.additionalContext (markdown text)
│
├── → (validator hook: PostToolUse:Write|Edit)
│   ├── trigger: LLM writes/edits .md file
│   ├── call: citation-manager validate <file>
│   ├── receive: compact text (errors + summary only)
│   ├── check: exit code (unchanged)
│   └── output: colored text to stderr
│
└── → (CLI direct)
    ├── invoke: citation-manager <command> [options] <file>
    ├── × (command — exclusive choice)
    │   ├── extract links  → compact stdout (~50KB)
    │   ├── extract header → compact stdout
    │   ├── extract file   → compact stdout
    │   └── validate       → compact text stdout
    └── consumer: LLM reads raw stdout
```

### Ideal Claims

- [ASSUMED] Compact output reduces LLM token cost by ~47% on extract
- [ASSUMED] Hiding valid citations on validate reduces noise without losing actionable info
- [HYPOTHESIS] `--verbose` flag restores current output for backward compatibility and debugging

### Extract Default Output Mockup (YAML)

```yaml
# Content Extraction Report
# File: design.md
# Extracted: 20 blocks from 41 links (21 duplicates removed)

- source_line: 3
  link_text: "shallow page copies"
  target: "whiteboard.md#Root Cause"
  chars: 792
  content: |
    ## Root Cause

    **pdf-lib's `copyPages` does shallow page copies.** It copies the page
    content stream but does not properly resolve:

    1. **Annotations** - separate objects referenced by the page's `/Annots` array
    2. **Shared font programs** - embedded at document level, referenced across pages
    3. **Cross-reference resources** - objects defined outside the page tree

- source_line: 5
  link_text: "POC 3"
  target: "VALIDATED_PATTERNS_V3.md#Validated Patterns V3"
  chars: 13308
  content: |
    # Validated Patterns V3: Effect Service + @effect/platform Command

    **Date:** 2026-02-13
    **Status:** All patterns validated -- type-checks clean, runtime succeeds

- source_line: 64
  link_text: "single-step venv check"
  target: "whiteboard.md#Should-do"
  chars: 230
  content: |
    ### Should-do
    - Simplify venv check to `fs.access` + `mapError` (one step, not two)
    - Use `Effect.logDebug` instead of `console.error` in `Effect.sync`
    - Validate array length parity between decoded chapters and input boundaries

# Stats:
#   unique_blocks: 20
#   duplicates_removed: 21
#   compression_ratio: 51.2%
```

### Validate Default Output Mockup (all valid)

```text
Citation Validation Report
==========================

File: design.md
Processed: 47 citations found

ALL CITATIONS VALID

SUMMARY:
- Total citations: 47
- Valid: 47
- Warnings: 0
- Critical errors: 0
```

### Validate Default Output Mockup (with errors)

```
Citation Validation Report
==========================

File: design.md
Processed: 47 citations found

CRITICAL ERRORS (2)
├─ Line 19: [ARCHITECTURE.md](../../tools/ARCHITECTURE.md)
│  └─ File not found: ../../tools/ARCHITECTURE.md
│
└─ Line 35: [README.md](../README.md#Missing Header)
   └─ Header "Missing Header" not found in file

WARNINGS (1)
└─ Line 42: [old-doc.md](../deprecated/old-doc.md)
   └─ File exists but is in deprecated directory

SUMMARY:
- Total citations: 47
- Valid: 44
- Warnings: 1
- Critical errors: 2
```

### Output Matrix

| Command | Default | `--verbose` |
|---------|---------|-------------|
| `extract links` | Compact (content + stats) | Current full JSON |
| `extract header` | Compact (content + stats) | Current full JSON |
| `extract file` | Compact (content + stats) | Current full JSON |
| `validate` | Errors/warnings + summary line | Current full output (valid citations listed) |

---

## Delta (Baseline → Ideal)

### Same-Units Comparison

| Attribute | Baseline | Ideal | Delta |
|---|---|---|---|
| **extract.output_size** | 94KB [HYPOTHESIS] | ~50KB | -44KB (-47%) |
| **extract.sections_included** | contentBlocks + report + stats | contentBlocks + stats | remove report |
| **extract.metadata_per_link** | full EnrichedLinkObject (~1KB x 41) | none | strip all link metadata |
| **extract.output_format** | JSON pretty-printed | ??? | **UNRESOLVED** |
| **validate.output_when_all_valid** | all 47 citations listed (7.6KB) | summary line (~200B) | -7.4KB (-97%) |
| **validate.output_when_errors** | all citations + errors | errors/warnings + summary | hide valid citations |
| **extractor_hook.input_format** | JSON | ??? | depends on format decision |
| **extractor_hook.jq_query** | `.extractedContentBlocks` | ??? | depends on format decision |
| **extractor_hook.waste_bytes** | 44KB (46%) [MEASURED] | 0 target | eliminate waste |
| **validator_hook.json_parsing** | none | none | **no change** |
| **validator_hook.exit_code_check** | 0/else | 0/else | **no change** |
| **--verbose flag** | does not exist | exists (restores baseline output) | add flag |
| **exit_codes** | 0/1/2 | 0/1/2 | **no change** |

### Structural Observations

1. **Validator hook has zero format risk** — doesn't parse output, just checks exit codes. Both trees identical for this path.

2. **Extractor hook's end-output is identical** in baseline and ideal (markdown text). Only the intermediate format changes. The hook is a transformer, not a final consumer.

3. **The only unresolved attribute is `extract.output_format`** — everything else in the delta is mechanically derivable from that single decision.

### Unresolved Decisions

> **`extract.output_format`**: The cascade decision. If compact format remains JSON (stripped report), the hook's jq query works with zero changes. If compact format changes to YAML, the hook must be updated to parse YAML instead of JSON. This single decision determines whether the hook is in-scope or out-of-scope for the delta.

> **Hook scope**: Is `extractor.sh` part of this delta (update it), or a constraint (work around it)? Depends on the format decision above.

### Risk Assessment

The CRITICAL RISK from the first design attempt (hook needs JSON, default changes to YAML) is now visible in the same-units table as the `extract.output_format = ???` cell. The risk exists **only if** format changes from JSON to something else. If we keep JSON but strip the report, there is no format break.

Previous decisions from first design attempt are **invalidated** pending format resolution:
- `^decision-one-flag` — assumed two modes sufficient; process tree revealed three consumers
- `^decision-extract-format` — assumed YAML default; hook path requires JSON or hook update

---

## Meta: Workflow Observations

This brainstorming session surfaced gaps in the standard whiteboard workflow:

1. **Missing baseline process model** — The original whiteboard had good measurements but no process tree. Without modeling entry points (CLI direct, extractor hook, validator hook) and their different consumer needs, we couldn't see that a format change would break the hook path.

2. **Same-units comparison** revealed that the format decision is the **single unresolved variable** — everything else is mechanically derivable. This focus was invisible in the flat Recon Findings + Decisions structure.

3. **Evidence classification** ([MEASURED], [OBSERVED], [ASSUMED]) makes explicit which claims are grounded vs hypothetical. The first design attempt treated "LLM doesn't use metadata" as fact when it was [ASSUMED].

4. **Process trees** (sound by construction) prevent modeling artifacts like deadlocks that distract from actual system behavior. The ASCII notation is LLM-readable and zero-dependency.

5. **Decisions as resource commitments** — Premature decisions lock resources before the delta is fully computed. B/D/I defers commitment until baseline and ideal are expressed in same units and the delta is visible.

## Glossary

Different kind of **CLAIMS**
- **\[D\]** = Decision (locked choice that commits time/resources towards one path vs another)
- **\[F-ID\]** = Fact-Identity (true by definition, i.e. Revenue = New Sales Units x Unit Price - Churn Units x Unit price) 
- **\[F-LOCK\]** = Fact-Locked (claim we treat as given to unblock planning, analysis, decisions. open to change later but would require a new sequence of planning)
- **\[Q\]** = Open Question we use to organize **CLAIMS**
- **\[C\]** = Constraint (must-hold boundary)
- **\[A\]** = Assumption (untested or unobserved claim with unknown evidence weight / probability. Used as a building block to unblock analysis, planning, but the confidence in assumption is the weak link in analysis, plan,  )
- **\[H\]** = Hypothesis (uncertain claim about the world, testable)
- **\[T\]** = Test created by a **\[D\]** ecision to generate **\[O\]** bservations & **\[M\]** etrics (i.e. Proof of Concepts, A/B, etc.)
- **\[E\]** = Evidence (observed output/result linked to a Hypthosis Test)
- **\[O\]** = Observation
- **\[M\]** = Metric (quantifiable observations)
