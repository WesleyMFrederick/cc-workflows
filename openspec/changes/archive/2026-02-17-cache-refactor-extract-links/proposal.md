## Why

The citation extractor hook (`.claude/hooks/citation-manager/extractor.sh`) implements session-based caching in ~145 lines of bash to prevent duplicate `citation-manager extract links` calls from overloading Claude's context window. This cache logic — file-based marker files keyed by `session_id + content_hash` — belongs in the tool itself, not in a shell script. Moving it into `citation-manager` makes the cache testable, reusable across invocation contexts (not just hooks), and maintainable in the same codebase as the extraction logic it guards.

GitHub issue: [#92](https://github.com/WesleyMFrederick/cc-workflows/issues/92)

## Baseline

The [SessionCache Component Guide](../../../tools/citation-manager/design-docs/component-guides/SessionCache%20Component%20Guide.md) documents the pre-refactor state of session caching as implemented in `extractor.sh`. Key baseline facts:

- [Cache key strategy](../../../tools/citation-manager/design-docs/component-guides/SessionCache%20Component%20Guide.md#Cache%20Key%20Strategy): `session_id + md5(file_content)` with empty marker files
- [Only `extract links` is cached](../../../tools/citation-manager/design-docs/component-guides/SessionCache%20Component%20Guide.md#Why%20Only%20%60extract%20links%60%20Is%20Cached) — manual subcommands (`extract header`, `extract file`) are intentional and don't need deduplication
- [Cache check flow](../../../tools/citation-manager/design-docs/component-guides/SessionCache%20Component%20Guide.md#Cache%20Check%20Flow%20(extractor.sh%20lines%2074-86)): ~145 lines of bash handling stdin parsing, cache check/write, extraction, and output formatting
- [Problem P3](../../../tools/citation-manager/design-docs/component-guides/SessionCache%20Component%20Guide.md#^P3): Cache logic in bash is untestable with Vitest — the core motivation for this refactor

## What Changes

- **Add session-aware caching to `extract links` command**: Cache enabled by default when `--session <id>` is provided. Tool returns empty output on cache hit, normal JSON on cache miss.
- **Add `--no-cache` flag**: Opt out of caching for any `extract` subcommand invocation.
- **Add `--clear-cache` flag**: Manually clear all cached extraction results from `.citation-manager/claude-cache/`.
- **Thin out extractor hook**: Remove cache logic from `extractor.sh` (~100 lines of bash). Hook becomes a thin passthrough: parse stdin, pass `--session` to tool, format tool output for Claude's `hookSpecificOutput` JSON.
- **Preserve hook formatting**: The `## Citation:` markdown formatting and `hookSpecificOutput` JSON wrapping remain in the hook — the tool returns data, the hook shapes it for Claude.

## Capabilities

### New Capabilities
- `extract-session-cache`: Session-aware caching for `extract links` command. File-based cache keyed by session_id + content hash, default ON with `--session`, opt-out via `--no-cache`, manual cleanup via `--clear-cache`.

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **Code**: `tools/citation-manager/src/citation-manager.js` (CLI orchestrator — new flags, cache check/write logic), new cache utility module
- **Hook**: `.claude/hooks/citation-manager/extractor.sh` (simplified from ~145 to ~20 lines)
- **Cache dir**: `.citation-manager/claude-cache/` (unchanged location, now managed by tool instead of hook)
- **Dependencies**: None new — uses Node.js `fs` and `crypto` (for content hashing) already available
- **Breaking changes**: None — hook consumers see identical output format. Direct CLI users gain new optional flags.
