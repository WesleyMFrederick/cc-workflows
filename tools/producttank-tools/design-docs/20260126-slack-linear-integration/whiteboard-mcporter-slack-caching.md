# Whiteboard: MCPorter-Based Slack Conversation Caching

**Date**: 2026-01-29
**Phase**: Discovery & Ideation
**Context**: Slack-Linear integration for ProductTank SF event management

## Problem Statement

**Current Pain**: Repeated MCP server calls to Slack are slow and inefficient when analyzing event coordination conversations. Each exploration requires re-fetching the same channel history and threads.

**Specific Need**: Get all conversations (including threads) from `#organizers-26-02-25-vanessa-cribl` into a JSON file for:
- Faster analysis without MCP overhead
- Offline review and pattern detection
- Repeatable queries against cached data
- Integration with Linear CLI workflows

**Why MCPorter**: Programmatic MCP client that can compose TypeScript/CLI tools for caching, versus current interactive MCP exploration.

---

## Discovery Findings

### Existing Slack Exploration Work

**Research Complete** (`task14-slack-exploration-findings.md`, 2026-01-27):
- 25 channels documented (10 public, 15 private)
- 5 message pattern categories identified
- Event channel naming: `#organizers-YY-MM-DD-speaker-sponsor`
- DRI status threads, A/V coordination, sponsor pipeline tracked
- Time range: 2-7 days of history analyzed

**Current MCP Approach**:
- `.mcp.json` configured with `slack-mcp-server@latest`
- User OAuth token with 13 scopes
- 5 MCP functions: `channels_list`, `conversations_history`, `conversations_replies`, `conversations_search_messages`, `conversations_add_message`

### Codebase Architecture Assessment

**MCPorter Status**: NOT installed
- Would need: `pnpm add mcporter`
- Provides: TypeScript runtime + CLI + code-gen for MCP servers
- Fits between existing CLI tools (citation-manager) and MCP servers (mcp-gdrive)

**ProductTank Tools Structure**:
- `/tools/producttank-tools/` - Design docs only (no package.json yet)
- Skills: `ptsf-event-status-update`, `ptsf-create-monthly-event`
- No implementation code yet

**Existing Patterns to Reuse**:
1. **Promise-Based Cache** (citation-manager `ParsedFileCache.ts`):
   - Caches promises (not resolved values) for concurrent deduplication
   - Auto-cleanup on errors
   - Pattern: `Map<string, Promise<ParsedDocument>>`

2. **CLI Tool Pattern** (citation-manager):
   - Commander-based CLI argument parsing
   - Factory pattern for components
   - JSON + text output formats
   - Exit codes for CI/CD

3. **MCP Server Pattern** (mcp-gdrive):
   - `@modelcontextprotocol/sdk` v0.5.0
   - TypeScript with strict types
   - Tool + Resource handler architecture

**Workspace Config**:
- MCPorter config exists: `config/mcporter.json` (context7, perplexity, language-server, linear)
- Active MCP config: `.mcp.json` (slack configured)
- Monorepo with workspace packages

---

## Initial Ideas

### Option 1: MCPorter CLI + JSON Cache

**Approach**: Use MCPorter's `callOnce()` to fetch Slack data, write to JSON files

**Components**:
1. Install MCPorter: `pnpm add mcporter`
2. Script: `fetch-slack-channel.ts`
   - Input: Channel name (e.g., `organizers-26-02-25-vanessa-cribl`)
   - Calls: `conversations_history` → get all messages
   - Calls: `conversations_replies` → for each threaded message
   - Output: `~/.cc-workflows/cache/slack/{channel-id}-{date}.json`

**Pros**:
- Quick one-off script
- Immediate value (cache specific channel)
- No new architecture needed

**Cons**:
- Manual invocation required
- No automatic invalidation
- Doesn't integrate with existing skills

### Option 2: ProductTank Tools CLI (TypeScript)

**Approach**: Create proper ProductTank Tools package with MCPorter client

**Architecture**:

```text
tools/producttank-tools/
├── package.json (@cc-workflows/producttank-tools)
├── src/
│   ├── cli.ts (commander-based CLI)
│   ├── mcp-client.ts (MCPorter runtime wrapper)
│   ├── cache/
│   │   ├── SlackCache.ts (promise-based cache)
│   │   └── types.ts
│   └── commands/
│       ├── fetch-slack-channel.ts
│       └── sync-linear-status.ts
└── dist/ (compiled output)
```

**CLI Usage**:

```bash
# Fetch channel with all threads
ptsf-tools slack fetch organizers-26-02-25-vanessa-cribl

# Sync DRI status to Linear
ptsf-tools linear sync-status --from-slack organizers-26-02-25-vanessa-cribl
```

**Pros**:
- Proper architecture for future tools
- Reusable cache layer
- Integrates with Linear CLI
- Testable, type-safe

**Cons**:
- More upfront work
- Need to design cache invalidation strategy

### Option 3: MCPorter Generated CLI

**Approach**: Use `mcporter generate-cli` to create Slack-specific CLI

**Steps**:
1. `npx mcporter generate-cli slack --bundle dist/slack-cli.js`
2. Wrap generated CLI in caching layer
3. Use for ProductTank workflows

**Pros**:
- Auto-generated from Slack MCP schema
- No manual tool bindings
- Stays in sync with MCP server changes

**Cons**:
- Generated code harder to customize
- Still need separate caching layer
- May not match existing CLI patterns

---

## Key Questions

