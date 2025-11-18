# Epic 1: TypeScript Infrastructure Setup - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish TypeScript build infrastructure without touching existing JavaScript code, validating configuration works on zero source files before Epic 4 conversion begins.

**Architecture:** Three-tier configuration hierarchy (root → base → tool) using TypeScript project references with strict type checking enabled. Uses NodeNext module system for modern Node.js ESM support. Validates independently through 5-phase testing strategy.

**Tech Stack:** TypeScript 5.3+, Node.js 18+, NPM Workspaces, Biome (existing)

---

## Task 1 - Update ARCHITECTURE.md

**Rationale:** Architecture documentation represents future state and must be updated BEFORE implementation begins (NFR14 requirement from PRD line 139).

### Files
- `/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/ARCHITECTURE.md` (MODIFY)

### Step 1: Read current Configuration Management section

Read the section starting at line ~890 to understand current tsconfig.base.json documentation.

```bash
# Find the exact line numbers
grep -n "Key settings within \`tsconfig.base.json\`" ARCHITECTURE.md
```

Expected: Line number showing where the table starts

### Step 2: Update module system row

Find this row:

```markdown
| `compilerOptions.module` | `string` | Module system (ES2022). Native ESM support. |
```

Replace with:

```markdown
| `compilerOptions.module` | `string` | Module system (NodeNext). Best for modern Node.js - handles both ESM and CommonJS correctly. |
```

### Step 3: Add new configuration rows

After the existing rows in the tsconfig.base.json table, add these three rows:

```markdown
| `compilerOptions.moduleResolution` | `string` | Module resolution (NodeNext). Matches module setting for proper resolution. |
| `compilerOptions.composite` | `boolean` | Enables project references for fast incremental builds in monorepo. |
| `compilerOptions.noUncheckedIndexedAccess` | `boolean` | Array access returns T \| undefined, forcing null checks to prevent runtime crashes. |
```

**Note:** The backslash before the pipe (`\|`) is required for proper markdown rendering of the union type.

### Step 4: Verify markdown rendering

Run markdown linter to verify table formatting:

```bash
npx markdownlint ARCHITECTURE.md
```

Expected: No errors in the modified section

### Step 5: Commit architecture update

Use `create-git-commit` skill with message:

```text
docs(architecture): update TypeScript compiler options

- Change module from ES2022 to NodeNext for better Node.js support
- Add moduleResolution, composite, and noUncheckedIndexedAccess
- Prepares documentation for Epic 1 implementation
```

---

## Task 2 - Install TypeScript dependency

**Rationale:** TypeScript must be explicitly installed at workspace root for build scripts to work. Currently only available transitively through Vitest.

### Files
- `/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/package.json` (MODIFY)

### Step 1: Check current TypeScript installation

```bash
npm list typescript
```

Expected: Shows typescript is installed (possibly via Vitest), but need explicit root dependency

### Step 2: Install TypeScript

```bash
npm install --save-dev typescript@^5.3.0
```

Expected:
- `package.json` updated with typescript in devDependencies
- `package-lock.json` updated
- Installation completes successfully

### Step 3: Verify installation

```bash
npx tsc --version
```

Expected: `Version 5.3.x` or higher

### Step 4: Verify existing tests still pass

```bash
npm test
```

Expected: All existing JavaScript tests pass (zero breakage)

### Step 5: Commit dependency addition

Use `create-git-commit` skill with message:

```text
build(deps): add TypeScript 5.3+ as explicit dev dependency

- Required for workspace-level TypeScript compilation
- Enables type checking and build scripts
- Aligns with PRD Tech Stack requirement
```

---

## Task 3 - Create tsconfig.base.json

**Rationale:** Shared configuration is single source of truth for all tools. Enables 13 strict type checking flags to catch errors at compile-time.

### Files
- `/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tsconfig.base.json` (CREATE)

### Step 1: Create tsconfig.base.json with strict settings

```json
{
  "compilerOptions": {
    // Target & Module (Node.js 18+ ESM focus)
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],

    // Strict Type Checking (13 flags total)
    // Master switch enables 8 sub-flags automatically
    "strict": true,
    // Additional 5 flags for maximum safety
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,

    // Output & Build
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "composite": true,

    // Module & Import Behavior
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,

    // Performance
    "skipLibCheck": true,

    // Code Quality
    "noEmit": false
  }
}
```

