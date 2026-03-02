# worktree-obsidian-sync — Whiteboard

> **Change:** worktree-obsidian-sync
> **Domain:** Developer Tooling / Worktree Lifecycle
> **Date:** 2026-03-01

## Original Request

> using claude -w worktree doesn't add a /Users/wesleyfrederick/.claude/skills/syncing-obsidian-vault-symlinks automatically. How can I auto-add/delete a symlink?
>
> look at setup-worktree.sh — how could I use hooks to do this workflow? but instead of only .worktree, allowing for .claude/worktrees (make this default), updating seatbelt so our sandbox works with both .worktrees and .claude/worktrees? or even better, make existing automated workflow work, but auto sync obsidian and tear it down

**Goal:** Unify worktree lifecycle so that creating a worktree (via `claude -w` or `setup-worktree.sh`) automatically syncs Obsidian vault symlinks, and tearing it down automatically removes them. Update sandbox to handle both worktree location patterns.

---

## Evidence Glossary

| Tag | Meaning |
|-----|---------|
| **[OBS]** | **Observation** — code reviewed, behavior confirmed (cite file:line) |
| **[M]** | **Measured** — quantified data exists (cite command + result) |
| **[F-ID]** | **Fact by Identity** — true by definition, math, or structural logic |
| **[F-LK]** | **Fact Locked** — empirical conclusion frozen for analysis |
| **[A]** | **Assumed** — hypothesis, not yet tested |
| **[C]** | **Constraint** — external requirement, cannot change |
| **[D]** | **Decision** — commitment of a resource (time, effort, scope) |
| **[Q]** | **Question** — open unknown, needs investigation |
| **[E]** | **Evidence** — supporting data or artifact |
| **[H]** | **Hypothesis** — testable prediction |
| **[O]** | **Outcome** — result of an action or experiment |
| **[G]** | **Goal** — target objective |
| **[P]** | **Priority** — relative importance ranking |

---

## Artifacts & Paths

### Documentation

- [SKILL.md (syncing-obsidian-vault-symlinks)](../../../.claude/skills/syncing-obsidian-vault-symlinks/SKILL.md) — Obsidian ↔ source vault symlink rules
- [SKILL.md (git-automated-worktree)](../../cc-workflows-plugin/skills/git-automated-worktree/SKILL.md) — LLM-driven worktree setup skill
- [AUTOMATED-WORKTREE-SETUP.md](../../packages/sandbox/AUTOMATED-WORKTREE-SETUP.md) — Sandbox automation guide
- [SEATBELT-GUIDE.md](../../packages/sandbox/SEATBELT-GUIDE.md) — Seatbelt policy reference

### Source

**Worktree Setup**
- `.claude/scripts/setup-worktree.sh:62-88` — creates worktree as sibling dir `repo.worktree.scope.feature`
- `cc-workflows-plugin/src/utils/worktree.ts:34-84` — worktree detection utility (parses `.git` file)

**Sandbox / Seatbelt**
- `packages/sandbox/claude-worktree-sandbox.sh:60-112` — detects git worktree, builds write-path allow list
- `packages/sandbox/conditional-claude.sh:91-126` — `detect_worktree()` routes to sandbox vs vanilla Claude

**Hooks (settings.json)**
- `~/.claude/settings.json:153-160` — SessionStart hooks (currently only `tengu_copper_bridge` fix)
- No WorktreeCreate/WorktreeRemove hooks configured today

---

## Baseline Bucket

### Two Worktree Location Patterns

- **Sibling pattern** (`setup-worktree.sh`): `../repo.worktree.scope.feature` — used by the automated skill [OBS: `setup-worktree.sh:62-87` → `PARENT_DIR/WORKTREE_DIR` placed as sibling]
- **Nested pattern** (`claude -w`): `.claude/worktrees/<name>/cc-worktree` — used by Claude Code built-in [OBS: `git worktree list` → `.claude/worktrees/test/cc-worktree` on branch `worktree-test/cc-worktree`]
- Both patterns currently coexist: `cc-workflows.worktree.ptsf-tools` (sibling) and `.claude/worktrees/test/cc-worktree` (nested) [OBS: `git worktree list` → shows both active]