### Technical Questions

1. **Cache Invalidation Strategy**:
   - Time-based TTL (1 hour default)?
   - Explicit invalidation (`--force-refresh` flag)?
   - Smart invalidation (detect new messages via Slack API)?

2. **Thread Fetching Depth**:
   - Fetch ALL threads upfront (slower, complete cache)?
   - Lazy fetch threads on-demand (faster initial cache, incomplete)?
   - Configurable depth limit?

3. **Cache Location**:
   - User home: `~/.cc-workflows/cache/slack/` (cross-project)?
   - Project root: `.cache/slack/` (gitignored, per-project)?
   - XDG Base Dir: `$XDG_CACHE_HOME/cc-workflows/slack/` (Linux-friendly)?

4. **Data Format**:
   - Flat JSON (all messages + threads in single array)?
   - Nested JSON (message tree with thread children)?
   - Separate files (one per thread)?

### Workflow Questions

1. **Integration with Linear CLI**:
   - Parse cached Slack JSON in `ptsf-event-status-update` skill?
   - New skill for Slack → Linear sync?
   - Manual review step before Linear updates?

2. **Multi-Channel Caching**:
   - Fetch one channel at a time (current need)?
   - Batch fetch all event channels (e.g., all `#organizers-*`)?
   - Workspace-wide cache (all channels)?

3. **Incremental Updates**:
   - Full refetch each time?
   - Incremental fetch (new messages since last cache)?
   - Webhook-based updates (Slack Events API)?

### Scope Questions

1. **Phase 1 Scope (MVP)**:
   - **Minimal**: Script to cache one channel to JSON (Option 1)?
   - **Proper**: ProductTank Tools CLI with cache layer (Option 2)?
   - **Generated**: MCPorter CLI wrapper (Option 3)?

2. **Future Phases**:
   - Phase 2: Linear integration (DRI status sync)?
   - Phase 3: Real-time monitoring (webhooks)?
   - Phase 4: Automated workflows (actions on patterns)?

---

## Recommended Approach

### Start with Option 1 (Quick Script) → Evolve to Option 2 (Proper CLI)

**Phase 1 (This Session)**:
1. Install MCPorter: `pnpm add mcporter -w`
2. Create simple script: `scripts/fetch-slack-channel.ts`
3. Fetch `#organizers-26-02-25-vanessa-cribl` to JSON
4. Validate data structure for Linear integration

**Phase 2 (Next Session)**:
1. Create `@cc-workflows/producttank-tools` package
2. Implement proper cache layer (promise-based, TTL)
3. Build commander-based CLI
4. Add Linear sync commands

**Why Incremental**:
- Get immediate value (JSON cache for current event)
- Validate data format before committing to architecture
- Learn integration patterns before building full CLI
- Lower risk (small script vs full package)

---

## Next Steps

### Immediate Actions

1. **Install MCPorter**:

   ```bash
   pnpm add mcporter -w
   ```

2. **Create Fetch Script** (`scripts/fetch-slack-channel.ts`):

   ```typescript
   import { callOnce } from "mcporter";
   import { writeFileSync } from "fs";

   const channel = "organizers-26-02-25-vanessa-cribl";

   // Fetch channel history
   const history = await callOnce({
     server: "slack",
     toolName: "conversations_history",
     args: { channel_id: `#${channel}`, limit: "90d" }
   });

   // Fetch threads for each message
   // ... (iterate through messages, call conversations_replies)

   // Write to JSON
   writeFileSync(
     `~/.cc-workflows/cache/slack/${channel}-${new Date().toISOString()}.json`,
     JSON.stringify(data, null, 2)
   );
   ```

3. **Test Cache**:
   - Run script
   - Inspect JSON structure
   - Verify threads are included
   - Check file size

4. **Integrate with Linear**:
   - Parse cached JSON in `ptsf-event-status-update` skill
   - Extract DRI status updates
   - Map to Linear task IDs

### Design Decisions Needed

Before moving to Phase 2 (proper CLI):

1. ✅ Confirm JSON structure works for Linear integration
2. ✅ Decide on cache location (user home vs project root)
3. ✅ Choose invalidation strategy (TTL vs manual)
4. ✅ Validate thread fetching approach (all upfront vs lazy)

---

## Related Documents

- **Research**: `research/task14-slack-exploration-findings.md` - Slack channel/pattern analysis
- **Plan**: `/Users/wesleyfrederick/.claude/plans/precious-questing-pond.md` - Original exploration plan
- **Skills**:
  - `.claude/skills/ptsf-event-status-update/SKILL.md` - Event status synthesis
  - `.claude/skills/ptsf-create-monthly-event/SKILL.md` - Event creation automation
- **Reference Code**:
  - `tools/citation-manager/src/ParsedFileCache.ts` - Promise-based cache pattern
  - `packages/mcp-gdrive/index.ts` - MCP server implementation
  - `tools/citation-manager/src/citation-manager.js` - CLI tool pattern

---

## Open Questions for User

1. **Scope Preference**: Quick script (Option 1) vs proper CLI (Option 2)?
2. **Cache Location**: User home (`~/.cc-workflows/`) or project root (`.cache/`)?
3. **Thread Fetching**: All threads upfront (slow, complete) or lazy (fast, incomplete)?
4. **Linear Integration**: Manual review of Slack → Linear mappings, or automated sync?
5. **Other Channels**: Just Vanessa/Cribl event, or batch-fetch all `#organizers-*` channels?