### Step 2: Verify JSON syntax

```bash
node -e "JSON.parse(require('fs').readFileSync('tsconfig.base.json', 'utf8'))"
```

Expected: No output (valid JSON)

### Step 3: Verify Biome accepts file

```bash
npx biome check tsconfig.base.json
```

Expected: No errors (file passes formatting and linting)

### Step 4: Commit base configuration

Use `create-git-commit` skill with message:

```text
feat(typescript): add tsconfig.base.json with strict type checking

- 13 strict type checking flags enabled (prevents runtime errors)
- NodeNext module system for modern Node.js ESM support
- Composite mode for fast incremental builds
- Generates .d.ts declarations (FR6 requirement)
```

---

## Task 4 - Create root tsconfig.json

**Rationale:** Workspace coordinator enables TypeScript project references for fast incremental builds as workspace scales.

### Files
- `/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tsconfig.json` (CREATE)

### Step 1: Create root tsconfig.json

```json
{
  "files": [],
  "references": [
    { "path": "./tools/citation-manager" }
  ]
}
```

### Step 2: Verify JSON syntax

```bash
node -e "JSON.parse(require('fs').readFileSync('tsconfig.json', 'utf8'))"
```

Expected: No output (valid JSON)

### Step 3: Verify Biome accepts file

```bash
npx biome check tsconfig.json
```

Expected: No errors

### Step 4: Commit root configuration

Use `create-git-commit` skill with message:

```text
feat(typescript): add root tsconfig.json for workspace coordination

- Enables TypeScript project references
- Coordinates builds across all tool packages
- No compilation at root level (files: [])
```

---

## Task 5 - Create tool-specific tsconfig.json

**Rationale:** Tool-specific configuration extends base with minimal overrides. Validates on zero TypeScript files in Epic 1 (infrastructure only).

### Files
- `/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/citation-manager/tsconfig.json` (CREATE)

### Step 1: Create citation-manager tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.test.ts", "**/*.spec.ts", "dist/**", "node_modules/**"]
}
```

### Step 2: Verify JSON syntax

```bash
node -e "JSON.parse(require('fs').readFileSync('tools/citation-manager/tsconfig.json', 'utf8'))"
```

Expected: No output (valid JSON)

### Step 3: Verify Biome accepts file

```bash
npx biome check tools/citation-manager/tsconfig.json
```

Expected: No errors

### Step 4: Verify src directory exists but has no .ts files

```bash
ls tools/citation-manager/src/
```

Expected: JavaScript files only (no .ts files yet - Epic 1 is infrastructure only)

### Step 5: Commit tool configuration

Use `create-git-commit` skill with message:

```text
feat(typescript): add citation-manager TypeScript configuration

- Extends shared tsconfig.base.json
- Minimal overrides (only paths)
- Ready for Epic 4 conversion (currently zero .ts files)
```

---

## Task 6 - Add build scripts to root package.json

**Rationale:** Workspace-level scripts enable type checking and compilation across all tools. Required for validation phases.

### Files
- `/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/package.json` (MODIFY)

### Step 1: Read current scripts section

```bash
jq '.scripts' package.json
```

Expected: Shows current npm scripts

### Step 2: Add TypeScript build scripts

Add these three scripts to the `scripts` object in package.json:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "build": "tsc --build",
    "build:clean": "tsc --build --clean"
  }
}
```

**Integration point:** Add after existing scripts, maintaining alphabetical or logical grouping.

### Step 3: Verify JSON syntax

```bash
npm run
```

Expected: Lists all scripts including new type-check, build, build:clean

### Step 4: Verify scripts are executable

```bash
npm run type-check --if-present
```

Expected: Command runs (may succeed or fail, we validate in next tasks)

### Step 5: Commit build scripts

Use `create-git-commit` skill with message:

```text
feat(typescript): add workspace-level build scripts

- type-check: validates types without emitting files
- build: compiles all workspace projects
- build:clean: removes compiled output
```

---

## Task 7 - Validate Phase 1: Config Syntax

