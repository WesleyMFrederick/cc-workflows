# slack-mcp-users-search-polish — Baseline

> **Change:** slack-mcp-users-search-polish
> **Domain:** external/slack-mcp-server
> **Date:** 2026-02-18
> **Evidence taxonomy:** See `whiteboard.md` Evidence Glossary section

---

## Artifacts (minimum set for this baseline)

| Artifact | Path | Role in Baseline |
|----------|------|-----------------|
| Tool registration | `pkg/server/server.go` | Tool constants, ValidToolNames, shouldAddTool gating, AddTool calls |
| Handler implementation | `pkg/handler/conversations.go` | UsersSearchHandler, param parsing, CSV output |
| Provider search logic | `pkg/provider/api.go` | SearchUsers(), searchUsersInCache(), UsersCache struct |
| Edge API client | `pkg/provider/edge/users.go` | Browser-token UsersSearch via edge API |
| Existing tests | `pkg/handler/conversations_test.go` | Integration test patterns for comparison |

---

## Process Tree / Traces

### Trace 1: Tool Registration (server startup)

```text
NewMCPServer()
  → create server instance                          [O] server.go:98-107
  → create conversationsHandler                     [O] server.go:109
  → for each tool: shouldAddTool() × { register | skip }  [O] server.go:111-278
  → ⚠ users_search: s.AddTool() directly (NO shouldAddTool gate)  [O] server.go:281-293
  → create channelsHandler, usergroupsHandler       [O] server.go:295-296
  → for each channels/usergroups tool: shouldAddTool() × { register | skip }  [O] server.go:298-414
  → register resources (channels, users)            [O] server.go:444-456
```

**Key observation:** Every tool except `users_search` goes through `shouldAddTool()`. Lines 281-293 call `s.AddTool()` directly with a hardcoded string `"users_search"` — no constant, no gating. [O] `server.go:281`

### Trace 2: users_search Tool Invocation (OAuth path)

```text
MCP client calls "users_search" with {query, limit}
  → middleware chain: errorRecovery → logger → auth   [O] server.go:104-106
  → UsersSearchHandler()                              [O] conversations.go:342
    → apiProvider.IsReady() check                     [O] conversations.go:345-348
    → parseParamsToolUsersSearch(request)              [O] conversations.go:350
      → validate query non-empty                      [O] conversations.go:1008-1011
      → clamp limit to 1-100, default 10              [O] conversations.go:1013-1019
    → apiProvider.SearchUsers(ctx, query, limit)      [O] conversations.go:361
      → IsOAuth() == true                             [O] api.go:1106
      → searchUsersInCache(query, limit)              [O] api.go:1107
        → check usersReady                            [O] api.go:1116-1118
        → compile case-insensitive regex from query   [O] api.go:1120
        → iterate usersSnapshot map                   [O] api.go:1127
        → match against: Name, RealName, DisplayName, Email  [O] api.go:1132-1135
        → skip deleted users                          [O] api.go:1129-1130
        → return up to limit results                  [O] api.go:1138-1139
    → ProvideChannelsMaps()                           [O] conversations.go:367
    → for each result: scan channels for IM match to get DM channel ID  [O] conversations.go:376-381
    → build UserSearchResult CSV                      [O] conversations.go:383-391
    → return CSV text or "No users found"             [O] conversations.go:394-404
```

### Trace 3: users_search Tool Invocation (Browser token path)

```text
(Same as Trace 2 through parseParams)
    → apiProvider.SearchUsers(ctx, query, limit)      [O] conversations.go:361
      → IsOAuth() == false                            [O] api.go:1106
      → client.UsersSearch(ctx, query, limit)         [O] api.go:1110
        → edge Client.UsersSearch()                   [O] edge/users.go:27
          → callEdgeAPI("users/search", {query, count})  [O] edge/users.go:41
          → return resp.Results                       [O] edge/users.go:49
    → (rest same as Trace 2: DM lookup, CSV output)
```

### Trace 4: SLACK_MCP_ENABLED_TOOLS validation

