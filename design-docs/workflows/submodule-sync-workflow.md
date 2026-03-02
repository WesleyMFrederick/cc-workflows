# Submodule Sync Workflow Trace

## Context

Trace of syncing the `.claude` git submodule in `cc-workflows` to match the local hub (`cc-workflows-plugin`). This is the "catch up" variant where the submodule pointer is behind the hub — no new commits inside the submodule need to be pushed.

**Execution date:** 2026-02-27
**Parent repo:** `cc-workflows` (main branch)
**Submodule:** `.claude` → `cc-workflows-plugin`
**Variant traced:** Submodule behind hub, no dirty working tree, no divergence requiring rebase

---

## Trace

```text
TRACE: submodule sync — catch-up to local hub
══════════════════════════════════════════════

 DISCOVERY: SUBMODULE REMOTE TOPOLOGY
 ─────────────────────────────────────
 1. [OBS: git -C .claude remote -v → "origin-local"]
    Remotes discovered:
    ├── origin-local → /Users/.../cc-workflows-plugin (local hub)
    └── github       → https://github.com/.../cc-workflows-plugin.git (backup)
    NOTE: remote name is "origin-local", not "origin"     ← KEY LINE

 DISCOVERY: FETCH FROM LOCAL HUB
 ───────────────────────────────
 2. [OBS: git -C .claude fetch origin-local → silent success]
    Fetches latest refs from local hub into submodule
    No output = no errors, refs updated silently

 DISCOVERY: COMPARE HEADS
 ────────────────────────
 3. [OBS: git -C .claude log --oneline -1 HEAD → 0de3c39]
    Submodule HEAD: 0de3c39 fix(hooks): add file-first output rules to CEO prompt hook
    Parent:         1a9ac76 chore(plugin): clean up hooks...

 4. [OBS: git -C .claude log --oneline -1 origin-local/main → 67a7bf7]
    Hub HEAD:       67a7bf7 feat(sync): add interview-coach skill...
    Parent:         1a9ac76 chore(plugin): clean up hooks...

 5. [OBS: git -C .claude log --oneline --graph origin-local/main...HEAD]
    Result: two commits, NO shared path after 1a9ac76
    ├── 0de3c39 (submodule-only commit)
    └── 67a7bf7 (hub-only commit)
    DIVERGENCE DETECTED                                    ← KEY LINE

 SAFETY CHECK: VERIFY NO CONTENT LOSS
 ─────────────────────────────────────
 6. [M: git -C .claude diff 1a9ac76..HEAD --stat]
    Submodule's unique commit changed:
    └── hooks/user-prompt-submit.sh | 2 insertions

 7. [M: git -C .claude diff 1a9ac76..origin-local/main --stat]
    Hub's commit changed:
    ├── hooks/user-prompt-submit.sh | 2 insertions (SAME file)
    └── 29 other files (new skills, hooks, etc.)

 8. [OBS: git -C .claude diff HEAD origin-local/main -- hooks/user-prompt-submit.sh]
    Result: empty (no diff)                                ← KEY LINE
    The overlapping file is IDENTICAL in both commits
    SAFE TO FAST-FORWARD — submodule commit is subset of hub commit

 MOVE SUBMODULE POINTER
 ──────────────────────
 9. [OBS: git -C .claude checkout origin-local/main → 67a7bf7]
    Detached HEAD at 67a7bf7
    Submodule now points to hub's HEAD
    WARNING: "detached HEAD" state (expected for submodules)

 VERIFY: NO UNPUSHED COMMITS
 ────────────────────────────
10. [OBS: git -C .claude log origin-local/main..HEAD --oneline → empty]
    Result: empty
    Submodule HEAD == hub HEAD — nothing to push

 PARENT REPO: STAGE + COMMIT
 ────────────────────────────
11. [OBS: git status (in parent)]
    Shows: modified: .claude (new commits, untracked content)

12. [OBS: git add .claude]
    Stages submodule pointer change (0de3c39 → 67a7bf7)

13. [OBS: git-create-commit-skill/SKILL.md:349-351]          ← KEY LINE
    Skill rule: "Dirty submodules = commit inside first, push to local hub,
    then commit pointer in parent. Always. One operation."
    In this case: submodule was NOT dirty (no new commits to push),
    so steps reduce to: move pointer → stage → commit parent

14. [OBS: git commit -F /tmp/commit-msg-1772211768.txt → 5dfcf25]
    Message: chore(deps): update .claude submodule with interview-coach skill...
    Result: [main 5dfcf25]

══════════════════════════════════════════════
END TRACE
```

---

## Fact Derivations

1. **[F-LK: from steps 5-8]** When submodule and hub diverge from the same parent, content loss risk exists. The safety check (diff the overlapping files) proves whether the submodule's unique commit is a subset of the hub's. Empty diff = safe to discard the submodule commit.

2. **[F-LK: from steps 1 + 9]** The submodule uses `origin-local` as its hub remote, not `origin`. Commands must discover the remote name dynamically — hardcoding `origin` would fail.

3. **[F-LK: from steps 9 + 10]** After `checkout origin-local/main`, the submodule is in detached HEAD state at the hub's commit. The `log origin-local/main..HEAD` check returning empty confirms alignment — no push needed.

4. **[F-ID: from step 13]** The commit skill's submodule propagation rule has three steps (commit inside → push to hub → commit parent pointer). When the submodule has no new commits (catch-up variant), steps 1-2 are skipped — only the pointer commit in the parent is needed.

### Why Each Fact Is Sound

| Fact | Cites | Derivation is valid because |
|-------|-------|---------------------------|
| #1 | steps 5-8 | [OBS: step 5] detects divergence state; [M: steps 6-7] measure change size (2 insertions); [OBS: step 8] observes identity (empty diff). Logic chain complete. |
| #2 | steps 1 + 9 | [OBS: step 1] identifies non-standard remote name; [OBS: step 9] uses that specific name. |
| #3 | steps 9 + 10 | [OBS: step 9] moves HEAD to identifier; [OBS: step 10] verifies alignment (empty log). Two-step confirm. |
| #4 | step 13 | [OBS: step 13] cites external constraint from Skill file. Catch-up variant skips 2 of 3 required steps when no commits exist to push. |

---

## Variants NOT Traced

These are alternate execution paths that would produce different traces:

- **Dirty submodule** — working tree has uncommitted changes → must commit inside first, then push to hub, then commit parent pointer (full 3-step propagation)
- **Hub behind submodule** — submodule has commits the hub doesn't → push submodule to hub before committing parent pointer
- **True divergence with conflicts** — overlapping file diff is NOT empty → must rebase or merge inside submodule before proceeding
- **Hub-ahead with rebase** — `git -C .claude pull --rebase origin-local main` before push (documented in skill edge case section)
