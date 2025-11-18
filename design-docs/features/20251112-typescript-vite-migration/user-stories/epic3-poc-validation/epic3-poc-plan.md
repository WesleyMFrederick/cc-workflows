# Epic 3: POC Validation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Validate end-to-end TypeScript conversion workflow using minimal risk (2 files) before committing to systematic conversion of all 58 citation-manager files.

**Architecture:** Sequential Test-First Conversion pattern - convert test file first (validates interop), then source file (validates type safety), maintaining continuous GREEN throughout. Selected `normalizeAnchor` as target (leaf node, zero dependencies, primitives only).

**Tech Stack:** TypeScript 5.3+, Vitest 4.x, Node.js ESM

---

## Prerequisites

**Before starting implementation:**

- [ ] Epic 1 TypeScript infrastructure validated (`tsc --noEmit` passes)
- [ ] All existing JavaScript tests passing
- [ ] Git worktree created for Epic 3 POC work
- [ ] Design document reviewed: [epic3-poc-design.md](./epic3-poc-design.md)

---

## Task 1 - Convert Test File to TypeScript

**Goal:** Rename test file from `.js` to `.test.ts` and add explicit type annotations, validating that TypeScript test files can import JavaScript source files.

### Files

- `tools/citation-manager/test/normalize-anchor.test.js` (RENAME to `.test.ts`)

### Step 1: Rename test file to TypeScript

**Command:**

```bash
cd /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows
git mv tools/citation-manager/test/normalize-anchor.test.js tools/citation-manager/test/normalize-anchor.test.ts
```

**Expected Output:**

```text
# Git tracking update confirmed
git status shows: renamed: tools/citation-manager/test/normalize-anchor.test.js -> tools/citation-manager/test/normalize-anchor.test.ts
```

### Step 2: Add explicit type annotations to test file

**File:** `tools/citation-manager/test/normalize-anchor.test.ts`

**Add type annotations to test variables:**

```typescript
import { describe, expect, it } from "vitest";
import {
 normalizeBlockId,
 decodeUrlAnchor,
} from "../src/core/ContentExtractor/normalizeAnchor.js";

describe("Anchor Normalization Utilities", () => {
 it("should remove caret prefix from block anchor", () => {
  // Given: Block anchor with caret '^block-id'
  const input: string = "^block-id";

  // When: normalizeBlockId called
  const result: string | null = normalizeBlockId(input);

  // Then: Caret prefix removed
  expect(result).toBe("block-id");
 });

 it("should return null for null block anchor", () => {
  // Given: null anchor
  const input: null = null;

  // When: normalizeBlockId called
  const result: string | null = normalizeBlockId(input);

  // Then: Returns null unchanged
  expect(result).toBe(null);
 });

 it("should return unchanged anchor without caret", () => {
  // Given: Anchor without caret 'no-caret'
  const input: string = "no-caret";

  // When: normalizeBlockId called
  const result: string | null = normalizeBlockId(input);

  // Then: Returns unchanged
  expect(result).toBe("no-caret");
 });
});

describe("URL Decoding", () => {
 it("should decode URL-encoded anchor with spaces", () => {
  // Given: URL-encoded anchor 'Story%201.7%20Implementation'
  const input: string = "Story%201.7%20Implementation";

  // When: decodeUrlAnchor called
  const result: string | null = decodeUrlAnchor(input);

  // Then: Decoded to spaces
  expect(result).toBe("Story 1.7 Implementation");
 });

 it("should return original anchor if decoding fails", () => {
  // Given: Invalid encoding 'invalid%'
  const input: string = "invalid%";

  // When: decodeUrlAnchor called with invalid encoding
  const result: string | null = decodeUrlAnchor(input);

  // Then: Returns original (graceful fallback)
  expect(result).toBe("invalid%");
 });

 it("should handle null anchor", () => {
  // Given: null anchor
  const input: null = null;

  // When: decodeUrlAnchor called
  const result: string | null = decodeUrlAnchor(input);

  // Then: Returns null
  expect(result).toBe(null);
 });
});
~~~

**Key Type Patterns:**

- Explicit types on all test input variables: `const input: string = "value"`
- Explicit types on result variables: `const result: string | null`
- Import path uses `.js` extension (ESM standard - imports compiled output)

### Step 3: Run test file to verify TypeScript works

**Command:**

```bash
npm test -- normalize-anchor.test.ts
```

**Expected Output:**

```text
 ✓ Anchor Normalization Utilities (3)
   ✓ should remove caret prefix from block anchor
   ✓ should return null for null block anchor
   ✓ should return unchanged anchor without caret
 ✓ URL Decoding (3)
   ✓ should decode URL-encoded anchor with spaces
   ✓ should return original anchor if decoding fails
   ✓ should handle null anchor

