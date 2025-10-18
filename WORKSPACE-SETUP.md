# CC Workflows Workspace Setup Documentation

This document describes the validated workspace patterns established in User Story 1.1 for the CC Workflows monorepo using NPM Workspaces.

## NPM Workspaces Configuration

### Overview

The workspace uses NPM Workspaces to manage multiple packages in a monorepo structure. This enables:

- **Dependency Hoisting**: Shared dependencies are installed once at the root `node_modules/`
- **Package Discovery**: NPM automatically discovers packages matching workspace patterns
- **Cross-Package Dependencies**: Packages can reference each other using package names
- **Unified Scripts**: Root-level scripts can orchestrate operations across all packages

### Configuration

**File**: `package.json` (root)

```json
{
 "workspaces": [
  "tools/*",
  "packages/*"
 ]
}
```

### Directory Structure

```text
cc-workflows/
├── package.json          # Root package with workspace config
├── node_modules/         # Hoisted shared dependencies
├── tools/                # Workspace packages for CLI tools
│   └── mock-tool/
│       ├── package.json
│       ├── src/
│       └── test/
└── packages/             # Workspace packages for reusable libraries
```

### Dependency Hoisting Behavior

- **Shared dependencies** (vitest, @biomejs/biome, etc.) are installed at root level
- **Package-specific dependencies** can be declared in package-level `package.json`
- Run `npm install` from root to install all workspace dependencies
- Package-lock maintains references to all workspace packages

### Validation

To verify workspace configuration:

```bash
npm install
cat node_modules/.package-lock.json | grep -E "(mock-tool|your-package-name)"
```

## Vitest Test Discovery Pattern

### Overview

The workspace uses Vitest with glob patterns to discover tests across multiple locations:

- **Legacy patterns**: `src/tests/**/*.test.js`, `test/**/*.test.js` (for existing citation-manager)
- **Workspace pattern**: `tools/**/test/**/*.test.js` (for workspace packages)

### Configuration

**File**: `vitest.config.js` (root)

```javascript
import { defineConfig } from "vitest/config";

export default defineConfig({
 test: {
  environment: "node",
  include: [
   "src/tests/**/*.test.js",
   "test/**/*.test.js",
   "tools/**/test/**/*.test.js", // Workspace packages
  ],
  exclude: ["node_modules/**", "dist/**"],
  pool: "forks",
  testTimeout: 10000,
  hookTimeout: 10000,
  globals: false,
  coverage: {
   provider: "c8",
   reporter: ["text", "json", "html"],
   exclude: [
    "node_modules/**",
    "src/tests/**",
    "coverage/**",
    "dist/**",
    "*.config.js",
   ],
  },
  setupFiles: ["./test/setup.js"],
  reporter: ["verbose"],
  bail: process.env.CI ? 1 : 0,
 },
});
```

### Test Structure Requirements

**Location**: `tools/[package-name]/test/`

**Naming Convention**: `*.test.js`

**Example Structure**:

```javascript
import { describe, it, expect } from "vitest";
import { greet } from "../src/greeter.js";

describe("Greeter Module", () => {
 it("should return formatted greeting", () => {
  // Given: A name input
  const name = "Alice";

  // When: The greet function is called
  const result = greet(name);

  // Then: It should return a properly formatted greeting
  expect(result).toBe("Hello, Alice!");
 });
});
```

**Key Patterns**:

- Use `describe()` for module/feature grouping
- Test descriptions use natural language with spaces in `it()` method strings
- Follow Given-When-Then comment structure for clarity
- Import test utilities explicitly (no globals)

### Validation

To verify test discovery:

```bash
# Run all tests
npm test

# Verify workspace tests are discovered
npm test 2>&1 | grep -E "(mock-tool|tools/)"

# Run specific workspace package tests
npm test tools/mock-tool/test/
```

### Test Execution from Workspace Packages

Individual packages can define local test scripts:

```json
{
 "scripts": {
  "test": "vitest run"
 }
}
```

Run with: `npm test -w @cc-workflows/mock-tool`

## Biome Configuration Approach

### Overview

Biome provides unified linting and formatting for all JavaScript/TypeScript code in the workspace. A single root configuration applies to all packages.

### Configuration

**File**: `biome.json` (root)

```json
{
 "$schema": "https://biomejs.dev/schemas/2.2.2/schema.json",
 "vcs": {
  "enabled": false,
  "clientKind": "git",
  "useIgnoreFile": false
 },
 "files": {
  "ignoreUnknown": false,
  "include": ["**"],
  "ignore": [
   "**/node_modules",
   "**/dist",
   "**/build",
   "**/.git",
   "**/.hg",
   "**/.svn",
   "**/.DS_Store",
   "**/claude-code-analysis"
  ]
 },
 "formatter": {
  "enabled": true,
  "indentStyle": "tab"
 },
 "linter": {
  "enabled": true,
  "rules": {
   "recommended": true
  }
 },
 "javascript": {
  "formatter": {
   "quoteStyle": "double"
  }
 },
 "organizeImports": {
  "enabled": true
 }
}
```

