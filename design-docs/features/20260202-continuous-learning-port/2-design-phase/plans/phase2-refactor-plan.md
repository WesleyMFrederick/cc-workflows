# Plan: Revisit Phase 2 — Continuous Learning Port

**Goal:** Refactor Phase 2 artifacts with proper linkage, create spec artifact

---

## Key Clarifications

1. **Use markdown links** (`[text](path#section)`), NOT wikilinks
2. **Cite specific sections** — Use `citation-manager extract header` format (e.g., `whiteboard-phase1.md#Source System Analysis`)
3. **Tables can't be linked** — break out linkable items into bullet lists with anchors
4. **Two artifacts with distinct purposes:**
   - **-design.md** = WHY rationale (survives spec changes, explains decision history)
   - **-spec.md** = Current HOW (evolves in phases 3 & 4)
5. **Spec format:** XML in codeblock (like your template example)
6. **Port HOW specifics:** Some components = direct copy/paste, others = merged/collapsed content
7. **Avoid redundancy:** Phase 2 links to Phase 1 content, doesn't repeat it

---

## Current State

**Phase 1 artifacts (solid):**

- PRD with FR1-FR8, NFR1-NFR7 (anchored)
- Whiteboard with Draft ACs (AC-draft-1 through AC-draft-33)
- Open questions documented, decisions captured

**Phase 2 whiteboard exists with:**

- Source/target baselines (verified against continuous-learning-v2)
- 6 design decisions with rationale
- Component architecture, path mapping, risk assessment
- **Problem:** Content in tables (not linkable), uses some wikilinks

---

## Recommended Approach

**Refactor Phase 2 whiteboard (-design.md focus):**

1. Convert tables → bullet lists with anchors for linkable items
2. Use markdown links to Phase 1 artifacts
3. Focus on DECISION documentation (why we chose each approach)

**Create -spec.md (new artifact):**

- XML in codeblock format per your template
- Concrete HOW for each component
- Flag which are copy/paste vs merged content

---

## Tasks

### Task 1: Refactor Phase 2 Whiteboard

**File:** `2-design-phase/phase2-design-whiteboard.md`

**Purpose:** Document design DECISIONS (the WHY behind HOW choices)

**Changes:**

1. **Add markdown links to specific Phase 1 sections** (for `citation-manager extract header`):

   ```markdown
   > **Context:**
   > - [Source System Analysis](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#Source%20System%20Analysis)
   > - [Decisions Made](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#Decisions%20Made)
   > - [Draft ACs](../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#Draft%20Acceptance%20Criteria)
   >
   > **Requirements:** [PRD](../continuous-learning-port-prd.md)
   ```

