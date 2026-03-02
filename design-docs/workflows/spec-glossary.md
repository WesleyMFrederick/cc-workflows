# Spec XML Glossary

> Reference for terms used in patch and feature specification XML documents.
> Governs how tech lead architects work and how dev agents execute it.

---

## Execution Hierarchy

| Term | Definition | Ends with |
|------|-----------|-----------|
| **task** | TodoList item. Atomic unit of work. | a commit |
| **step** | Sub-action within a task (RED, GREEN, REFACTOR, COMMIT, REVIEW) | — |
| **assertion** | Testable observable outcome. ID'd as A1, A2, etc. | pass/fail |
| **negative_assertion** | Thing that must NOT happen. ID'd as N1, N2, etc. | pass/fail |

## Agents & Flow

| Term | Definition |
|------|-----------|
| **dev_agent** | Writes tests + implements. Commits when done. |
| **reviewer** | Reviews commit against spec + assertions. Returns verdict. |
| **verdict** | `APPROVED` or `FIX_REQUIRED`. Task stays `in_progress` until APPROVED. |
| **escalation** | Same issue fails review 2x → stronger model takes over. |
| **fixture** | Test setup data: temp dirs, mock inputs, seed files. |

## Spec Types

| Type | When to use | Shape |
|------|-------------|-------|
| **patch_spec** | Single test, single commit, ≤1 primary file changed. | 1 task, 1 review cycle |
| **feature_spec** | Multi-task, staged reviews, multiple commits. | N tasks, N review cycles |

## Architecture Sections (what the spec provides)

| Section | Purpose | Who writes it |
|---------|---------|---------------|
| **overview** | 2-3 sentence grounding of the change | tech lead |
| **artifacts** | Files to create/modify + context files to read | tech lead |
| **interface_boundaries** | Function/block signatures: name, in, out, constraints, location | tech lead |
| **test_contract** | Fixtures + assertions + negative assertions | tech lead |
| **task** | TDD-sequenced steps (RED → GREEN → COMMIT → REVIEW) | tech lead |
| **verification_interface** | What the reviewer receives (spec, test, commit range) | tech lead |
| **success_criteria** | Pass/fail/escalation conditions | tech lead |

## Interface Boundary (the key concept)

The **interface_boundary** is the seam between tech lead architecture and dev agent implementation.

```xml
<boundary id="B1" type="extract|new_block|modify" location="where in the file">
  <name>function_or_block_name</name>
  <in>inputs (variables, params, types)</in>
  <out>outputs (return values, side effects, types)</out>
  <constraints>rules the implementation must follow</constraints>
  <risk>known risks from delta risk assessment</risk>
</boundary>
```

**What the spec defines (tech lead):**
- Boundary name, location, inputs, outputs
- Constraints and invariants
- Which assertion(s) verify this boundary

**What the agent decides (dev agent):**
- Implementation body (the actual code)
- Test structure (how to assert, not what to assert)
- Fixture creation details (format, temp paths)

## Linking Assertions to Boundaries

Each assertion references the boundary it verifies:

```xml
<assertion id="A1" name="transcript_copied" boundary="B2">
  File exists at expected path. Content matches source.
</assertion>
```

This lets the reviewer trace: assertion → boundary → location in code.

## Step Phases

| Phase | Meaning |
|-------|---------|
| **RED** | Write failing test(s) from test_contract assertions |
| **GREEN** | Implement boundaries until tests pass |
| **REFACTOR** | Clean up without changing behavior (optional) |
| **COMMIT** | Create commit with test + implementation |
| **REVIEW** | Dispatch reviewer, handle verdict |

## Verdicts & Flow Control

```
dev_agent: RED → GREEN → COMMIT
    ↓
reviewer: REVIEW
    ↓
APPROVED → mark task completed → next task
FIX_REQUIRED → dev_agent fixes → re-COMMIT → re-REVIEW
    ↓ (2x same issue)
ESCALATION → stronger model takes over
```

## Patch vs Feature: When to Use Each

**Use patch_spec when:**
- ≤1 primary file changed
- All changes verifiable by a single end-to-end test
- No intermediate milestones needed
- Example: status-line-transcript-link (shell script edit + gitignore)

**Use feature_spec when:**
- Multiple files created/modified
- Changes need staged verification (task 1 must pass before task 2)
- Multiple review cycles needed
- Example: continuous-learning phase3 (utils → CLI → skill → E2E)
