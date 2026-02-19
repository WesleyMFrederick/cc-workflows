# slack-mcp-users-search-polish — Whiteboard

> **Change:** slack-mcp-users-search-polish
> **Domain:** external/slack-mcp-server
> **Date:** 2026-02-18

## Original Request

Update slack mcp server (`/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/slack-mcp-server`)
 - add tool to query user information by incorporating user list and user info api
- use deepwiki mcp to understand what needs to change (https://github.com/korotovsky/slack-mcp-server)
- fork the repo so we can submit pull request if it works
- [https://github.com/korotovsky/slack-mcp-server/issues/205](https://github.com/korotovsky/slack-mcp-server/issues/205)^mcp-user-feature-request
 - [https://github.com/korotovsky/slack-mcp-server/pulls](https://github.com/korotovsky/slack-mcp-server/pulls)^mcp-pull-requests-link

**Goal:** Polish the existing `users_search` tool implementation in slack-mcp-server, fix its integration gaps, and submit as upstream PR to close issue #205.

### Pre-Recon Research (Perplexity)

**Slack Web API for user queries:**

- `users.list` — returns all user objects with profile fields (`real_name`, `email`) [O]
- `users.info` — returns single user object by ID [O]
- `users:read.email` OAuth scope required for email field (`users:read` alone is insufficient) [O]
- `users.lookupByEmail` — resolves email to user object [O]

**CLI examples (for reference):**

```bash
# All users (ID, name, email)
slack api users.list --limit 200 \
  | jq -r '.members[] | select(.deleted | not)
    | [.id, .name, (.profile.real_name // ""), (.profile.email // "")]
    | @tsv'

# One user by ID
slack api users.info --user U12345678 \
  | jq -r '.user | {id, name, real_name: .profile.real_name, email: .profile.email}'
```

**Sources:**
- [users.list method | Slack Developer Docs](https://docs.slack.dev/reference/methods/users.list)
- [users.info method | Slack Developer Docs](https://docs.slack.dev/reference/methods/users.info)
- [users:read.email scope | Slack Developer Docs](https://docs.slack.dev/reference/scopes/users.read.email/)

### Implementation vs API Research Clarification

The Pre-Recon research above documents **available** Slack Web API methods. The actual `users_search` implementation does **not** call these APIs at search time:

- **OAuth tokens** → regex match against local `UsersCache` (populated by `GetUsersContext` at startup) [O] `api.go:1115-1145`
- **Browser tokens** → undocumented edge API `users/search` endpoint [O] `edge/users.go:27-50`
- **PR #179** (by flare576, merged 2026-02-02) added `users_search` — already on `master` [O] https://github.com/korotovsky/slack-mcp-server/pull/179
- **DeepWiki index** is stale (last indexed Oct 2025, commit `bb9469d3`) — does not include `users_search` [M]

---

## Evidence Glossary

| Tag         | Meaning                                                           |
| ----------- | ----------------------------------------------------------------- |
| **\[O\]**     | **Observed** — code reviewed, behavior confirmed (cite file:line) |
| **[M]**     | **Measured** — quantified data exists (cite command + result)     |
| **[F-INF]** | **Fact Inferred** — conclusion from combining O/M evidence        |
| **[A]**     | **Assumed** — hypothesis, not yet tested                          |
| **[C]**     | **Constraint** — external requirement, cannot change              |
| **[D]**     | **Decision** — commitment of a resource (time, effort, scope)     |
| **[Q]**     | **Question** — open unknown, needs investigation                  |
| **[R]**     | **Requirement** — ideal/delta requirement, open for discussion    |
| **[R-LOCK]**| **Locked Requirement** — requirement locked by a [D], [C], or [F-INF]. Cite parent evidence |

---

## Artifacts & Paths

### Documentation

- Issue #205: "Feature request: users_search / users_list tool" — [**\[O\]**](#^mcp-user-feature-request) open, no comments, filed by @schickling-assistant
- [README.md](/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/slack-mcp-server/README.md) in slack-mcp-server root

### Source (External Repo)

**Tool Registration:**
- `pkg/server/server.go:27-41` — Tool name constants (missing `ToolUsersSearch`) **[O]** 
- `pkg/server/server.go:43-57` — `ValidToolNames` slice (missing `users_search`) [O]
- `pkg/server/server.go:79-96` — `shouldAddTool()` gating function [O]
- `pkg/server/server.go:281-293` — `users_search` tool registration (no `shouldAddTool` wrapper) [O]

**Handler:**
- `pkg/handler/conversations.go:60-74` — `User` and `UserSearchResult` structs [O]
- `pkg/handler/conversations.go:108-111` — `usersSearchParams` struct [O]
- `pkg/handler/conversations.go:342-405` — `UsersSearchHandler` (full handler, CSV output) [O]
- `pkg/handler/conversations.go:1007-1025` — `parseParamsToolUsersSearch` [O]

**Provider/API:**
- `pkg/provider/api.go:155-158` — `UsersCache` struct with `Users` and `UsersInv` maps [O]
- `pkg/provider/api.go:1064-1067` — `ProvideUsersMap()` atomic snapshot loader [O]
- `pkg/provider/api.go:1102-1145` — `SearchUsers()` dual-strategy (OAuth=cache regex, browser=edge API) [O]
- `pkg/provider/edge/users.go` — Edge API `UsersSearch` method [O]

**Existing Tests:**
- `pkg/handler/conversations_test.go` — integration tests for conversation tools [O]
- `pkg/handler/channels_test.go` — integration tests for channel tools [O]

**Commit:**
- `a7b7e58` — "feat: add users_search tool for finding users by name/email" by flare576, Feb 2 2026 [O]

---

## Baseline Bucket

### What works today

- `users_search` tool is registered and functional on master [O] `server.go:281-293`
- Handler searches by name, email, display name; returns CSV with DM channel ID [O] `conversations.go:342-405`
- Dual search strategy: OAuth tokens use cache regex, browser tokens use edge API [O] `api.go:1102-1111`
- Users cache already exists with `map[string]slack.User` keyed by ID [O] `api.go:155-158`
- Existing resource `slack://workspace/users` exposes user directory as CSV [O] `server.go:451-456`

### Integration gaps

1. No `ToolUsersSearch` constant defined [O] `server.go:27-41` — all other tools have constants
2. Not in `ValidToolNames` [O] `server.go:43-57` — `SLACK_MCP_ENABLED_TOOLS` validation will reject it
3. No `shouldAddTool()` wrapper [O] `server.go:281` — tool always registered, ignoring enabled-tools system
4. No unit/integration tests [O] — `conversations_test.go` has no `UsersSearch` test cases
5. Original commit description says "requires browser session tokens" but code supports OAuth via cache [F-INF] `api.go:1106-1108` contradicts `a7b7e58` commit message

---

## Ideal Bucket

- `users_search` properly integrated into the tool registration system like all other tools [C] must match project conventions
- Listed in `ValidToolNames` so `SLACK_MCP_ENABLED_TOOLS` works [C]
- Gated by `shouldAddTool()` for consistency [C]
- Test coverage matching existing handler test patterns [A]
- Accurate tool description reflecting OAuth + browser token support [C]
- PR ready to submit against upstream to close issue #205 [D]
- Can input Slack user ID and return user info [I]

---

## Delta Bucket

- Add `ToolUsersSearch` constant
- Add to `ValidToolNames` slice
- Wrap registration with `shouldAddTool()`
- Add integration tests following `conversations_test.go` patterns
- Update tool description to remove browser-only claim
- Add `user.ID` to search fields in `searchUsersInCache()` so users can search by Slack user ID
- Fork repo, create branch, submit PR

---

## Open Questions

1. [ ] Should we also add a `users_list` tool (bulk list all users) or just polish `users_search`? Issue #205 requests both.
2. [x] Does the project require tests for PRs? — No CONTRIBUTING.md. Repo actively merges external PRs from 6+ contributors. No formal test requirement observed, but existing test patterns exist in `conversations_test.go` [O].
3. [ ] Should the tool description mention the dual search strategy (cache vs edge API)?
4. [ ] Fork under WesleyMFrederick GitHub org or personal account?
5. [ ] Should `users_search` registration move to be grouped with its handler (conversations) or get its own handler file? Currently sits at `server.go:281` between conversations_search and channels_handler tools.
6. [ ] Should `user.ID` be added to the search fields so users can look up by Slack user ID? Currently only matches Name, RealName, DisplayName, Email [O] `api.go:1132-1135`.