Test Files  1 passed (1)
     Tests  6 passed (6)
```

**Critical Validation:** TypeScript test file successfully imports JavaScript source file (`.js` → `.ts` interop works).

### Step 4: Commit test file conversion

Use `create-git-commit` skill with scope: `typescript`

**Expected commit message format:**

```text
feat(typescript): convert normalize-anchor tests to TypeScript

- Rename normalize-anchor.test.js to .test.ts
- Add explicit type annotations to all test variables
- Validate TypeScript test imports JavaScript source successfully
- All 6 tests pass (validates JS/TS interop)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Task 2 - Validate Test File Conversion

**Goal:** Verify TypeScript test file passes and TypeScript compiler recognizes it without errors.

### Files

- `tools/citation-manager/test/normalize-anchor.test.ts` (VALIDATE)

### Step 1: Run TypeScript compiler on test file

**Command:**

```bash
npx tsc --noEmit
```

**Expected Output:**

```text
# Zero errors (compiler recognizes .test.ts file and validates types)
```

### Step 2: Run test file with Vitest

**Command:**

```bash
npm test -- normalize-anchor.test.ts
```

**Expected Output:**

```text
 ✓ Anchor Normalization Utilities (3)
 ✓ URL Decoding (3)

Test Files  1 passed (1)
     Tests  6 passed (6)
```

### Step 3: Verify all other JavaScript tests still pass

**Command:**

```bash
npm test
```

**Expected Output:**

```text
Test Files  [all test files] passed
     Tests  [all tests] passed
```

**Critical Validation:** JavaScript consumers are unaffected by TypeScript test file conversion.

### Step 4: Document interop validation result

**Create checkpoint output:**

```text
✅ CHECKPOINT: TypeScript Test File Conversion
- Test file renamed to .test.ts successfully
- TypeScript compiler recognizes test file (tsc --noEmit passes)
- All 6 tests pass in TypeScript format
- All other JavaScript tests still pass
- INTEROP VALIDATED: .test.ts imports .js source successfully
```

---

## Task 3 - Convert Source File to TypeScript

**Goal:** Rename source file from `.js` to `.ts` and add explicit type signatures (parameters and return types).

### Files

- `tools/citation-manager/src/core/ContentExtractor/normalizeAnchor.js` (RENAME to `.ts`)

### Step 1: Rename source file to TypeScript

**Command:**

```bash
cd /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows
git mv tools/citation-manager/src/core/ContentExtractor/normalizeAnchor.js tools/citation-manager/src/core/ContentExtractor/normalizeAnchor.ts
```

**Expected Output:**

```text
# Git tracking update confirmed
git status shows: renamed: tools/citation-manager/src/core/ContentExtractor/normalizeAnchor.js -> normalizeAnchor.ts
```

### Step 2: Add explicit type signatures to source file

**File:** `tools/citation-manager/src/core/ContentExtractor/normalizeAnchor.ts`

**Add type signatures (parameters and return types):**