2. **Remove Component Inventory section** — Phase 1 whiteboard already has this at [Source System Analysis](../../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#Source%20System%20Analysis). Link, don't repeat.

3. **Convert Design Decisions to bullet list with anchors:**

   ```markdown
   ### Design Decisions

   - **D1: observe.sh JSON parsing → jq** — Rewrite embedded Python3 to jq for cc-workflows convention consistency. Low translation risk (~30 lines of logic). ^decision-observe-jq
   - **D2: Instinct CLI location → `.claude/scripts/`** — MVP-first, single JS file. Migrate to tools/ workspace later if needed. ^decision-cli-location
   ...
   ```

4. **Add FR traceability (markdown links):**

   ```markdown
   ### Requirements Traceability

   - [D1](#decision-observe-jq) satisfies [FR1](../continuous-learning-port-prd.md#^FR1), [FR3](../continuous-learning-port-prd.md#^FR3)
   - [D2](#decision-cli-location) satisfies [FR8](../continuous-learning-port-prd.md#^FR8)
   ...
   ```

5. **Add Draft AC Validation section (ALL 33 ACs):**

   Process for carrying forward from [Phase 1 Draft ACs](../../1-elicit-discover-sense-make-problem-frame/whiteboard-phase1.md#Draft%20Acceptance%20Criteria):
   - Review each AC-draft-1 through AC-draft-33
   - Mark each as: ✅ Validated | ⚠️ Revised | ❌ Dropped
   - Document revision rationale inline

   Example structure:

   ```markdown
   ### Draft AC Validation

   **Observation Capture (FR1):**
   - AC-draft-1: ✅ Validated
   - AC-draft-2: ✅ Validated
   - AC-draft-3: ⚠️ REVISED — capture ALL tools (not filtered list) per resolved item #2
   - AC-draft-4: ✅ Validated

   **Performance (NFR1):**
   - AC-draft-25: ✅ Validated — jq rewrite supports <100ms

   ... (continue for all 33)
   ```

### Task 2: Create Spec Document

**File:** `continuous-learning-port-spec.md` (feature root)

**Purpose:** Final implementation spec for Sequencing — concrete HOW

**Format:** XML in codeblock (per your template)

**Structure:**

```xml
<project_specification>
  <project_name>Continuous Learning Port</project_name>

  <overview>
    Port continuous learning from everything-claude-code to cc-workflows.
    Enables pattern detection, instinct creation, behavioral memory.
  </overview>

  <components>
    <component name="observe.sh" port_type="rewrite">
      <source>everything-claude-code/skills/continuous-learning-v2/hooks/observe.sh</source>
      <target>.claude/hooks/observe.sh</target>
      <changes>
        - Rewrite 3 python3 blocks to jq (lines 60-98, 102-109, 124-141)
        - Change CONFIG_DIR from ~/.claude/homunculus to $CLAUDE_PROJECT_DIR/.claude/learned
        - Change OBSERVATIONS_FILE path accordingly
      </changes>
      <satisfies>FR1, FR2, FR3</satisfies>
    </component>

    <component name="instinct-cli.js" port_type="translation">
      <source>everything-claude-code/skills/continuous-learning-v2/scripts/instinct-cli.py</source>
      <target>.claude/scripts/instinct-cli.js</target>
      <changes>
        - Translate Python to Node.js (494 lines)
        - Use fs/path instead of pathlib
        - Port status, import, export subcommands
      </changes>
      <satisfies>FR6, FR8</satisfies>
    </component>

    <component name="start-observer.sh" port_type="copy_modify">
      <source>everything-claude-code/skills/continuous-learning-v2/agents/start-observer.sh</source>
      <target>.claude/scripts/start-observer.sh</target>
      <changes>
        - Path changes only (~/.claude/homunculus → $PROJECT/.claude/learned)
      </changes>
      <satisfies>FR7</satisfies>
    </component>

    <!-- Additional components... -->
  </components>

  <data_schemas>
    <schema name="observation">
      <!-- JSONL format spec -->
    </schema>
    <schema name="instinct">
      <!-- YAML format spec -->
    </schema>
    <schema name="config">
      <!-- config.json structure -->
    </schema>
  </data_schemas>

  <integration>
    <hook_registration>
      <!-- settings.json additions -->
    </hook_registration>
    <directory_structure>
      <!-- .claude/learned/ layout -->
    </directory_structure>
  </integration>

  <acceptance_criteria>
    <!-- Promoted from Phase 1 draft ACs with any revisions -->
  </acceptance_criteria>
</project_specification>
```

**Port type categories:**

- `copy_modify` — Direct copy with path changes only
- `rewrite` — Structural rewrite (e.g., python → jq)
- `translation` — Language translation (e.g., Python → JS)
- `new` — New file not in source

---

## Artifact Purposes Clarified

**-design.md (or whiteboard):** WHY rationale — survives spec changes

- Documents decision history and rationale
- Explains WHY we chose approach X over Y
- When spec changes in Phase 3/4, design doc explains the change reasoning
- Stable reference for "why did we do it this way?"

**-spec.md:** Current HOW — evolves with phases

- Concrete implementation instructions
- Changes as we learn more in Phase 3 (Sequencing) and Phase 4 (Implementation)
- Each component has `port_type` + specific changes
- Version-controlled — diffs show spec evolution

**Relationship:** Design doc provides stable rationale. Spec doc is living implementation guide.

---

## Files to Modify

- `2-design-phase/phase2-design-whiteboard.md` — Refactor tables → bullet lists, add markdown links
- `continuous-learning-port-spec.md` — Create NEW at feature root (XML spec format)

**Note:** Existing `continous-learning-port-design.md` can remain as-is or be merged into whiteboard (design decisions doc)

---

## Verification

After implementation:

1. Phase 2 whiteboard uses markdown links to specific sections (not wikilinks)
2. Component inventory removed (links to Phase 1 instead)
3. Design decisions are bullet lists with anchors (not tables)
4. Requirements traceability links decisions → PRD FRs
5. All 33 draft ACs reviewed with ✅/⚠️/❌ status
6. Spec document has XML structure with `port_type` for each component
7. Draft ACs validated/revised based on design context
