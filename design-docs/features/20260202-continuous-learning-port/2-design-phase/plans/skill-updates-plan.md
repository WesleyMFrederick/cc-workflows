# Plan: Skill Updates from Phase 2 Learnings

**Source:** Phase 2 design session for Continuous Learning Port
**Goal:** Update `enforcing-development-workflow` and `writing-design-documents` skills with patterns discovered

---

## Context Summary

During Phase 2 design work, we discovered several patterns that should be captured in skills:

1. **Tables can't be linked** — Obsidian `^anchor` doesn't work on table rows
2. **Two Phase 2 artifacts** — `-design.md` (WHY rationale) vs `-spec.md` (current HOW)
3. **Section-specific linking** — Link to `file.md#Section%20Name` for citation-manager extract
4. **Link don't repeat** — Phase 2 links to Phase 1 content, doesn't duplicate
5. **Draft AC carry-forward** — Explicit validation of all draft ACs with status markers

---

## Task 1: Update writing-design-documents — Artifact Distinction

**File:** `.claude/skills/writing-design-documents/SKILL.md`

**Add after line 147** (after Design Document Structure heading intro):

```markdown
## Two Phase 2 Artifacts

Phase 2 produces two distinct artifacts with different purposes:

### -design.md (Whiteboard + Design Doc)
- **Purpose:** WHY rationale — documents decision history
- **Stability:** Stable — survives spec changes
- **Contains:** Design decisions, rationale, trade-offs discussed
- **When spec changes:** Design doc explains WHY the change was made

### -spec.md (Implementation Spec)
- **Purpose:** Current HOW — concrete implementation instructions
- **Stability:** Evolves — changes in Phase 3 (Sequencing) and Phase 4 (Implementation)
- **Contains:** Component specs, interfaces, data schemas, port instructions
- **Format:** XML in codeblock (see Spec Template)

**Relationship:** Design doc provides stable rationale. Spec doc is living implementation guide.
```

---

## Task 2: Update writing-design-documents — Tables vs Bullet Lists

**File:** `.claude/skills/writing-design-documents/SKILL.md`

**Add to Common Mistakes table:**

```markdown
| Using tables for linkable items | Obsidian `^anchor` doesn't work on table rows | Use bullet lists with anchors for items needing traceability |
```

**Add to Red Flags:**

```markdown
- Tables containing items that need to be linked (use bullet lists with `^anchor` instead)
```

---

## Task 3: Update enforcing-development-workflow — Link Don't Repeat

**File:** `.claude/skills/enforcing-development-workflow/SKILL.md`

**Find Phase 2 section, add guidance:**

```markdown
**Phase 2 links to Phase 1 — doesn't repeat content.**

- Component inventory already in Phase 1? Link to `whiteboard-phase1.md#Source%20System%20Analysis`
- Decisions already made? Reference them, don't re-document
- Only add NEW decisions and adaptations in Phase 2
```

---

## Task 4: Update enforcing-development-workflow — Section-Specific Linking

**File:** `.claude/skills/enforcing-development-workflow/SKILL.md`

**Add to Phase 2 section:**

```markdown
**Use section-specific links between phases.**

Links should target specific sections for `citation-manager extract header`:

```markdown
> **Phase 1 Context:**
> - [Source System Analysis](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#Source%20System%20Analysis)
> - [Decisions Made](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#Decisions%20Made)
> - [Draft ACs](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#Draft%20Acceptance%20Criteria)
NOT just `[Phase 1 Whiteboard](../whiteboard-phase1.md)` — section links enable targeted extraction.

---

## Task 5: Update writing-design-documents — Draft AC Carry-Forward

**File:** `.claude/skills/writing-design-documents/SKILL.md`

**Add new section after "Whiteboard Structure":**

```markdown
## Draft AC Validation

Phase 1 whiteboards may contain draft ACs (`^AC-draft-N`). Phase 2 must validate ALL of them.

### Process

1. List every draft AC from Phase 1 whiteboard
2. Review each against design decisions made in Phase 2
3. Mark status: ✅ Validated | ⚠️ Revised | ❌ Dropped
4. Document revision rationale inline

### Format in Whiteboard

```markdown
## Draft AC Validation

**Observation Capture (FR1):**
- AC-draft-1: ✅ Validated
- AC-draft-2: ✅ Validated
- AC-draft-3: ⚠️ REVISED — capture ALL tools (not filtered list) per Decision 2
- AC-draft-4: ✅ Validated

**Performance (NFR1):**
- AC-draft-25: ✅ Validated — jq rewrite supports <100ms target
```

**Why:** Draft ACs inform sequencing. Unvalidated ACs create downstream confusion.

---

## Execution Instructions

Use `/writing-skills` for each task to:
1. Apply the edit
2. Run pressure tests against the skill
3. Verify skill still works correctly

**Order:** Tasks can run in parallel (independent edits to different sections)

---

## Verification

After all tasks complete:
1. Run `citation-manager validate` on both skill files
2. Test skills work with a sample design scenario