```typescript
/**
 * Anchor normalization utilities
 * Per ADR-CE02: Normalization in ContentExtractor, not ParsedDocument
 */

/**
 * Normalize block anchor by removing '^' prefix
 * @param anchor - Block ID that may start with ^, or null
 * @returns Block ID without leading caret, or null if input is null
 */
export function normalizeBlockId(anchor: string | null): string | null {
 // IF anchor is not null AND starts with '^'
 if (anchor && anchor.startsWith("^")) {
  //   RETURN anchor.substring(1)
  return anchor.substring(1);
 }
 // ELSE
 //   RETURN anchor unchanged
 return anchor;
}

/**
 * Decode URL-encoded characters in anchor strings
 * @param anchor - URL-encoded anchor string, or null
 * @returns Decoded anchor string, original if decoding fails, or null if input null
 */
export function decodeUrlAnchor(anchor: string | null): string | null {
 // IF anchor is null
 if (anchor === null) {
  //   RETURN null
  return null;
 }

 // TRY
 try {
  //   RETURN decodeURIComponent(anchor)
  return decodeURIComponent(anchor);
 } catch (error) {
  // CATCH error
  //   RETURN anchor unchanged // Graceful fallback
  return anchor;
 }
}
~~~

**Type Safety Patterns Applied:**

1. Explicit parameter types: `anchor: string | null`
2. Explicit return types: `: string | null`
3. Discriminated unions (type narrows in if-blocks)
4. Strict null handling (early return for null input)
5. Error handling preserves type contract
6. **No `any` escapes** - functions use only primitives

### Step 3: Run TypeScript compiler

**Command:**

```bash
npx tsc --noEmit
```

**Expected Output:**

```text
# Zero errors (type signatures valid, strict mode passes)
```

### Step 4: Run tests to verify functionality preserved

**Command:**

```bash
npm test -- normalize-anchor.test.ts
```

**Expected Output:**

```text
 ✓ Anchor Normalization Utilities (3)
 ✓ URL Decoding (3)

Test Files  1 passed (1)
     Tests  6 passed (6)
```

**Critical Validation:** TypeScript source file works identically to JavaScript version (GREEN maintained).

### Step 5: Commit source file conversion

Use `create-git-commit` skill with scope: `typescript`

**Expected commit message format:**

```text
feat(typescript): convert normalizeAnchor source to TypeScript

- Rename normalizeAnchor.js to .ts
- Add explicit type signatures: anchor: string | null
- Add explicit return types: string | null
- Strict null handling and discriminated unions
- Zero `any` escapes (primitives only)
- All 6 tests pass (validates type safety)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Task 4 - Validate Source File Conversion

**Goal:** Verify TypeScript source file compiles correctly, tests pass, and JavaScript consumers still work.

### Files

- `tools/citation-manager/src/core/ContentExtractor/normalizeAnchor.ts` (VALIDATE)
- `tools/citation-manager/test/normalize-anchor.test.ts` (VALIDATE)

### Step 1: Run TypeScript compiler with strict mode

**Command:**

```bash
npx tsc --noEmit --strictNullChecks
```

**Expected Output:**

```text
# Zero errors (strict null checking passes)
```

### Step 2: Run converted tests

**Command:**

```bash
npm test -- normalize-anchor.test.ts
```

**Expected Output:**

```text
 ✓ Anchor Normalization Utilities (3)
 ✓ URL Decoding (3)

Test Files  1 passed (1)
     Tests  6 passed (6)
```

### Step 3: Verify JavaScript consumers still work

**Consuming files (identified in design):**

- `tools/citation-manager/src/core/ContentExtractor/extractLinksContent.js`
- `tools/citation-manager/src/core/ContentExtractor/ContentExtractor.js`
- `tools/citation-manager/src/citation-manager.js`

**Command:**

```bash
npm test -- ContentExtractor.test.js
npm test -- extractLinksContent.test.js
```

**Expected Output:**

```text
# All consuming component tests pass
Test Files  2 passed (2)
     Tests  [all] passed
```

**Critical Validation:** JavaScript consumers can import and use TypeScript source (validates backward compatibility).

### Step 4: Document type safety validation result

**Create checkpoint output:**

```text
✅ CHECKPOINT: TypeScript Source File Conversion
- Source file renamed to .ts successfully
- TypeScript compiler validates types (tsc --noEmit passes)
- Strict null checking passes (--strictNullChecks)
- All 6 tests pass in TypeScript format
- JavaScript consumers still work (extractLinksContent, ContentExtractor)
- TYPE SAFETY VALIDATED: Strict mode, no `any` escapes, explicit contracts
```

---

