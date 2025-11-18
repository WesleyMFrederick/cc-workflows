# Nested Seatbelt Limitation

**Seatbelt cannot nest.** Running `sandbox-exec` inside an existing sandbox fails with:

```text
sandbox-exec: sandbox_apply: Operation not permitted
```

## Practical Impact

**Nested worktrees break:**

```text
main-repo/
└── .worktrees/
    └── implementation-worktree/     # Sandboxed
        └── .worktrees/
            └── test-worktree/       # Cannot sandbox (fails)
```

**What fails:**
- Task tool (spawns subprocess)
- Any claude CLI invocation from sandboxed worktree
- Skills that create worktrees

**What works:**
- Direct claude execution in test worktree (single sandbox level)
- File I/O via relative paths (`../../`) to parent worktree
- `--deny-path` flag for access control

## Solution

Create test worktrees as peers to implementation worktree:

```text
main-repo/
└── .worktrees/
    ├── implementation-worktree/  # Sandboxed independently
    └── test-worktree/           # Sandboxed independently
```

Or run tests without worktrees when isolation unnecessary.

## Reference

Discovered during Epic 3 implementation: `design-docs/features/20251113-fast-slow-skill-variants/user-stories/epic3-slow-variant-migration/`