### Sandbox Handles Both Already

- `claude-worktree-sandbox.sh` uses `git rev-parse --git-common-dir` to detect worktrees generically — it doesn't hardcode paths [OBS: `claude-worktree-sandbox.sh:68-111` → auto-detects via git plumbing]
- `conditional-claude.sh` detects worktree by comparing `git-dir` vs `git-common-dir` [OBS: `conditional-claude.sh:91-126` → generic detection]
- [Q] Does the sandbox correctly allow writes to both sibling AND nested worktree locations, or does the `pwd-P` assumption break for nested worktrees inside `.claude/`?

### Obsidian Sync — Currently Manual

- Symlinks in `ObsidianVaultNew/0_SoftwareDevelopment/cc-workflows/` point to main repo content [OBS: `ls -la ObsidianVaultNew/.../cc-workflows/` → symlinks to `design-docs`, `openspec`, `CLAUDE.md`, etc.]
- No symlinks exist for any worktree content today [OBS: no worktree-related symlinks in `ObsidianVaultNew`]
- The sync skill documents the pattern: only symlink markdown-containing folders (`design-docs/`, `openspec/`, `.claude/skills/` → `claude/skills/`) [OBS: `SKILL.md:29-43` → symlink rules table]

### Hook Landscape

- `WorktreeCreate`/`WorktreeRemove` hooks exist in Claude Code but are designed for non-git VCS — they REPLACE default git behavior [C: hook must print worktree path on stdout; for git repos, Claude Code handles this natively]
- `SessionStart` hooks fire on every session, including worktree sessions [OBS: `settings.json:153-160` → SessionStart matcher is `.*`]
- `Stop`/`SessionEnd` hooks fire when sessions end [OBS: `settings.json:178-184` → Stop hook configured]

---

## Ideal Bucket

### Unified Worktree Lifecycle

- [G] Creating a worktree (either pattern) should auto-create Obsidian symlinks
- [G] Removing/tearing down a worktree should auto-remove Obsidian symlinks
- [G] `.claude/worktrees/` should be the default location (matching `claude -w` behavior)
- [G] `setup-worktree.sh` should support `.claude/worktrees/` as default while keeping sibling as fallback
- [G] Sandbox should work seamlessly with both patterns (may already — needs verification)

### Auto-Sync Behavior

- [Q] What content from a worktree needs symlinks in ObsidianVaultNew? Full `design-docs/`, `openspec/`, root `.md` files? Or just a pointer link?
- [Q] Should worktree symlinks be nested under the project (e.g., `ObsidianVaultNew/.../cc-workflows/worktrees/test/`) or flat siblings?
- [A] A `SessionStart` hook is the best insertion point for "worktree detected → create symlinks" since it fires for all session types including `claude -w`

### Teardown

- [Q] When `claude -w` prompts "keep or remove worktree?" and user chooses remove — is there a hook that fires? Or does the directory just get deleted?
- [A] A `Stop` hook could check if the worktree directory still exists; if not, clean up symlinks
- [H] A periodic cleanup sweep (broken symlink check) may be more reliable than event-driven teardown

---

## Delta Bucket

### Likely Changes

1. **`setup-worktree.sh`** — add `.claude/worktrees/<scope>/<feature>` as default location pattern, keep sibling as `--legacy` flag
2. **New hook script** — `SessionStart` hook that detects worktree + creates Obsidian symlinks
3. **New hook script** — `Stop` hook that checks for removed worktrees + cleans symlinks
4. **`settings.json`** — register new hooks
5. **Sandbox verification** — confirm both patterns work (may be a no-op if generic detection suffices)
6. **Sync skill update** — document worktree symlink pattern in `syncing-obsidian-vault-symlinks/SKILL.md`

### Open Questions

- [Q] Should we consolidate the two worktree patterns into one, or maintain both with a default preference?
- [Q] Does `setup-worktree.sh` need to change at all, or can the hook scripts handle the sync independently of how the worktree was created?