### Key Standards

- **Indentation**: Tabs (per architecture standard for smaller file sizes and developer flexibility)
- **Quote Style**: Double quotes for JavaScript strings
- **Import Organization**: Automatic import sorting enabled
- **Rules**: Biome recommended ruleset

### Validation

To verify linting configuration:

```bash
# Check specific workspace package
npx biome check tools/mock-tool/src/

# Check all code
npx biome check .

# Auto-fix issues
npx biome check --write .
```

### Testing Error Detection

To verify Biome detects formatting violations:

```bash
# Introduce error (remove semicolon)
# Edit file, save
npx biome check tools/mock-tool/src/greeter.js
# Should output: "Formatter would have printed..."

# Fix and revalidate
# Restore semicolon
npx biome check tools/mock-tool/src/greeter.js
# Should output: "No fixes applied"
```

## CLI Execution Pattern

### Overview

Root-level npm scripts provide a unified interface for executing workspace package CLIs. This pattern enables:

- Centralized command discovery (`npm run` shows all available commands)
- Consistent parameter passing using `--` separator
- Version-controlled CLI entry points

### Pattern

**File**: `package.json` (root)

```json
{
 "scripts": {
  "mock:run": "node tools/mock-tool/src/mock-tool.js"
 }
}
```

### CLI Implementation Requirements

**File**: `tools/[package-name]/src/[package-name].js`

```javascript
#!/usr/bin/env node

import { greet } from "./greeter.js";

// Parse command-line arguments (first argument after script name)
const name = process.argv[2] || "World";

// Output result to stdout
console.log(greet(name));
```

**Key Requirements**:

- Shebang line: `#!/usr/bin/env node`
- Argument parsing via `process.argv`
- Output to stdout for composability
- Exit code management (0 for success, non-zero for errors)

### Usage

```bash
# Execute with default argument
npm run mock:run

# Pass custom argument using -- separator
npm run mock:run -- Alice
# Output: Hello, Alice!

npm run mock:run -- Bob
# Output: Hello, Bob!
```

### Package-Level Scripts

Workspace packages can define their own scripts:

**File**: `tools/mock-tool/package.json`

```json
{
 "name": "@cc-workflows/mock-tool",
 "version": "1.0.0",
 "type": "commonjs",
 "main": "src/mock-tool.js",
 "scripts": {
  "test": "vitest run",
  "start": "node src/mock-tool.js"
 }
}
```

Execute package scripts:

```bash
# From root using workspace flag
npm run start -w @cc-workflows/mock-tool

# From package directory
cd tools/mock-tool
npm start
```

## Quick Reference: Tests and Tools

### Testing

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

### Citation Manager

```bash
# Validate citations in a file (skip *-repo.md files)
npm run citation:validate <file-path>

# Validate with scope for smart filename resolution
npm run citation:validate <file-path> -- --scope /path/to/docs

# Parse and display AST
npm run citation:ast <file-path>

# Get base paths from a file
npm run citation:base-paths <file-path>

# Get base paths in JSON format
npm run citation:base-paths <file-path> -- --format json

# Auto-fix citation issues
npm run citation:fix <file-path>

# Auto-fix with scope
npm run citation:fix <file-path> -- --scope /path/to/docs
```

**Note:** Skip validation of `*-repo.md` files (aggregated repository files).

### Mock Tool

```bash
# Run mock tool with default argument
npm run mock:run

# Run with custom argument
npm run mock:run -- <argument>
```

## Common Operations

### Install Dependencies

```bash
# Install all workspace dependencies from root
npm install

# Install dependency for specific workspace package
npm install [package-name] -w @cc-workflows/tool-name
```

### Running Tests

```bash
# Run all tests (discovers legacy + workspace tests)
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Run tests for specific workspace package
npm test -w @cc-workflows/mock-tool

# Run specific test file
npm test tools/mock-tool/test/greeter.test.js
```

### Linting and Formatting

```bash
# Check all files
npx biome check .

# Auto-fix issues
npx biome check --write .

# Check specific package
npx biome check tools/mock-tool/

# Format specific file
npx biome format tools/mock-tool/src/greeter.js --write
```

### Workspace Package Management

```bash
# List all workspace packages
npm list --workspaces

# Run script in all workspace packages
npm run test --workspaces

# Run script in specific workspace
npm run test -w @cc-workflows/mock-tool
```