## Task 5 - Run Comprehensive Validation Checkpoints

**Goal:** Execute all 7 validation checkpoints from design document to prove POC success.

### Files

- All citation-manager files (VALIDATE)

### Step 1: Checkpoint 1 - TypeScript compilation

**Command:**

```bash
npx tsc --noEmit
```

**Expected Output:**

```text
# Zero errors
```

**Document result:**

```text
✅ Checkpoint 1: TypeScript compilation - PASS (zero errors)
```

### Step 2: Checkpoint 2 - No `any` escapes

**Command:**

```bash
grep -r "any" tools/citation-manager/src/core/ContentExtractor/normalizeAnchor.ts
```

**Expected Output:**

```text
# Zero matches (no 'any' type escapes)
```

**Document result:**

```text
✅ Checkpoint 2: No `any` escapes - PASS (zero matches)
```

### Step 3: Checkpoint 3 - Explicit return types

**Command:**

```bash
cat tools/citation-manager/src/core/ContentExtractor/normalizeAnchor.ts | grep "export function"
```

**Expected Output:**

```text
export function normalizeBlockId(anchor: string | null): string | null {
export function decodeUrlAnchor(anchor: string | null): string | null {
```

**Document result:**

```text
✅ Checkpoint 3: Explicit return types - PASS (both functions have `: string | null`)
```

### Step 4: Checkpoint 4 - Strict null checking

**Command:**

```bash
npx tsc --noEmit --strictNullChecks
```

**Expected Output:**

```text
# Zero errors
```

**Document result:**

```text
✅ Checkpoint 4: Strict null checking - PASS (zero errors)
```

### Step 5: Checkpoint 5 - All tests pass

**Command:**

```bash
npm test -- normalize-anchor.test.ts
```

**Expected Output:**

```text
 ✓ Anchor Normalization Utilities (3)
 ✓ URL Decoding (3)

Test Files  1 passed (1)
     Tests  6 passed (6)
```

**Document result:**

```text
✅ Checkpoint 5: All tests pass - PASS (6/6 tests)
```

### Step 6: Checkpoint 6 - JavaScript consumers work

**Command:**

```bash
npm test -- ContentExtractor.test.js
npm test -- extractLinksContent.test.js
```

**Expected Output:**

```text
Test Files  2 passed (2)
     Tests  [all] passed
```

**Document result:**

```text
✅ Checkpoint 6: JavaScript consumers work - PASS (all consuming tests pass)
```

### Step 7: Checkpoint 7 - Compiled output generation

**Command:**

```bash
npx tsc --build tools/citation-manager/tsconfig.json
ls -la tools/citation-manager/dist/core/ContentExtractor/normalizeAnchor.js
ls -la tools/citation-manager/dist/core/ContentExtractor/normalizeAnchor.d.ts
```

**Expected Output:**

```text
# Both .js and .d.ts files exist in dist/
-rw-r--r--  normalizeAnchor.js
-rw-r--r--  normalizeAnchor.d.ts
```

**Verify CLI execution from dist/:**

**Command:**

```bash
npm run citation:validate -- tools/citation-manager/test/fixtures/valid-citations.md
```

**Expected Output:**

```text
✅ ALL CITATIONS VALID
Total citations: [count]
Validation time: [time]
```

**Document result:**

```text
✅ Checkpoint 7: Compiled output generation - PASS
  - normalizeAnchor.js exists in dist/
  - normalizeAnchor.d.ts exists in dist/
  - CLI executes successfully from dist/
```

### Step 8: Compile all checkpoint results

**Create comprehensive validation report:**

