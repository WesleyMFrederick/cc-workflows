## Context

The [extractor hook](../../../.claude/hooks/citation-manager/extractor.sh) implements ~145 lines of bash cache logic to prevent re-extraction of the same file within a Claude Code session. The tool (`citation-manager extract links`) is [completely stateless with no concept of sessions or caching](https://github.com/WesleyMFrederick/cc-workflows/issues/92#problem). This means cache logic is untestable with Vitest, unusable outside the hook, and invisible to the tool's architecture.

The [CLI Orchestrator](../../../tools/citation-manager/design-docs/ARCHITECTURE-Citation-Manager.md#Citation%20Manager.CLI%20Orchestrator) is the entry point for `extract links`, coordinating validation and extraction in a three-phase workflow (`citation-manager.ts:419-466`). Cache logic wraps this workflow — check before phase 1, write after phase 3.

**Current tool is TypeScript** (`citation-manager.ts` → `dist/citation-manager.js`). New code follows existing TS patterns with strict type safety.

The [SessionCache Component Guide](../../../tools/citation-manager/design-docs/component-guides/SessionCache%20Component%20Guide.md) documents the complete pre-refactor baseline — cache key strategy, trigger chain, storage mechanics, and boundaries.

## Goals / Non-Goals

**Goals** (from [issue #92 acceptance criteria](https://github.com/WesleyMFrederick/cc-workflows/issues/92)):
- `citation-manager extract links <file> --session <id>` returns normal JSON on first call, empty/null on subsequent calls with same session+content
- Cache key uses `session_id + content_hash` (preserving [current invalidation behavior](../../../tools/citation-manager/design-docs/component-guides/SessionCache%20Component%20Guide.md#Cache%20Key%20Strategy))
- Extractor hook reduced to stdin parsing + session_id passthrough + output formatting
- Hook no longer contains any cache check/write logic
- All existing `extract links` behavior unchanged when `--session` not provided (backward compatible)
- No user-facing behavior changes in Claude Code sessions (hook + tool produce same result)


**Non-Goals** (from [issue #92 architecture decisions](https://github.com/WesleyMFrederick/cc-workflows/issues/92#note)):
- No TTL or auto-cleanup — manual `rm -rf .citation-manager/claude-cache/` only
- No caching for `extract header` or `extract file` subcommands — [only `extract links` needs deduplication](../../../tools/citation-manager/design-docs/component-guides/SessionCache%20Component%20Guide.md#Why%20Only%20%60extract%20links%60%20Is%20Cached)
- No moving output formatting from hook into tool — [formatting stays in hook](https://github.com/WesleyMFrederick/cc-workflows/issues/92#note)
- **Deferred** (per YAGNI review — add when demand materializes):
  - `--no-cache` flag — omitting `--session` achieves the same result per [Implement When Needed](../../../ARCHITECTURE-PRINCIPLES.md#^implement-when-needed)
  - `--clear-cache` flag — `rm -rf .citation-manager/claude-cache/` suffices per [MVP-First Approach](../../../ARCHITECTURE-PRINCIPLES.md#^mvp-first)

## Decisions

### D1: New `checkExtractCache` utility module

**Decision:** Create `tools/citation-manager/src/cache/checkExtractCache.ts` as a standalone utility following [action-based file organization](../../../ARCHITECTURE-PRINCIPLES.md#^transformation-naming).

**Rationale:** Cache check/write is a deterministic I/O operation ([mechanical separation](../../../ARCHITECTURE-PRINCIPLES.md#^mechanical-separation)) — it doesn't belong in the CLI orchestrator's workflow logic or in any existing component. A dedicated module keeps the orchestrator's `extractLinks()` method focused on its [existing orchestration responsibility](../../../tools/citation-manager/design-docs/ARCHITECTURE-Citation-Manager.md#Citation%20Manager.CLI%20Orchestrator).

**Alternatives considered:**
- *Add cache logic inline to `extractLinks()` method* — rejected: bloats orchestrator, violates [single responsibility](../../../ARCHITECTURE-PRINCIPLES.md#^single-responsibility)
- *Create a CacheManager class* — rejected: [over-engineered](../../../ARCHITECTURE-PRINCIPLES.md#^over-engineered-structures) for two operations (check + write). A function-based module is simpler.
- *Inject via factory/DI* — rejected: cache is a CLI-level concern (session awareness), not a component-level concern. The orchestrator method calls it directly.

**Module exports:**

```typescript
// checkExtractCache.ts
checkExtractCache(sessionId: string, filePath: string, cacheDir: string): boolean
writeExtractCache(sessionId: string, filePath: string, cacheDir: string): void
```

### D2: Cache key = `session_id + content_hash` (preserved from hook)

**Decision:** Preserve the [existing cache key strategy](https://github.com/WesleyMFrederick/cc-workflows/issues/92#acceptance-criteria): `${sessionId}_${contentHash}` where `contentHash` is MD5 of file content. Cache entries are empty marker files in `.citation-manager/claude-cache/`.

**Rationale:** Proven in the [hook implementation](../../../.claude/hooks/citation-manager/extractor.sh) — content hash invalidates cache when file changes between reads. MD5 is sufficient for cache key deduplication (not security). Marker files are the simplest cache entry — existence = cached.

### D3: Cache check wraps `extractLinks()` at the CLI command level

**Decision:** The Commander.js action handler for `extract links` calls cache functions before/after `manager.extractLinks()`.

```
CLI action handler (extract links):
  if --session:
    if checkExtractCache(sessionId, filePath, CACHE_DIR) → exit 0 (silent)
  await manager.extractLinks(sourceFile, options)
  if --session:
    writeExtractCache(sessionId, filePath, CACHE_DIR)
```

**Rationale:** Cache depends on `--session` which comes from CLI flags, not business logic. Placing it in the action handler follows the existing pattern where `--fix` and `--scope` are handled at CLI level before delegating to components.

### D4: Cache directory auto-creation

**Decision:** If cache directory is missing, create it (`mkdirSync` with `recursive: true`). This ensures first-run correctness without manual setup.

## Risks / Trade-offs

**[Risk] New `fs` usage adds to [Scattered File I/O](../../../tools/citation-manager/design-docs/ARCHITECTURE-Citation-Manager.md#Scattered%20File%20I/O%20Operations) tech debt** → Accepted. Cache module is self-contained; can migrate to future `FileSystemManager`. Lower risk than delaying this refactor.

**[Risk] Unbounded cache growth** → Marker files are ~0 bytes each. Manual `rm -rf .citation-manager/claude-cache/` until usage patterns justify a CLI flag, per [MVP-First Approach](../../../ARCHITECTURE-PRINCIPLES.md#^mvp-first).

**[Trade-off] Hook still does formatting** → Tool returns pure JSON ([black box interface](../../../ARCHITECTURE-PRINCIPLES.md#^black-box-interfaces)), hook owns Claude-specific `## Citation:` formatting. Two places to change if format changes, but architecturally correct separation.