```text
CLI startup parses SLACK_MCP_ENABLED_TOOLS env var
  → ValidateEnabledTools(tools)                       [O] server.go:59-77
    → builds set from ValidToolNames                  [O] server.go:60-63
    → checks each requested tool against set          [O] server.go:66-69
    → ⚠ "users_search" NOT in ValidToolNames          [O] server.go:43-57
    → if user includes "users_search" → error: "invalid tool name"  [F-INF-1]
```

---

## Measurements

**[M-1]: Tool constant count vs actual tools**
- Constants defined: 13 (`ToolConversationsHistory` through `ToolUsergroupsUsersUpdate`) [O] `server.go:27-41`

<!-- group-id:response-202602181200 -->

**<mark class="model-highlight" data-model="claude-opus-4-6" data-created="2026-02-18T12:00:00" data-modified="2026-02-18T12:00:00" data-id="mark-1739880000-m1a" data-group-id="response-202602181200">The Go source defines 13 tool constants + 1 ungated `users_search` = 14 total.</mark>**<mark class="model-highlight" data-model="claude-opus-4-6" data-created="2026-02-18T12:00:01" data-modified="2026-02-18T12:00:01" data-id="mark-1739880001-m1b" data-group-id="response-202602181200"> Your Claude Code MCP view shows 5 because of filtering:</mark>

• **<mark class="model-highlight" data-model="claude-opus-4-6" data-created="2026-02-18T12:00:02" data-modified="2026-02-18T12:00:02" data-id="mark-1739880002-m1c" data-group-id="response-202602181200">Env-gated tools</mark>**<mark class="model-highlight" data-model="claude-opus-4-6" data-created="2026-02-18T12:00:03" data-modified="2026-02-18T12:00:03" data-id="mark-1739880003-m1d" data-group-id="response-202602181200"> — `reactions_add/remove` need `SLACK_MCP_REACTION_TOOL`, `attachment_get_data` needs `SLACK_MCP_ATTACHMENT_TOOL` [O] `server.go:183,202,221`</mark>

• **<mark class="model-highlight" data-model="claude-opus-4-6" data-created="2026-02-18T12:00:04" data-modified="2026-02-18T12:00:04" data-id="mark-1739880004-m1e" data-group-id="response-202602181200">Usergroups tools</mark>**<mark class="model-highlight" data-model="claude-opus-4-6" data-created="2026-02-18T12:00:05" data-modified="2026-02-18T12:00:05" data-id="mark-1739880005-m1f" data-group-id="response-202602181200"> — 5 usergroup tools (list, me, create, update, users_update) may not be in your `SLACK_MCP_ENABLED_TOOLS` config or were added after your server version</mark>

• **<mark class="model-highlight" data-model="claude-opus-4-6" data-created="2026-02-18T12:00:06" data-modified="2026-02-18T12:00:06" data-id="mark-1739880006-m1g" data-group-id="response-202602181200">Your visible 5</mark>**<mark class="model-highlight" data-model="claude-opus-4-6" data-created="2026-02-18T12:00:07" data-modified="2026-02-18T12:00:07" data-id="mark-1739880007-m1h" data-group-id="response-202602181200">: `channels_list`, `conversations_history`, `conversations_replies`, `conversations_add_message`, `conversations_search_messages` [O] from Claude Code MCP tool list</mark>

<!-- /group-id:response-202602181200 -->
- ValidToolNames entries: 13 (same 13) [O] `server.go:43-57`
- Actual tools registered: 14 (13 + users_search) [O] `server.go:111-293`
- **Gap: 1 tool registered without constant or ValidToolNames entry** [M]

**\[M-2\]: shouldAddTool usage**
- Tools using shouldAddTool gate: 13/14 [O] `server.go:111-414`
- Tools bypassing shouldAddTool: 1 (users_search) [O] `server.go:281`
- **100% of original tools gated; 0% of new tool gated** [M]

**[M-3]: Test coverage for users_search**
- Grep for "UsersSearch" or "users_search" in `conversations_test.go`: 0 matches [M]
- Existing test cases in conversations_test.go: multiple (conversations_history, conversations_replies, etc.) [O]
- **0 test cases for users_search** [M]

**[M-4]: UserSearchResult CSV output fields**
- Fields: UserID, UserName, RealName, DisplayName, Email, Title, DMChannelID [O] `conversations.go:66-74`
- **7 columns per result row** [M]

