# mcp-gdrive-update-document — Baseline

> **Change:** mcp-gdrive-update-document
> **Domain:** MCP GDrive server — tool inventory
> **Date:** 2026-02-23
> **Evidence taxonomy:** See `whiteboard.md` Evidence Glossary section

---

## Artifacts (minimum set for this baseline)

| Artifact | Path | Role in Baseline |
|----------|------|-----------------|
| Tool registry | `packages/mcp-gdrive/tools/index.ts` | Array of all registered tools — entry point for adding new tools |
| Tool types | `packages/mcp-gdrive/tools/types.ts` | `Tool<T>` interface, `InternalToolResponse`, per-tool input interfaces |
| Upload tool | `packages/mcp-gdrive/tools/gdrive_upload_file.ts` | Closest analog — creates files via Drive API, pattern to replicate |
| Server entry | `packages/mcp-gdrive/index.ts` | MCP server setup, tool dispatch loop, auth flow |
| MCP config | `.mcp.json` | Server command + env vars (OAuth credentials path) |

---

## Traces

### Trace 1: Tool Registration & Dispatch

```text
TRACE: MCP tool call dispatch (Claude calls any gdrive tool)
══════════════════════════════════════════════════════════════

 SERVER STARTUP
 ──────────────
 1. [O: index.ts:17]
    import { tools } from "./tools/index.js"
    tools = typed tuple of 6 Tool<T> objects

 2. [O: tools/index.ts:17-48]
    tools array: 6 entries, each is { ...schema, handler }
    ├── [0] gdrive_search
    ├── [1] gdrive_read_file
    ├── [2] gdrive_upload_file
    ├── [3] gdrive_download_file
    ├── [4] gsheets_update_cell
    └── [5] gsheets_read

 3. [O: tools/index.ts:25-26]                    ← KEY LINE
    Each tool entry: spread schema (name, description, inputSchema)
    + attach handler function
    Pattern: { ...gdriveSearchSchema, handler: search }

 TOOL LISTING (ListTools request)
 ────────────────────────────────
 4. [O: index.ts:102-110]
    ListToolsRequestSchema handler:
    tools.map(({ name, description, inputSchema }) => ...)
    Returns only name + description + inputSchema (strips handler)

 TOOL CALL (CallTool request)
 ────────────────────────────
 5. [O: index.ts:121-131]
    CallToolRequestSchema handler:
    │
    │  5a. [O: index.ts:122]
    │      await ensureAuth()
    │      Forces valid OAuth credentials before any tool runs
    │
    │  5b. [O: index.ts:123]                     ← KEY LINE
    │      const tool = tools.find(t => t.name === request.params.name)
    │      Name-based lookup in tools array
    │
    │  5c. [O: index.ts:124-126]
    │      Guard: tool not found → throw Error("Tool not found")
    │
    │  5d. [O: index.ts:129]
    │      const result = await tool.handler(request.params.arguments as any)
    │      Passes raw MCP arguments to handler — each tool validates internally
    │
    │  5e. [O: index.ts:130]
    │      return convertToolResponse(result)

 RESPONSE CONVERSION
 ───────────────────
 6. [O: index.ts:113-119]
    convertToolResponse(): wraps InternalToolResponse →
    { _meta: {}, content: [...], isError: bool }

══════════════════════════════════════════════════════════════
END TRACE
```

### Trace 2: Upload Tool — Drive API Create Pattern

```text
TRACE: gdrive_upload_file (Claude uploads a file)
══════════════════════════════════════════════════

 INPUT
 ─────
 1. [O: types.ts:45-50]
    GDriveUploadFileInput {
      filePath: string       (required)
      fileName?: string      (optional — defaults to basename)
      mimeType?: string      (optional — auto-detected)
      folderId?: string      (optional — root if omitted)
    }

 2. [O: gdrive_upload_file.ts:6-32]
    schema export: name, description, inputSchema with JSON Schema
    properties mirror the TypeScript interface
    required: ["filePath"]

 HANDLER EXECUTION
 ─────────────────
 3. [O: gdrive_upload_file.ts:41-46]
    Guard: fs.existsSync(args.filePath)
    FAIL → return { isError: true, text: "File not found: ..." }

 4. [O: gdrive_upload_file.ts:49-50]
    Resolve filename: args.fileName || path.basename(args.filePath)
    Create read stream: fs.createReadStream(args.filePath)

 5. [O: gdrive_upload_file.ts:52-58]
    Build requestBody: { name, parents?: [folderId] }

 6. [O: gdrive_upload_file.ts:60-67]             ← KEY LINE
    CALL ──→ drive.files.create({
      requestBody: { name, parents? },
      media: { mimeType, body: stream },
      fields: "id,name,webViewLink"
    })
    │
    │  Google Drive API: creates NEW file
    │  No fileId parameter — always creates, never updates
    │
    RETURN ←── response.data: { id, name, webViewLink }

 7. [O: gdrive_upload_file.ts:69-88]
    Success path: return {
      isError: false,
      content: JSON.stringify({ success, fileId, fileName, webViewLink })
    }

 8. [O: gdrive_upload_file.ts:89-101]
    Error path: catch → return {
      isError: true,
      text: "Failed to upload file: <message>"
    }

══════════════════════════════════════════════════
END TRACE
```

