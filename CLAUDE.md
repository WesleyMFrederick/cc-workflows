# Project Reference

## Search Tools
ALWAYS use `mgrep` skill for local file/code searching. NEVER use built-in Grep or Glob (for content search) tools.

- **Local file/code search**: `mgrep "query"` or `mgrep "query" path/to/dir`
- **Limit results**: `mgrep -m 10 "query"`

Reason: Semantic search produces more relevant results than regex-based tools.

---

## LLM Learnings

### File Uploads (MCP Tools)
- **Use `fs.createReadStream(path)`** - Google APIs accept streams directly
- **Never base64 into context** - wastes tokens, no benefit
- **Tool accepts path, streams internally** - keeps context clean

### Image Downloads (CDN/Brandfetch)
- **Always include User-Agent header** - CDNs like Brandfetch use Cloudflare protection
- **Verify file type after download** - small files (< 1KB) may be error pages/HTML
- **Use `file` command to validate** - confirms actual image data vs HTML redirect
- **Example curl:** `curl -sL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" "<url>" -o /tmp/image.png`

### Hook-Extracted Content (Citation Extractor)
- **When a PostToolUse hook returns content prefixed with `## Citation:`**, that content is already loaded in context — do NOT re-read, re-verify, or `ls` those files
- The `citation-extractor.sh` hook auto-extracts linked file content on every `.md` Read
- Trust hook output — avoid redundant tool calls for files already delivered

### TypeScript Build Pipeline (Citation Manager)
- **Source is `.ts`, CLI needs `.js`** - after TS migration, `bin` points to `dist/citation-manager.js`
- **Build before linking**: `npm run build -w tools/citation-manager` compiles `src/*.ts` → `dist/*.js`
- **Re-link after build**: `npm link -w tools/citation-manager` updates the global `citation-manager` CLI
- **Hook dependency**: The `citation-validator.sh` PostToolUse hook calls `citation-manager` — if CLI is stale, hook silently fails

---

## Quick Command Reference

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run citation manager tests
npm run test:citation
```

## Linting and Formatting

```bash
# Check all files with Biome
npx biome check .

# Auto-fix Biome issues
npx biome check --write .

# Check markdown files
markdownlint "**/*.md"

# Fix markdown issues
markdownlint "**/*.md" --fix
```

## TypeScript Coding Standards

**NEVER use `any` type** - Defeats the purpose of TypeScript. Instead:
- Use proper type definitions, interfaces, or types
- Use type guards (`is` predicates) for runtime validation
- Use `unknown` with type narrowing for truly unknown values
- Use generic types to maintain type safety

**Why:** TypeScript's value is compile-time type safety. Using `any` disables all type checking and defeats the entire purpose of using TypeScript.

## Citation Manager

```bash
# Build TypeScript and re-link CLI (run after TS changes)
npm run build -w tools/citation-manager && npm link -w tools/citation-manager

# Validate citations in a file
citation-manager validate <file-path>

# Validate with JSON output
citation-manager validate <file-path> --format json

# Validate specific line range
citation-manager validate <file-path> --lines 150-160

# Validate with folder scope and auto-fix
citation-manager validate <file-path> --fix --scope /path/to/docs

# Extract content from all citations in a file
citation-manager extract links <file-path>

# Extract with full file content (not just sections)
citation-manager extract links <file-path> --full-files

# Extract specific header section from a file
citation-manager extract header <file-path> "Header Name"

# Extract entire file content
citation-manager extract file <file-path>

# Display AST for debugging
citation-manager ast <file-path>
```

## Mock Tool

```bash
# Run mock tool with default argument
npm run mock:run

# Run with custom argument
npm run mock:run -- <argument>
```

## Dependency Management

```bash
# Install all workspace dependencies
npm install

# Install dependency for specific workspace package
npm install <package-name> -w @cc-workflows/tool-name

# List all workspace packages
npm list --workspaces
```

## Linear.app Integration
ALWAYS use `linear-cli` for Linear.app operations. NEVER use Linear MCP tools.

Reason: CLI is 10-50x more token-efficient than MCP tool calls.

### Quick Commands
- List issues: `linear-cli i list`
- Create issue: `linear-cli i create "Title" -t TEAM -p 2`
- View issue: `linear-cli i get LIN-123`
- Start work: `linear-cli i start LIN-123` (assigns, sets In Progress, creates branch)
- Update: `linear-cli i update LIN-123 -s Done`
- Create PR: `linear-cli g pr LIN-123`
- Search: `linear-cli s issues "query"`
- Fetch upload: `linear-cli up fetch URL -f file.png`
- JSON output: Add `--output json` to any command (or set `LINEAR_CLI_OUTPUT=json`)
- Agent help: `linear-cli agent`