<!-- group-id:response-202602181201 -->

**<mark class="model-highlight" data-model="claude-opus-4-6" data-created="2026-02-18T12:01:00" data-modified="2026-02-18T12:01:00" data-id="mark-1739880060-m4a" data-group-id="response-202602181201">Yes, CSV is the only output format.</mark>**<mark class="model-highlight" data-model="claude-opus-4-6" data-created="2026-02-18T12:01:01" data-modified="2026-02-18T12:01:01" data-id="mark-1739880061-m4b" data-group-id="response-202602181201"> The handler uses `gocsv.MarshalBytes()` and returns via `mcp.NewToolResultText()` [O] `conversations.go:398-404`.</mark>**<mark class="model-highlight" data-model="claude-opus-4-6" data-created="2026-02-18T12:01:02" data-modified="2026-02-18T12:01:02" data-id="mark-1739880062-m4c" data-group-id="response-202602181201"> When no results: plain text "No users found matching the query." [O] `conversations.go:394-396`.</mark>

<!-- /group-id:response-202602181201 -->

**M5: Search fields matched (OAuth cache path)**
- Fields matched by regex: Name, RealName, DisplayName, Email [O] `api.go:1132-1135`
- **4 fields searched** [M]

<!-- group-id:response-202602181202 -->

**<mark class="model-highlight" data-model="claude-opus-4-6" data-created="2026-02-18T12:02:00" data-modified="2026-02-18T12:02:00" data-id="mark-1739880120-m5a" data-group-id="response-202602181202">No — `user.ID` is NOT searched.</mark>**<mark class="model-highlight" data-model="claude-opus-4-6" data-created="2026-02-18T12:02:01" data-modified="2026-02-18T12:02:01" data-id="mark-1739880121-m5b" data-group-id="response-202602181202"> Only `Name`, `RealName`, `Profile.DisplayName`, `Profile.Email` are matched by the regex [O] `api.go:1132-1135`.</mark>**<mark class="model-highlight" data-model="claude-opus-4-6" data-created="2026-02-18T12:02:02" data-modified="2026-02-18T12:02:02" data-id="mark-1739880122-m5c" data-group-id="response-202602181202"> Searching by Slack user ID (e.g. `U12345678`) would require adding `user.ID` to the match list — potential delta item.</mark>

<!-- /group-id:response-202602181202 -->

---

## Inferred Facts [F-INF]

> Conclusions about the current system derived from combining observations [O] and measurements [M]. The delta references these to justify what needs to change.

**[F-INF-1]: SLACK_MCP_ENABLED_TOOLS will reject users_search**
Since `users_search` is not in `ValidToolNames` (Trace 4), any user who sets `SLACK_MCP_ENABLED_TOOLS=users_search,...` will get a validation error at startup. The tool is only accessible when `SLACK_MCP_ENABLED_TOOLS` is unset (all tools registered). Derived from M1 + Trace 4.

**[F-INF-2]: users_search cannot be disabled**
Since registration bypasses `shouldAddTool()` (Trace 1, M2), the tool is always registered regardless of `SLACK_MCP_ENABLED_TOOLS` setting. If a user enables only specific tools, they get those tools PLUS users_search unconditionally. Derived from Trace 1 + Trace 4.

**[F-INF-3]: Commit message is misleading about token support**
Commit `a7b7e58` says "requires browser session tokens" but `api.go:1106-1108` shows OAuth tokens use the cache regex path. Both token types are supported. Derived from Trace 2 + Trace 3.

**[F-INF-4]: DM channel lookup is O(n) per result**
`conversations.go:376-381` iterates all channels for each user result to find IM channels. For k results and n total channels, this is O(k*n). Functional but not optimized. Derived from Trace 2.

---

## Constraints [C]

> Observable hard boundaries on the delta. Violating these causes breaking changes, PR rejection, or CI failure. The delta must work within these boundaries.

**[C-1]:** Must match existing tool registration pattern — constant, ValidToolNames entry, shouldAddTool wrapper [O] `server.go:27-57, 111-278`^c1
- Breaking this convention means the PR will be rejected — every other tool follows this pattern