```text
========================================
Epic 3 POC Validation - Checkpoint Results
========================================

Type Safety Validation (Compiler-Level):
  ✅ Checkpoint 1: TypeScript compilation - PASS (zero errors)
  ✅ Checkpoint 2: No `any` escapes - PASS (zero matches)
  ✅ Checkpoint 3: Explicit return types - PASS (both functions typed)
  ✅ Checkpoint 4: Strict null checking - PASS (zero errors)

Functional Validation (Test-Level):
  ✅ Checkpoint 5: All tests pass - PASS (6/6 tests)
  ✅ Checkpoint 6: JavaScript consumers work - PASS (all consuming tests pass)

Build Validation (Compilation):
  ✅ Checkpoint 7: Compiled output generation - PASS
    - normalizeAnchor.js compiled successfully
    - normalizeAnchor.d.ts generated successfully
    - CLI executes successfully from dist/

========================================
OVERALL RESULT: ALL CHECKPOINTS PASS ✅
========================================

POC Success Criteria Met:
  ✅ All 7 validation checkpoints pass
  ✅ Zero `any` type escapes
  ✅ Continuous GREEN maintained (all tests pass)
  ✅ JavaScript consumers still work (validates interop)
  ✅ TypeScript infrastructure from Epic 1 validated
  ✅ Test-first conversion pattern validated

Ready to Proceed to Epic 4 (systematic conversion of 58 files)
```

---

## Task 6 - Document Results and Request Code Review

**Goal:** Document POC results, lessons learned, and request code review before merging.

### Files

- `design-docs/features/20251112-typescript-vite-migration/user-stories/epic3-poc-validation/epic3-poc-results.md` (CREATE)

### Step 1: Create results document

**File:** `design-docs/features/20251112-typescript-vite-migration/user-stories/epic3-poc-validation/epic3-poc-results.md`

**Content:** (See epic3-poc-design.md for template structure)

### Step 2: Commit results document

Use `create-git-commit` skill with scope: `docs`

### Step 3: Request code review

Use `requesting-code-review` skill

**Review Scope:**

- TypeScript test file conversion (`normalize-anchor.test.ts`)
- TypeScript source file conversion (`normalizeAnchor.ts`)
- Results documentation (`epic3-poc-results.md`)
- Validation checkpoint evidence

**Review Focus:**

- Type safety patterns (explicit types, no `any` escapes)
- Test-first conversion workflow
- JavaScript/TypeScript interop validation
- Pattern readiness for Epic 4 scaling

### Step 4: Output checkpoint results to chat

Display comprehensive validation report from Step 8 of Task 5.

---

## Validation Commands Summary

**Quick validation reference for each task:**

```bash
# Task 1: Test file conversion
npm test -- normalize-anchor.test.ts

# Task 2: Test file validation
npx tsc --noEmit
npm test

# Task 3: Source file conversion
npx tsc --noEmit
npm test -- normalize-anchor.test.ts

# Task 4: Source file validation
npx tsc --noEmit --strictNullChecks
npm test -- ContentExtractor.test.js extractLinksContent.test.js

# Task 5: Comprehensive validation (all 7 checkpoints)
npx tsc --noEmit                                    # Checkpoint 1
grep -r "any" tools/citation-manager/src/core/ContentExtractor/normalizeAnchor.ts  # Checkpoint 2
cat tools/citation-manager/src/core/ContentExtractor/normalizeAnchor.ts | grep "export function"  # Checkpoint 3
npx tsc --noEmit --strictNullChecks                 # Checkpoint 4
npm test -- normalize-anchor.test.ts                # Checkpoint 5
npm test -- ContentExtractor.test.js extractLinksContent.test.js  # Checkpoint 6
npx tsc --build tools/citation-manager/tsconfig.json  # Checkpoint 7
npm run citation:validate -- tools/citation-manager/test/fixtures/valid-citations.md  # Checkpoint 7
```

---

## Skills Reference

- **Required:** `create-git-commit` - Commit after each task completion
- **Required:** `requesting-code-review` - Review POC before merge to main
- **Optional:** `test-driven-development` - Follow REFACTOR discipline (stay GREEN)
- **Optional:** `finishing-a-development-branch` - Merge POC to main after approval

---

## Notes

**TDD Discipline:** This is a REFACTOR operation (staying GREEN throughout), not RED-GREEN-REFACTOR. We're converting working JavaScript to TypeScript without changing functionality.

**Continuous GREEN:** All tests must pass after each task. If any test fails, fix immediately before proceeding.

**No Breaking Changes:** JavaScript consumers must continue working throughout conversion.

**POC Scope:** Only 2 files (1 test, 1 source) - deliberately minimal to validate pattern before Epic 4.