**Rationale:** First validation phase ensures TypeScript can parse and merge configuration hierarchy before proceeding.

### Files
No file modifications (validation only)

### Step 1: Run tsc --showConfig

```bash
cd tools/citation-manager && npx tsc --showConfig
```

Expected: Clean JSON output showing merged configuration from base + tool-specific

### Step 2: Verify key settings in output

Check that the output includes:
- `"module": "NodeNext"`
- `"moduleResolution": "NodeNext"`
- `"strict": true`
- `"composite": true`
- `"declaration": true`

You can grep for these:

```bash
cd tools/citation-manager && npx tsc --showConfig | grep -E "(module|strict|composite|declaration)"
```

Expected: All key settings present in merged config

### Step 3: Return to root directory

```bash
cd ../..
```

### Step 4: Document Phase 1 success

#### Validation Phase 1: ✅ PASSED

- Config syntax is valid
- Configuration hierarchy merges correctly
- All strict flags inherited by tool

**No commit needed** (validation only, no file changes)

---

## Task 8 - Validate Phase 2: Type Checking

**Rationale:** Second validation phase ensures type checker runs successfully on zero TypeScript files. Proves infrastructure works before code conversion.

### Files
No file modifications (validation only)

### Step 1: Run type-check script

```bash
npm run type-check
```

Expected: Output shows "Found 0 errors" (zero .ts files exist to check)

### Step 2: Verify exit code

```bash
npm run type-check && echo "SUCCESS"
```

Expected: Prints "SUCCESS" (exit code 0)

### Step 3: Check for any TypeScript files

```bash
find tools/citation-manager/src -name "*.ts" -type f
```

Expected: No output (zero .ts files exist in Epic 1)

### Step 4: Document Phase 2 success

#### Validation Phase 2: ✅ PASSED

- Type checker runs successfully
- Zero errors on zero files
- PRD Criterion met (line 300): "`tsc --noEmit` passes successfully"

**No commit needed** (validation only)

---

## Task 9 - Validate Phase 3: Build Pipeline

**Rationale:** Third validation phase ensures compilation pipeline works with project references. Validates composite mode and build coordination.

### Files
No file modifications (validation only)

### Step 1: Run build script

```bash
npm run build
```

Expected: Success with no output (no .ts files to compile)

### Step 2: Verify exit code

```bash
npm run build && echo "SUCCESS"
```

Expected: Prints "SUCCESS" (exit code 0)

### Step 3: Check dist directory

```bash
ls -la tools/citation-manager/dist/ 2>&1
```

Expected: Either directory doesn't exist or is empty (no .ts files to compile)

### Step 4: Test build:clean script

```bash
npm run build:clean
```

Expected: Runs successfully (cleans any tsbuildinfo files)

### Step 5: Document Phase 3 success

#### Validation Phase 3: ✅ PASSED

- Build pipeline works correctly
- Project references configured properly
- Composite mode functional
- Ready for Epic 4 compilation

**No commit needed** (validation only)

---

## Task 10 - Validate Phase 4: Biome Integration

**Rationale:** Fourth validation phase ensures Biome (linter/formatter) works with TypeScript files. Currently validates existing JavaScript files remain unaffected.

### Files
No file modifications (validation only)

### Step 1: Run Biome check

```bash
npx biome check .
```

Expected: Passes with no errors (checks existing .js files)

### Step 2: Verify Biome finds files

```bash
npx biome check . --verbose 2>&1 | head -20
```

Expected: Shows files being checked (JavaScript files in tools/citation-manager)

### Step 3: Test Biome format (dry run)

```bash
npx biome format . --write --dry
```

Expected: Shows what would be formatted (no actual changes)

### Step 4: Document Phase 4 success

#### Validation Phase 4: ✅ PASSED

- Biome runs without errors
- Existing JavaScript files unaffected
- PRD Criterion met (line 302): "Biome checks TypeScript files without errors"
- Ready to format .ts files in Epic 4

**No commit needed** (validation only)

---

## Task 11 - Validate Phase 5: Existing Tests

**Rationale:** Fifth validation phase ensures zero breakage of existing JavaScript functionality. Critical success criterion for Epic 1.

### Files
No file modifications (validation only)

### Step 1: Run full test suite

```bash
npm test
```