**[C-2]:** Must maintain backward compatibility — tool name stays `"users_search"`, params stay `{query, limit}` [O] already deployed in flare576's PR#179 [https://github.com/korotovsky/slack-mcp-server/pull/179](https://github.com/korotovsky/slack-mcp-server/pull/179)^c2
- Renaming the tool or changing params would break any MCP client already using the merged implementation

**[C-3]:** PR must target upstream `korotovsky/slack-mcp-server` repo and reference issue #205 [O] from original request ^c3
- Wrong PR target means the fix never reaches the npm package and issue #205 stays open

**[C-4]:** Go project — changes must follow existing code style (gofmt, existing patterns) [O]^c4
- Non-conforming style will fail CI or be rejected in review

---

## Assumptions [A]

**[A-1]:** ~~The upstream maintainer will accept a polish/integration-fix PR.~~ **UPGRADED → Observation [O]:**^a1
- No CONTRIBUTING.md exists, but repo actively merges external PRs — 10 recent merged PRs from 6 different contributors (Flare576, RedSlowpoke, aminsaedi, ljagiello, dalley, dosentmatter) [O]
- MIT license. No formal PR policy — just submit and maintainer reviews [O]
- **Verification:** None needed (already upgraded to observation)

**[A-2]:** No env var gating is needed for `users_search` (read-only tool, like `channels_list`). Risk: maintainer might want `SLACK_MCP_USERS_SEARCH_TOOL` gating. [A]^a2
- Some tools require a special env var to register (e.g. `conversations_add_message` needs `SLACK_MCP_ADD_MESSAGE_TOOL` set) [O] `server.go:161,183,202,221`
- This is the `envVarName` param in `shouldAddTool()` — when non-empty, the tool only registers if that env var is set [O] `server.go:90-93`
- Read-only tools like `channels_list` pass `""` (no env var needed) [O] `server.go:298`
- `users_search` is read-only, so the assumption is it should follow the same pattern
- **Verification:** Low effort — confirm `channels_list` pattern (pass `""` for envVarName). **Value:** Medium — validates design choice before PR submission

**[A-3]:** ~~Existing integration test infrastructure works for users_search.~~ **DOWNGRADED → Minor risk:**^a3
- Tests use OpenAI SDK (`gpt-4.1-mini`) sending natural language prompts to MCP server via SSE/ngrok [O] `conversations_test.go:47-111`
- Requires: `SLACK_MCP_OPENAI_API` env var, ngrok, and a Slack workspace with known test data [O]
- Infrastructure is confirmed working. Only remaining risk: need a known user in the workspace to search for
- **Verification:** Medium effort — run existing test suite, confirm a searchable user exists in workspace. **Value:** High — confirms we can write passing tests for the PR

