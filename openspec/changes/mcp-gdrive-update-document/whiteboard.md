# mcp-gdrive-update-document — Whiteboard

> **Change:** mcp-gdrive-update-document
> **Domain:** MCP GDrive server — tool inventory
> **Date:** 2026-02-23

## Original Request

> update mcp-gdrive so it can update a document file

**Goal:** Add the ability to update an existing Google Drive file's content in place, closing the gap between "create new file" and "read file" in the current tool inventory.

---

## Evidence Glossary

| Tag | Meaning |
|-----|---------|
| **[OBS]** | **Observation** — code reviewed, behavior confirmed (cite file:line) |
| **[M]** | **Measured** — quantified data exists (cite command + result) |
| **[F-LK]** | **Fact Locked** — empirical conclusion frozen for analysis |
| **[F-ID]** | **Fact by Identity** — true by definition, math, or structural logic |
| **[A]** | **Assumed** — hypothesis, not yet tested |
| **[C]** | **Constraint** — external requirement, cannot change |
| **[D]** | **Decision** — commitment of a resource (time, effort, scope) |
| **[Q]** | **Question** — open unknown, needs investigation |

---

## Artifacts & Paths

### Documentation

- [CLAUDE.md](../../../CLAUDE.md) — MCP GDrive section defines permissions, re-auth, rebuild commands

### Source

**Server entry point:**
- `packages/mcp-gdrive/index.ts` — MCP server setup, tool registration loop (lines 102–131), auth flow
- `packages/mcp-gdrive/auth.ts` — credential loading, token refresh

**Tool implementations:**
- `packages/mcp-gdrive/tools/index.ts` — tool registry array, 6 tools registered (lines 17–48)
- `packages/mcp-gdrive/tools/types.ts` — `Tool<T>` interface, `InternalToolResponse`, per-tool input interfaces (lines 1–55)
- `packages/mcp-gdrive/tools/gdrive_upload_file.ts` — `drive.files.create()` call (line 60), accepts `filePath`, streams via `fs.createReadStream` (line 50)
- `packages/mcp-gdrive/tools/gdrive_read_file.ts` — MIME-type detection (line 53), Google Docs export as markdown (line 57), regular file download (line 87)
- `packages/mcp-gdrive/tools/gdrive_search.ts`
- `packages/mcp-gdrive/tools/gdrive_download_file.ts`
- `packages/mcp-gdrive/tools/gsheets_update_cell.ts`
- `packages/mcp-gdrive/tools/gsheets_read.ts`

**Consumer / Config:**
- `.mcp.json` — gdrive server entry, runs `packages/mcp-gdrive/dist/index.js` with OAuth env vars (lines 15–25)

---

## Baseline Bucket

- **[OBS]** 6 tools registered in `tools/index.ts:17-48`: `gdrive_search`, `gdrive_read_file`, `gdrive_upload_file`, `gdrive_download_file`, `gsheets_update_cell`, `gsheets_read`
- **[OBS]** `gdrive_upload_file` calls `drive.files.create()` at `gdrive_upload_file.ts:60` — always creates a new file, never updates existing
- **[OBS]** No `fileId` parameter in `GDriveUploadFileInput` (`types.ts:45-50`) — no way to target an existing file
- **[F-LK]** No tool in the current inventory can update an existing file's content — `upload` creates, `read` reads, `download` downloads
- **[OBS]** Each tool follows a consistent pattern: separate `.ts` file with `schema` export + handler function, input type in `types.ts`, registered in `tools/index.ts`
- **[OBS]** `gdrive_read_file` detects Google Docs via `application/vnd.google-apps` MIME prefix (`gdrive_read_file.ts:53`) and exports Google Docs as markdown (`gdrive_read_file.ts:57`)
- **[OBS]** `gdrive_upload_file` streams files via `fs.createReadStream()` (`gdrive_upload_file.ts:50`) — not base64
- **[OBS]** Server dispatches tool calls by name lookup in `index.ts:122-131`
- **[C]** MCP permissions in `settings.local.json` — write tools require `ask` permission (from CLAUDE.md)

---

## Ideal Bucket

- **[A]** New tool `gdrive_update_file` that accepts `fileId` + new content and updates the file in place
- **[A]** Works for both regular files and Google Docs
- **[D]** Follows the same tool pattern as existing tools (schema + handler + types)
- **[A]** Claude can update documents it previously created or searched for by fileId
- **[Q]** What does "document file" mean in the original request? Narrow (Google Docs only) vs broad (any Drive file)?
- **[Q]** What content input format — local file path (like `upload`) vs text string (simpler for Claude-generated content) vs both?
- **[Q]** For Google Docs: use `drive.files.update()` with media reimport (simple, may lose formatting) or `docs.documents.batchUpdate()` (complex structured API)?

---

## Delta Bucket

<!-- Placeholder — cannot be completed until baseline and ideal are done. -->

- **[F-LK]** New file `packages/mcp-gdrive/tools/gdrive_update_file.ts` — follows existing tool-per-file pattern
- **[F-LK]** New input type `GDriveUpdateFileInput` in `types.ts` — follows existing type-per-tool pattern
- **[F-LK]** New entry in `tools/index.ts` registry
- **[F-LK]** Permission entry in `settings.local.json` / CLAUDE.md — follows existing write-tool permission pattern
