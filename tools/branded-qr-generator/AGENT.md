# Branded QR Generator - Agent Commands

## Worktree Context

**Worktree Location**: `_worktrees/feature/branded-qr-updates`
**Branch**: `feature/branded-qr-updates`
**Tool Path**: `tools/branded-qr-generator`

## Working Directory

All commands should be run from the **worktree root**, not from within the tool directory:

```bash
cd /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/_worktrees/feature/branded-qr-updates
```

## Testing Commands

### Run Tests for This Tool Only

```bash
# Run tests only for branded-qr-generator
npm test -w @cc-workflows/branded-qr-generator

# Run tests in watch mode
npm run test:watch -w @cc-workflows/branded-qr-generator
```

### Run All Tests (All Workspace Packages)

```bash
# Run all workspace tests (not recommended for focused work)
npm test
```

## Development Commands

### Install Dependencies

```bash
# Install/update dependencies for the entire workspace
npm install

# Install a new dependency for this tool only
npm install <package-name> -w @cc-workflows/branded-qr-generator

# Install a dev dependency
npm install <package-name> -D -w @cc-workflows/branded-qr-generator
```

### Linting and Formatting

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

### Run the Tool

```bash
# Run the branded-qr-generator CLI (once implemented)
node tools/branded-qr-generator/src/branded-qr-generator.js [arguments]

# Note: src/ directory and CLI implementation don't exist yet
# Tool is currently in design phase with package.json initialized
```

## Git Workflow in Worktree

### Commit Changes

```bash
# Stage changes
git add tools/branded-qr-generator/

# Commit
git commit -m "feat(branded-qr): your message"

# Push to remote
git push -u origin feature/branded-qr-updates
```

### Check Status

```bash
# See what's changed in this worktree
git status

# See diff
git diff

# See commit history
git log --oneline
```

## Worktree Management

### List All Worktrees

```bash
# From main repo or any worktree
git worktree list
```

### Return to Main Repository

```bash
cd /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows
```

### Remove This Worktree (When Done)

```bash
# From main repository
cd /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows
git worktree remove _worktrees/feature/branded-qr-updates

# Or force remove if there are uncommitted changes
git worktree remove _worktrees/feature/branded-qr-updates --force
```

## Package Information

**Package Name**: `@cc-workflows/branded-qr-generator`
**Version**: `1.0.0`
**Main Entry**: `src/branded-qr-generator.js`

## Dependencies

- `commander`: CLI framework
- `qrcode`: QR code generation
- `sharp`: Image processing

## Dev Dependencies

- `vitest`: Testing framework (shared from workspace)

## Important Notes

1. **Always run commands from worktree root**, not from inside `tools/branded-qr-generator/`
2. **Use `-w @cc-workflows/branded-qr-generator`** flag to target this tool specifically
3. **This worktree is isolated** - changes here don't affect the main working directory
4. **Dependencies are independent** - this worktree has its own `node_modules`
5. **Clean up the worktree** when feature is complete and merged
