# Phase → Mode Terminology Migration

## Overview

Replace all "phase" terminology with "mode" in the enforcing-development-workflow skill to eliminate confusion with "implement phase" and better represent flexible, revisitable working states.

Scope: Single file edit with 35 replacements across 6 categories.

## Critical Files

- .claude/skills/enforcing-development-workflow/SKILL.md (primary edit)

## Implementation Tasks

## Task 1: Update Section Headers (5 instances)

Replace numbered phase headers with mode:

Lines to change:
- Line 106: `### Phase 1: Discovery & Ideation → Requirements` → `### Mode 1: Discovery & Ideation → Requirements`
- Line 139: `### Phase 2: Research & Design (The Bridge)` → `### Mode 2: Research & Design (The Bridge)`
- Line 228: `### Phase 3: Sequencing` → `### Mode 3: Sequencing`
- Line 256: `### Phase 4: Implementation Plan` → `### Mode 4: Implementation Plan`
- Line 267: `#### Phase 4 Discussion Protocol` → `#### Mode 4 Discussion Protocol`

Method: Use Edit tool with exact old_string match for each header.

---

## Task 2: Update Main Heading (1 instance)

Line to change:
- Line ~85 (approximate): `## The Four Phases (Progressive Disclosure)` → `## The Four Modes (Progressive Disclosure)`

Method: Edit tool with exact match.

---

## Task 3: Update Folder Naming Patterns (2 instances)

Replace folder path examples:

Lines to change:
- Line 171: `2-design-phase/` → `2-design-mode/`
- Line 210: `2-design-phase/` → `2-design-mode/`

Method: Edit tool for each instance.

---

## Task 4: Update Table Content (5 instances)

Replace phase references in Requirements Artifacts Flow table:

Lines to change:
- Line 95: `| Phase | JTBD (Why) | FR (What) | AC (How you'll know) |` → `| Mode | JTBD (Why) | FR (What) | AC (How you'll know) |`
- Line 97: `| **Phase 1: Requirements/PRD** |` → `| **Mode 1: Requirements/PRD** |`
- Line 98: `| **Phase 2: Design** |` → `| **Mode 2: Design** |`
- Line 99: `| **Phase 3: Sequencing** |` → `| **Mode 3: Sequencing** |`
- Line 100: `| **Phase 4: Implementation** |` → `| **Mode 4: Implementation** |`

Method: Edit tool with table row exact matches.

---

## Task 5: Update File References (5 instances)

Replace phase references in file paths and links:

Lines to change:
- Line 185: `whiteboard-phase1.md` → `whiteboard-mode1.md`
- Lines 194-196: Update three links in Phase 1 Context block:
  - `whiteboard-phase1.md#Source%20System%20Analysis` → `whiteboard-mode1.md#Source%20System%20Analysis`
  - `whiteboard-phase1.md#Decisions%20Made` → `whiteboard-mode1.md#Decisions%20Made`
  - `whiteboard-phase1.md#Draft%20Acceptance%20Criteria` → `whiteboard-mode1.md#Draft%20Acceptance%20Criteria`
- Line 199: `whiteboard-phase1.md` → `whiteboard-mode1.md`

Method: Edit tool for each link/reference.

---

## Task 6: Update Example Workflow Section (4 instances)

Replace phase labels in example workflow:

Lines to change:
- Line 361: `Phase 1: Discovery & Ideation` → `Mode 1: Discovery & Ideation`
- Line 370: `Phase 2: Research & Design (The Bridge)` → `Mode 2: Research & Design (The Bridge)`
- Line 380: `Phase 3: Sequencing` → `Mode 3: Sequencing`
- Line 388: `Phase 4: Implementation Plan` → `Mode 4: Implementation Plan`

Method: Edit tool with exact text match for each line.

---

## Task 7: Update Contextual References (14 instances)

Replace remaining contextual uses of "phase" with "mode":

Key changes:
- Line 10: "Four phases" → "Four modes"
- Line 39: "Phase 2 artifacts" → "Mode 2 artifacts"
- Line 93: "at each phase" → "at each mode"
- Line 169: "Phase 2 whiteboard" → "Mode 2 whiteboard"
- Line 184: "Phase 2 links to Phase 1" → "Mode 2 links to Mode 1"
- Line 189: "links between phases" → "links between modes"
- Line 193: "Phase 1 Context:" → "Mode 1 Context:"
- Line 238: "logical phases" → "logical modes"
- Line 351: "When to skip phases?" → "When to skip modes?"
- Line 382: "Phase 1 (validation script), Phase 2 (git hook), Phase 3 (tests)" → "Mode 1 (validation script), Mode 2 (git hook), Mode 3 (tests)"
- Line 390: "each phase into" → "each mode into"
- Line 407: "Research & Design phase" → "Research & Design mode"
- Line 428: "During Research & Design phase" → "During Research & Design mode"

Method: Edit tool with contextual string replacement for each instance.

---

## Execution Strategy

Sequential edits (top to bottom of file):
1. Start with early references (line 10)
2. Progress through tables (lines 95-100)
3. Update section headers (lines 106, 139, 228, 256, 267)
4. Update contextual references throughout
5. Update file path references (lines 185, 194-196, 199)
6. Finish with example workflow section (lines 361-388)

Why sequential: Prevents line number drift between edits. Each edit maintains context for the next.

---

## Verification

After all edits:

```bash
# 1. Search for remaining "phase" (should only find "implement phase" if any)
grep -n "phase" .claude/skills/enforcing-development-workflow/SKILL.md

# 2. Verify all "mode" replacements
grep -n "Mode [1-4]" .claude/skills/enforcing-development-workflow/SKILL.md

# 3. Count instances (should be 35 "mode" instances)
grep -o "mode" .claude/skills/enforcing-development-workflow/SKILL.md | wc -l

# 4. Check file references updated
grep "whiteboard-mode1" .claude/skills/enforcing-development-workflow/SKILL.md

# 5. Check folder patterns updated
grep "2-design-mode" .claude/skills/enforcing-development-workflow/SKILL.md
```

Expected results:
- Zero "phase" instances (or only "implement phase" if it exists)
- 35+ "mode" instances (new terminology)
- All file paths use mode suffix
- All folder patterns use -mode/ suffix

---

## Risk Mitigation

Low risk change:
- Single file edit
- Search-and-replace with clear patterns
- No code changes (documentation only)
- Easy to verify with grep

Rollback: If issues found, revert single commit.