---

## Measurements

- **Tool count**: 6 tools registered [M: `tools/index.ts` lines 24-48, count of array entries]
- **Write tools**: 2 of 6 (`gdrive_upload_file`, `gsheets_update_cell`) [M: manual count from Trace 1, step 2]
- **Upload tool LOC**: 102 lines [M: `gdrive_upload_file.ts` line count]
- **Type definitions per tool**: 1 interface in `types.ts` + 1 `schema` const in tool file [M: consistent across all 6 tools]
- **Files per tool**: 1 implementation file + 1 type entry + 1 registry entry = 3 touch points [M: from Traces 1+2]

---

## Inferred Facts [F-INF]

1. **[F-INF: from Trace 1, steps 2-3]** Adding a new tool requires exactly 3 changes: (a) new `.ts` file with `schema` + handler exports, (b) new input interface in `types.ts`, (c) new entry in `tools/index.ts` array with import + spread + handler.

2. **[F-INF: from Trace 1, step 5b]** Tool dispatch is name-based (`tools.find(t => t.name === name)`). No routing table, no config — just match the `name` field in the schema. A new tool is automatically available once added to the `tools` array.

3. **[F-INF: from Trace 2, step 6]** The upload tool uses `drive.files.create()` — the Google Drive API has a separate `drive.files.update()` method that accepts a `fileId` parameter for updating existing files. The update tool can follow the same streaming pattern (`media: { body: stream }`) but target an existing file instead of creating one.

4. **[F-INF: from Trace 1, step 5a]** All tool calls go through `ensureAuth()` first. A new tool inherits auth automatically — no per-tool auth setup needed.

5. **[F-INF: from Trace 2, steps 1-2]** The schema/type pattern is 1:1 — each property in the TypeScript interface has a matching JSON Schema property in the `schema` const. New tool follows same pattern.

---

## Constraints [C]

1. **[C: .mcp.json:16-18]** Server runs from compiled JS (`dist/index.js`). Any new tool must be compiled via `npm run build` before it's available.

2. **[C: CLAUDE.md]** Write tools require `ask` permission in settings. A new write tool needs a permission entry.

3. **[C: types.ts:2-11]** `Tool<T>` interface requires: `name`, `description`, `inputSchema` (JSON Schema), and `handler` returning `Promise<InternalToolResponse>`. All tools must conform.

4. **[C: tools/index.ts:17-23]** The `tools` array is explicitly typed as a tuple. Adding a new tool means adding both a new type parameter and a new array entry.

---

## Assumptions [A]

1. **[A]** `drive.files.update()` in the `googleapis` npm package supports streaming media upload the same way `drive.files.create()` does (same `media: { body: stream }` pattern). Needs verification against googleapis types.
   - **To strengthen → [F-INF]:** Check `googleapis` TypeScript types for `drive.files.update()` — confirm `media` parameter accepts `{ mimeType, body: ReadStream }`.
   - **Utility of strengthening:** High. If the API shape differs, the implementation approach changes significantly. Worth a 30-second type check before design.

2. **[A]** Updating a Google Doc by uploading markdown content will replace the doc content (reimport). This is the simple path — the alternative (`docs.documents.batchUpdate()`) is significantly more complex.
   - **To strengthen → [F-INF]:** Test uploading a `.md` file with `drive.files.update()` against an existing Google Doc fileId and verify the content replaces.
   - **Utility of strengthening:** Low for baseline, moderate for design. Implementation will surface this immediately. The baseline only needs to document that no update path exists today.

---

## Open Questions [Q]

1. **[Q]** Does `drive.files.update()` accept the same `media` parameter shape as `drive.files.create()`? This affects whether the upload tool can be directly adapted. (Test: "Does resolving this change my understanding of how the system works TODAY?" — Yes, it clarifies what the googleapis SDK supports.)
   - **Verification plan:** Read `googleapis` types for `drive.files.update()` params, or run a quick test call.
   - **Utility of answering:** High for design — determines whether the upload tool pattern can be directly adapted or needs a different approach.