**[A-4]:** ~~The npm package `slack-mcp-server@latest` may not include `users_search` or `usergroups_*` tools yet.~~ **UPGRADED → Observation [O]:**^a4
- npm `slack-mcp-server@latest` is `v1.1.28`. Git tag `v1.1.28` has ~60 commits before master HEAD [O]
- `users_search` (PR #179), usergroups (PR #193), enabled-tools refactor (PR #173) all merged after `v1.1.28` [O]
- Claude Code runs `npx slack-mcp-server@latest` (npm), not the local git clone — confirmed in `.mcp.json:26-32` [O]
- **Fix:** ~~Switch `.mcp.json` to local build~~ **APPLIED** — `.mcp.json` now points to local binary at `slack-mcp-server/build/slack-mcp-server` (`v1.1.28-82-g6ddc828`, 82 commits ahead of npm). Requires Claude Code restart to take effect [O]
- **Verification:** Done — npm version confirmed behind master. **Value:** High — switching to local build unlocks `users_search` + 5 usergroup tools for live testing


---

## Open Questions [Q]

*Non-baseline questions moved to whiteboard Open Questions section.*

**[Q-1]:** How does the env var gating system work for enabling/disabling tools beyond the 5 currently visible in Claude Code?  — This affects baseline understanding of which tools are active.
- `SLACK_MCP_ENABLED_TOOLS` env var: comma-separated list of tool names to enable. If unset, all tools register (minus env-gated ones). If set, only listed tools register via `shouldAddTool()` [O] `server.go:79-96`
- Per-tool env vars (second gate): some tools require a specific env var to exist regardless of `SLACK_MCP_ENABLED_TOOLS`:
  - `SLACK_MCP_ADD_MESSAGE_TOOL` → `conversations_add_message` [O] `server.go:161`
  - `SLACK_MCP_REACTION_TOOL` → `reactions_add`, `reactions_remove` [O] `server.go:183,202`
  - `SLACK_MCP_ATTACHMENT_TOOL` → `attachment_get_data` [O] `server.go:221`
- Tools with no env var gate (pass `""`) always register when `SLACK_MCP_ENABLED_TOOLS` is unset or includes them: `conversations_history`, `conversations_replies`, `conversations_search_messages`, `channels_list`, all `usergroups_*` tools [O]
- `conversations_search_messages` has an additional gate: only registers for non-bot tokens [O] `server.go:277`
  
### How to Enable/Disable Tools

**Where:** All env vars go in your `.mcp.json` file at the project root, inside the `"env"` block of the `"slack"` server entry.

**Your current config** (`.mcp.json:26-32`):

```json
"slack": {
  "command": "npx",
  "args": ["-y", "slack-mcp-server@latest", "--transport", "stdio"],
  "env": {
    "SLACK_MCP_XOXP_TOKEN": "xoxp-..."
  }
}
```

**To enable env-gated tools**, add env vars to the same `"env"` block. The value can be anything non-empty (e.g. `"true"`):

```json
"env": {
  "SLACK_MCP_XOXP_TOKEN": "xoxp-...",
  "SLACK_MCP_REACTION_TOOL": "true",
  "SLACK_MCP_ATTACHMENT_TOOL": "true"
}
```

**To restrict to specific tools only**, set `SLACK_MCP_ENABLED_TOOLS` (comma-separated). Only listed tools will register:

```json
"env": {
  "SLACK_MCP_XOXP_TOKEN": "xoxp-...",
  "SLACK_MCP_ENABLED_TOOLS": "conversations_history,conversations_replies,channels_list,users_search"
}
```

**Important:** If `SLACK_MCP_ENABLED_TOOLS` is NOT set (your current config), all non-env-gated tools should register automatically. After adding/changing env vars, restart Claude Code for the MCP server to reload.

**Why you may only see 5 tools:** You're running `slack-mcp-server@latest` via npx (npm package). The usergroups tools (PR #193, merged Feb 8) and users_search (PR #179, merged Feb 2) may not be published to npm yet. Your local clone at `/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/slack-mcp-server` has the latest master, but your MCP config runs the npm package, not the local build. [**[A-4]**](#^a4) — needs verification by checking npm version vs git master.

### Extra Tools Not Visible in Claude Code (9 tools)

**Env-gated (require specific env var set to any non-empty value):**

| Tool | Env Var to Add | Description |
|------|----------------|-------------|
| `reactions_add` | `SLACK_MCP_REACTION_TOOL` | Add an emoji reaction to a message (destructive) [O] `server.go:183-200` |
| `reactions_remove` | `SLACK_MCP_REACTION_TOOL` | Remove an emoji reaction from a message (destructive) [O] `server.go:202-219` |
| `attachment_get_data` | `SLACK_MCP_ATTACHMENT_TOOL` | Download attachment by file ID, max 5MB (read-only) [O] `server.go:221-231` |

**No env var gate (should register automatically — if missing, likely npm package version lag):**

| Tool | Description |
|------|-------------|
| `usergroups_list` | List all @mention groups in workspace. CSV: id, name, handle, description, user_count, is_external (read-only) [O] `server.go:322-338` |
| `usergroups_me` | Manage your own group membership: list, join, or leave (mixed read/write) [O] `server.go:342-353` |
| `usergroups_create` | Create a new @mention group with name, handle, description, channels (destructive) [O] `server.go:356-374` |
| `usergroups_update` | Update group metadata: name, handle, description, channels. Does NOT change members (destructive) [O] `server.go:377-398` |
| `usergroups_users_update` | Replace ALL members of a group. WARNING: completely replaces member list (destructive) [O] `server.go:400-414` |
| `users_search` | Search users by name, email, or display name. Returns details + DM channel ID. **Ungated — always registers** (read-only) [O] `server.go:281-293` |