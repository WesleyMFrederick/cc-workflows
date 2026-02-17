## 1. Setup

- [x] 1.1 Create `tools/citation-manager/src/cache/` directory and `checkExtractCache.ts` module stub exporting `checkExtractCache` and `writeExtractCache` functions with correct TypeScript signatures per [D1: New checkExtractCache utility module](design.md#D1:%20New%20%60checkExtractCache%60%20utility%20module)
- [x] 1.2 Create `tools/citation-manager/test/cache/` directory and empty `checkExtractCache.test.ts` test file with Vitest imports

## 2. Cache Module Tests (RED)

- [x] 2.1 Write failing integration test: [cache miss performs extraction](specs/extract-session-cache/spec.md#Scenario:%20Cache%20miss%20performs%20extraction%20and%20writes%20marker) -- `checkExtractCache` returns `false` when no marker file exists for session+content combination
- [x] 2.2 Write failing integration test: [cache hit returns true](specs/extract-session-cache/spec.md#Scenario:%20Cache%20hit%20returns%20empty%20output) -- `writeExtractCache` creates marker file, then `checkExtractCache` returns `true` for same session+content
- [x] 2.3 Write failing integration test: [content change invalidates cache](specs/extract-session-cache/spec.md#Scenario:%20Content%20change%20invalidates%20cache) -- after writing cache for file content A, modifying file to content B causes `checkExtractCache` to return `false`
- [x] 2.4 Write failing integration test: [cache directory auto-creation](specs/extract-session-cache/spec.md#Scenario:%20Cache%20directory%20auto-created%20on%20first%20invocation) -- `checkExtractCache` and `writeExtractCache` work correctly when cache directory does not exist yet
- [x] 2.5 Verify all 4 tests fail for expected reasons (feature missing, not errors)

## 3. Cache Module Implementation (GREEN)

- [x] 3.1 Implement `checkExtractCache` in `checkExtractCache.ts`: compute [cache key](design.md#D2:%20Cache%20key%20=%20%60session_id%20+%20content_hash%60%20(preserved%20from%20hook)) as `${sessionId}_${md5(fileContent)}`, check if marker file exists at `${cacheDir}/${cacheKey}`, [auto-create cache directory](design.md#D4:%20Cache%20directory%20auto-creation) with `mkdirSync recursive: true`
- [x] 3.2 Implement `writeExtractCache` in `checkExtractCache.ts`: compute same cache key, write empty marker file to `${cacheDir}/${cacheKey}`, auto-create cache directory if missing
- [x] 3.3 Verify all 4 cache module tests pass and output is pristine

## 4. CLI Integration Tests (RED)

- [x] 4.1 Write failing E2E test: `citation-manager extract links <file> --session <id>` on first call produces JSON output (cache miss, [backward compatible](specs/extract-session-cache/spec.md#Scenario:%20No%20--session%20means%20no%20caching) extraction behavior)
- [x] 4.2 Write failing E2E test: second call with same `--session` and unchanged file produces no stdout output (cache hit, [silent exit](specs/extract-session-cache/spec.md#Scenario:%20Cache%20hit%20returns%20empty%20output))
- [x] 4.3 Write failing E2E test: `citation-manager extract links <file>` without `--session` always performs extraction with no cache interaction ([backward compatibility](specs/extract-session-cache/spec.md#Requirement:%20Backward%20compatibility%20without%20--session))
- [x] 4.4 Verify all 3 CLI tests fail for expected reasons

## 5. CLI Integration Implementation (GREEN)

- [x] 5.1 Add `--session <id>` option to `extract links` Commander.js command in `citation-manager.ts`
- [x] 5.2 Wire cache check/write around `manager.extractLinks()` in the CLI action handler per [D3: Cache check wraps extractLinks()](design.md#D3:%20Cache%20check%20wraps%20%60extractLinks()%60%20at%20the%20CLI%20command%20level): check before extraction, write after successful extraction
- [x] 5.3 Verify all CLI integration tests pass and all prior tests still pass

## 6. Hook Simplification

- [x] 6.1 Modify `.claude/hooks/citation-manager/extractor.sh`: remove cache logic (lines 27-29, 74-86, 127-129), pass `--session "$session_id"` to `citation-manager extract links` command instead. Hook retains: stdin parsing, markdown file check, `citation-manager` invocation with `--session`, output formatting for `hookSpecificOutput` JSON
- [x] 6.2 Manually test hook by reading a markdown file with citations to verify end-to-end behavior is preserved

## 7. Refactor

- [x] 7.1 Review `checkExtractCache.ts` for naming clarity, duplication, and type safety. Clean up without changing behavior.
- [x] 7.2 Review `citation-manager.ts` CLI integration for consistency with existing patterns (e.g., how `--fix` and `--scope` are handled)
- [x] 7.3 Verify all tests still pass after refactor

## 8. Commit

- [x] 8.1 Use `/git-and-github:git-create-commit` to create a single commit of all implementation work

## 9. Verify

- [x] 9.1 Use `/requesting-code-review` to review the implementation commit against [design decisions](design.md) and [spec requirements](specs/extract-session-cache/spec.md). Fix any issues found as REFACTOR work and commit separately.
- [x] 9.2 Run full test suite (`npm test`) to confirm no regressions