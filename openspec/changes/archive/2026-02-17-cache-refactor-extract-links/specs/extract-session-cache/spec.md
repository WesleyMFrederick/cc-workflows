## ADDED Requirements

### Requirement: Session-aware cache check before extraction

The `extract links` command SHALL check for a cached result before performing extraction when invoked with `--session <id>`. The [cache key](../../../../../tools/citation-manager/design-docs/component-guides/SessionCache%20Component%20Guide.md#Cache%20Key%20Strategy) is `${sessionId}_${contentHash}` where `contentHash` is MD5 of the target file's content. A cache hit means an empty marker file exists at `.citation-manager/claude-cache/${cacheKey}`.

On cache hit, the command SHALL exit silently with code 0 and produce no stdout output, [matching current hook behavior](../../../../../tools/citation-manager/design-docs/component-guides/SessionCache%20Component%20Guide.md#Cache%20Check%20Flow%20(extractor.sh%20lines%2074-86)).

#### Scenario: Cache hit returns empty output

- **WHEN** `citation-manager extract links <file> --session <id>` is called AND a marker file exists for that session+content combination
- **THEN** the command exits with code 0 and produces no stdout output

#### Scenario: Cache miss performs extraction and writes marker

- **WHEN** `citation-manager extract links <file> --session <id>` is called AND no marker file exists for that session+content combination
- **THEN** the command performs full extraction, outputs JSON to stdout, and writes an empty marker file to `.citation-manager/claude-cache/${sessionId}_${contentHash}`

#### Scenario: Content change invalidates cache

- **WHEN** a file was previously extracted in a session AND the file content has changed since that extraction
- **THEN** the content hash differs, causing a cache miss, and re-extraction occurs with a new marker file written

### Requirement: Backward compatibility without --session

The `extract links` command SHALL behave identically to current behavior when `--session` is not provided. No cache check, no cache write. This ensures [existing CLI and hook consumers](../../../../../tools/citation-manager/design-docs/component-guides/SessionCache%20Component%20Guide.md#What%20Gets%20Cached) are unaffected.

#### Scenario: No --session means no caching

- **WHEN** `citation-manager extract links <file>` is called without `--session`
- **THEN** the command performs full extraction and outputs JSON, with no cache check or cache write

### Requirement: Cache directory auto-creation

The cache directory `.citation-manager/claude-cache/` SHALL be created automatically with `recursive: true` when it does not exist. This ensures first-run correctness without manual setup.

#### Scenario: Cache directory auto-created on first invocation

- **WHEN** `citation-manager extract links <file> --session <id>` is called AND `.citation-manager/claude-cache/` does not exist
- **THEN** the directory is created with `recursive: true` AND extraction proceeds normally