Expected: All existing tests pass (same results as before Epic 1)

### Step 2: Check test coverage

```bash
npm run test:coverage
```

Expected: Coverage results unchanged from pre-Epic 1 baseline

### Step 3: Verify specific citation-manager tests

```bash
npm run test:citation
```

Expected: All citation-manager tests pass

### Step 4: Document Phase 5 success

#### Validation Phase 5: ✅ PASSED

- All existing JavaScript tests pass
- Zero functionality broken
- PRD Criterion met (line 301): "All existing JavaScript tests pass (zero functionality broken)"
- Test infrastructure compatible with TypeScript

**No commit needed** (validation only)

---

## Task 12 - Commit Epic 1 infrastructure

**Rationale:** Final commit captures all Epic 1 work with comprehensive validation summary. Marks completion of infrastructure setup.

### Files
All files from Tasks 1-6 (already committed individually)

### Step 1: Review branch status

```bash
git status
```

Expected: Clean working tree (all changes committed in previous tasks)

### Step 2: Review commit history

```bash
git log --oneline feature/epic1-typescript-infrastructure-setup ^main
```

Expected: Shows 6 commits from Tasks 1-6:
1. docs(architecture): update TypeScript compiler options
2. build(deps): add TypeScript 5.3+ as explicit dev dependency
3. feat(typescript): add tsconfig.base.json with strict type checking
4. feat(typescript): add root tsconfig.json for workspace coordination
5. feat(typescript): add citation-manager TypeScript configuration
6. feat(typescript): add workspace-level build scripts

### Step 3: Create validation summary document

Create a temporary file to document validation success:

```bash
cat > EPIC1-VALIDATION-SUMMARY.md << 'EOF'
# Epic 1 Validation Summary

## All 5 Validation Phases Passed ✅

### Phase 1: Config Syntax ✅
- `tsc --showConfig` produces clean merged configuration
- NodeNext module system configured
- All 13 strict flags inherited

### Phase 2: Type Checking ✅
- `npm run type-check` passes with zero errors
- Zero TypeScript files (infrastructure only)
- PRD Criterion met (line 300)

### Phase 3: Build Pipeline ✅
- `npm run build` succeeds with no output
- Project references functional
- Composite mode working

### Phase 4: Biome Integration ✅
- `npx biome check .` passes
- Existing JavaScript files unaffected
- PRD Criterion met (line 302)

### Phase 5: Existing Tests ✅
- `npm test` passes completely
- Zero functionality broken
- PRD Criterion met (line 301)

## Epic 1 Success Criteria: ALL MET ✅

- ✅ All 5 validation phases pass
- ✅ Zero TypeScript files exist (infrastructure only)
- ✅ Zero existing functionality broken
- ✅ Ready for Epic 3 POC conversion

## Next Steps

1. Epic 3: Proof of Concept validation
2. Convert one test file + one source file
3. Validate end-to-end TypeScript workflow
EOF
```

### Step 4: Commit validation summary

Use `create-git-commit` skill with message:

```text
docs(epic1): add validation summary

All 5 validation phases passed:
- Config syntax verified
- Type checking functional
- Build pipeline working
- Biome integration confirmed
- Zero existing tests broken

Epic 1 complete and ready for Epic 3 POC.
```

### Step 5: Display Epic 1 completion status

#### Epic 1: TypeScript Infrastructure Setup - COMPLETE ✅

**Deliverables:**
- ✅ Three-tier TypeScript configuration hierarchy
- ✅ Strict type checking enabled (13 flags)
- ✅ Build scripts operational
- ✅ Architecture documentation updated
- ✅ All 5 validation phases passed

**Branch:** `feature/epic1-typescript-infrastructure-setup`

**Ready for:** Epic 3 (POC validation with minimal files)

---

## Execution Complete

All 12 tasks completed successfully. Epic 1 establishes TypeScript infrastructure without touching existing code, validated through 5-phase testing strategy.

**Current State:**
- TypeScript configuration hierarchy working
- Zero TypeScript files (as designed)
- Zero existing functionality broken
- Ready for Epic 3 POC conversion

**Next Epic:** Epic 3 - Proof of Concept (validate end-to-end TypeScript conversion with one test file + one source file)
