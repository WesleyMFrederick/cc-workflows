# Epic 4: Systematic Conversion - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Systematically convert all 58 citation-manager files to TypeScript using test-first pattern validated in Epic 3, maintaining continuous GREEN throughout.

**Architecture:** Automation-First Module Conversion - Build validation scripts and type library upfront, then convert modules incrementally (ContentExtractor → Core → Integration → Factories/CLI) following dependency order with continuous validation.

**Tech Stack:** TypeScript 5.3+, Vitest, npm scripts, git mv for conversions

---

## Story 4.1: Automation Infrastructure & Type Library

### Task 4.1.1: Create TypeScript Validation Checkpoint Script

**Files:**
- `tools/citation-manager/scripts/validate-typescript-conversion.ts` (CREATE)
- `tools/citation-manager/test/scripts/validate-typescript-conversion.test.ts` (CREATE & TEST)
- `tools/citation-manager/package.json` (MODIFY - add script)

#### Step 1: Write failing test for validation script

```typescript
// test/scripts/validate-typescript-conversion.test.ts
import { describe, it, expect } from "vitest";
import { /* validation functions */ } from "../../scripts/validate-typescript-conversion";

describe("validate-typescript-conversion", () => {
  it("should pass all 7 checkpoints for Epic 3 normalizeAnchor.ts", () => {
    // Given: Path to Epic 3 POC file
    // Fixture: Use actual normalizeAnchor.ts from src/core/ContentExtractor/
    const filePath = /* resolve path to normalizeAnchor.ts */;

    // When: Run validation checkpoints
    // Integration: Spawns tsc, searches file content, runs tests
    const result = /* validateConversion(filePath) */;

    // Then: All 7 checkpoints pass
    // Verification: Each checkpoint in results array has passed: true
    expect(result.allPassed).toBe(true);
    expect(result.results).toHaveLength(7);

    // Pattern: Validate checkpoint names match Epic 3 spec
    const checkpointNames = /* extract checkpoint names from results */;
    expect(checkpointNames).toContain("TypeScript Compilation");
    expect(checkpointNames).toContain("No `any` Escapes");
  });
});
```

#### Step 2: Run test to verify it fails

Run: `npm test -- validate-typescript-conversion.test.ts`
Expected: FAIL with "validateConversion not defined"

#### Step 3: Implement validation checkpoint script

```typescript
// scripts/validate-typescript-conversion.ts
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

/**
 * Validation checkpoint result for a single check
 */
interface ValidationResult {
  checkpoint: string;
  passed: boolean;
  message: string;
}

/**
 * Complete conversion validation result
 */
interface ConversionValidation {
  file: string;
  results: ValidationResult[];
  allPassed: boolean;
}

/**
 * Validate TypeScript conversion quality for a file.
 * Integration: Spawns tsc, grep, npm test as child processes.
 *
 * @param filePath - Absolute path to TypeScript file to validate
 * @returns Validation result with 7 checkpoint outcomes
 */
export function validateConversion(filePath: string): ConversionValidation {
  // --- Checkpoint Execution ---
  const results: ValidationResult[] = [];

  // Checkpoint 1: TypeScript compilation
  results.push(validateCompilation(filePath));

  // Checkpoint 2: No `any` escapes
  results.push(validateNoAnyEscapes(filePath));

  // Checkpoint 3: Explicit return types
  results.push(validateExplicitReturnTypes(filePath));

  // Checkpoint 4: Strict null checking
  results.push(validateStrictNullChecks(filePath));

  // Checkpoint 5: All tests pass
  results.push(validateTestsPassing(filePath));

  // Checkpoint 6: JavaScript consumers work
  results.push(validateConsumerCompatibility(filePath));

  // Checkpoint 7: Compiled output generated
  results.push(validateCompiledOutput(filePath));

  // --- Result Aggregation ---
  const allPassed = /* check all results[].passed === true */;

  return { file: filePath, results, allPassed };
}

function validateCompilation(filePath: string): ValidationResult {
  // Boundary: Execute tsc compiler as child process
  try {
    // Integration: npx tsc --noEmit spawns TypeScript compiler
    execSync("npx tsc --noEmit", {
      cwd: /* resolve to tools/citation-manager */,
      stdio: "pipe",
      encoding: "utf8"
    });

    return {
      checkpoint: "TypeScript Compilation",
      passed: true,
      message: "Zero compiler errors"
    };
  } catch (error) {
    // Decision: Catch exec errors, extract stderr for diagnostics
    return {
      checkpoint: "TypeScript Compilation",
      passed: false,
      message: /* extract error.stderr */
    };
  }
}

function validateNoAnyEscapes(filePath: string): ValidationResult {
  // Boundary: Read file content from disk
  const content = readFileSync(filePath, "utf8");

  // Pattern: Regex search for `: any` or `as any` patterns
  // Decision: Exclude comments from search
  const anyMatches = /* search for /:\s*any|as\s+any/ excluding // and /* comments */;

  return {
    checkpoint: "No `any` Escapes",
    passed: /* anyMatches.length === 0 */,
    message: /* anyMatches.length > 0 ? `Found ${count} any escapes` : "No any escapes" */
  };
}

function validateExplicitReturnTypes(filePath: string): ValidationResult {
  // Boundary: Read file content
  const content = readFileSync(filePath, "utf8");

  // Pattern: Parse exported functions, check for `: Type` return annotations
  // Decision: Use AST or regex to find export function patterns
  const functionsWithoutReturnTypes = /* find exported functions missing `: Type` */;

  return {
    checkpoint: "Explicit Return Types",
    passed: /* functionsWithoutReturnTypes.length === 0 */,
    message: /* list functions missing return types or "All exports typed" */
  };
}

function validateStrictNullChecks(filePath: string): ValidationResult {
  // Integration: Run tsc with --strictNullChecks flag
  try {
    execSync("npx tsc --noEmit --strictNullChecks", {
      cwd: /* tools/citation-manager */,
      stdio: "pipe"
    });

    return {
      checkpoint: "Strict Null Checking",
      passed: true,
      message: "Zero strict null errors"
    };
  } catch (error) {
    return {
      checkpoint: "Strict Null Checking",
      passed: false,
      message: /* extract null-related errors */
    };
  }
}

function validateTestsPassing(filePath: string): ValidationResult {
  // Decision: Find corresponding test file
  const testFilePath = /* convert src/path/file.ts to test/path/file.test.ts */;

  // Integration: Run npm test for specific test file
  try {
    execSync(`npm test -- ${testFilePath}`, {
      cwd: /* tools/citation-manager */,
      stdio: "pipe"
    });

    return {
      checkpoint: "All Tests Pass",
      passed: true,
      message: "Tests passing"
    };
  } catch (error) {
    return {
      checkpoint: "All Tests Pass",
      passed: false,
      message: /* extract test failure details */
    };
  }
}

function validateConsumerCompatibility(filePath: string): ValidationResult {
  // Integration: Run full test suite to check JavaScript consumers
  try {
    execSync("npm test", {
      cwd: /* tools/citation-manager */,
      stdio: "pipe"
    });

    return {
      checkpoint: "JavaScript Consumers Work",
      passed: true,
      message: "All 304 tests pass"
    };
  } catch (error) {
    return {
      checkpoint: "JavaScript Consumers Work",
      passed: false,
      message: /* extract test failure count */
    };
  }
}

function validateCompiledOutput(filePath: string): ValidationResult {
  // Integration: Run tsc --build to generate output
  try {
    execSync("npx tsc --build", {
      cwd: /* tools/citation-manager */,
      stdio: "pipe"
    });

    // Boundary: Check dist/ files exist
    const distPath = /* convert src/path/file.ts to dist/path/file.js */;
    const dtsPath = /* convert to dist/path/file.d.ts */;

    const jsExists = /* fs.existsSync(distPath) */;
    const dtsExists = /* fs.existsSync(dtsPath) */;

    // Decision: Both .js and .d.ts must exist
    if (jsExists && dtsExists) {
      return {
        checkpoint: "Compiled Output Generated",
        passed: true,
        message: "Both .js and .d.ts generated"
      };
    } else {
      return {
        checkpoint: "Compiled Output Generated",
        passed: false,
        message: /* describe which files missing */
      };
    }
  } catch (error) {
    return {
      checkpoint: "Compiled Output Generated",
      passed: false,
      message: /* extract build error */
    };
  }
}
```

#### Step 4: Run test to verify it passes

Run: `npm test -- validate-typescript-conversion.test.ts`
Expected: PASS

#### Step 5: Add npm script for validation

```json
// package.json
{
  "scripts": {
    "validate:ts-conversion": "node --loader ts-node/esm scripts/validate-typescript-conversion.ts"
  }
}
```

#### Step 6: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.1] create validation checkpoint script with 7 automated checks"
- Files: scripts/validate-typescript-conversion.ts, test file, package.json

---

### Task 4.1.2: Create citationTypes.ts Shared Type Library

**Files:**
- `tools/citation-manager/src/types/citationTypes.ts` (CREATE)
- `tools/citation-manager/test/types/citationTypes.test.ts` (CREATE & TEST)

#### Step 1: Write failing test for citationTypes

```typescript
// test/types/citationTypes.test.ts
import { describe, it, expect } from "vitest";
import type { LinkObject, ValidationMetadata, LinkScope, ValidationStatus } from "../../src/types/citationTypes";

describe("citationTypes", () => {
  it("should export LinkObject interface", () => {
    // Given: Type definitions imported
    // When: Create LinkObject instance
    const link: LinkObject = {
      rawSourceLink: "[test](file.md)",
      linkType: "markdown",
      scope: "internal",
      target: {
        path: { raw: "file.md", absolute: "/abs/file.md", relative: null },
        anchor: null
      },
      text: "test",
      fullMatch: "[test](file.md)",
      line: 1,
      column: 0
    };

    // Then: Object matches LinkObject contract
    // Verification: TypeScript compiles without errors
    expect(link).toBeDefined();
    expect(link.linkType).toBe("markdown");
  });

  it("should export LinkScope and ValidationStatus type aliases", () => {
    // Given: Type aliases imported
    // When: Assign to typed variables
    const scope: LinkScope = "internal";
    const status: ValidationStatus = "valid";

    // Then: TypeScript allows valid values
    expect(scope).toBe("internal");
    expect(status).toBe("valid");
  });
});
```

#### Step 2: Run test to verify it fails

Run: `npm test -- citationTypes.test.ts`
Expected: FAIL with "Cannot find module '../../src/types/citationTypes'"

#### Step 3: Create citationTypes.ts type library

```typescript
// src/types/citationTypes.ts

/**
 * Link scope classification for citation validation.
 * Decision: Discriminated union prevents invalid scope values.
 */
export type LinkScope = 'internal' | 'external';

/**
 * Citation validation status.
 * Decision: Three-state model (valid/warning/error) matches UI requirements.
 */
export type ValidationStatus = 'valid' | 'warning' | 'error';

/**
 * Link object representing a markdown reference.
 * Integration: Created by LinkObjectFactory, consumed by CitationValidator.
 *
 * Pattern: Immutable data structure with optional validation enrichment.
 */
export interface LinkObject {
  /** Raw markdown syntax as found in source */
  rawSourceLink: string;

  /** Link syntax type */
  linkType: 'markdown' | 'wiki';

  /** Link scope classification */
  scope: LinkScope;

  /** Target resolution */
  target: {
    path: {
      /** Raw path string from markdown */
      raw: string;
      /** Absolute file system path (null if unresolved) */
      absolute: string | null;
      /** Relative path from source file (null if unresolved) */
      relative: string | null;
    };
    /** Header/block anchor (null if no anchor) */
    anchor: string | null;
  };

  /** Display text shown in markdown */
  text: string;

  /** Complete matched markdown syntax */
  fullMatch: string;

  /** Source file line number (1-based) */
  line: number;

  /** Source file column number (0-based) */
  column: number;

  /** Validation metadata (enriched during validation) */
  validation?: ValidationMetadata;
}

/**
 * Validation metadata enriched during validation.
 * Integration: Added by CitationValidator during validateFile.
 *
 * Pattern: Optional enrichment prevents coupling parser to validator.
 */
export interface ValidationMetadata {
  /** Validation outcome status */
  status: ValidationStatus;

  /** Target file exists on disk */
  fileExists: boolean;

  /** Target anchor exists in file (null if no anchor specified) */
  anchorExists: boolean | null;

  /** Suggested corrections for errors (empty for valid) */
  suggestions?: string[];

  /** Path conversion info for cross-references */
  pathConversion?: string;
}
```

#### Step 4: Run test to verify it passes

Run: `npm test -- citationTypes.test.ts`
Expected: PASS

#### Step 5: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.1] create citationTypes shared type library"
- Files: src/types/citationTypes.ts, test file

---

### Task 4.1.3: Create validationTypes.ts Shared Type Library

**Files:**
- `tools/citation-manager/src/types/validationTypes.ts` (CREATE)
- `tools/citation-manager/test/types/validationTypes.test.ts` (CREATE & TEST)

#### Step 1: Write failing test

```typescript
// test/types/validationTypes.test.ts
import { describe, it, expect } from "vitest";
import type { CitationValidationResult, FileValidationSummary, ResolutionResult } from "../../src/types/validationTypes";

describe("validationTypes", () => {
  it("should export ResolutionResult discriminated union", () => {
    // Given: Type definitions imported
    // When: Create found result
    const found: ResolutionResult = {
      found: true,
      path: "/abs/path/file.md",
      reason: "direct"
    };

    // Then: TypeScript validates discriminated union
    // Verification: Found result has path, notFound result has null path
    if (found.found) {
      expect(found.path).toBe("/abs/path/file.md");
    }

    // When: Create not found result
    const notFound: ResolutionResult = {
      found: false,
      path: null,
      reason: "not_found"
    };

    // Then: TypeScript enforces path is null when found is false
    expect(notFound.found).toBe(false);
    expect(notFound.path).toBeNull();
  });
});
```

#### Step 2: Run test to verify it fails

Run: `npm test -- validationTypes.test.ts`
Expected: FAIL with "Cannot find module"

#### Step 3: Create validationTypes.ts

```typescript
// src/types/validationTypes.ts
import type { LinkObject, ValidationStatus } from "./citationTypes";

/**
 * Validation result for single citation.
 * Integration: Returned by CitationValidator for each link.
 */
export interface CitationValidationResult {
  /** Link object with validation enrichment */
  link: LinkObject;

  /** Validation outcome */
  status: ValidationStatus;

  /** Human-readable message */
  message: string;

  /** Suggested corrections */
  suggestions: string[];
}

/**
 * File validation summary.
 * Integration: Top-level result from validateFile.
 */
export interface FileValidationSummary {
  /** Source file path */
  filePath: string;

  /** Total citation count */
  totalCitations: number;

  /** Valid citation count */
  validCount: number;

  /** Warning citation count */
  warningCount: number;

  /** Error citation count */
  errorCount: number;

  /** Individual validation results */
  results: CitationValidationResult[];
}

/**
 * File cache resolution result.
 * Pattern: Discriminated union with found/notFound states.
 *
 * Decision: Separate states prevent null path access errors.
 */
export type ResolutionResult =
  | {
      found: true;
      path: string;
      reason: 'direct' | 'cache';
    }
  | {
      found: false;
      path: null;
      reason: 'not_found' | 'duplicate';
      candidates?: string[];
    };
```

#### Step 4: Run test to verify it passes

Run: `npm test -- validationTypes.test.ts`
Expected: PASS

#### Step 5: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.1] create validationTypes shared type library"

---

### Task 4.1.4: Create contentExtractorTypes.ts Shared Type Library

**Files:**
- `tools/citation-manager/src/types/contentExtractorTypes.ts` (CREATE)
- `tools/citation-manager/test/types/contentExtractorTypes.test.ts` (CREATE & TEST)

#### Step 1: Write failing test

```typescript
// test/types/contentExtractorTypes.test.ts
import { describe, it, expect } from "vitest";
import type { EligibilityAnalysis, ExtractedContent } from "../../src/types/contentExtractorTypes";

describe("contentExtractorTypes", () => {
  it("should export EligibilityAnalysis interface", () => {
    // Given: Type imported
    // When: Create analysis result
    const analysis: EligibilityAnalysis = {
      eligible: true,
      reason: "Section link with force marker",
      strategy: "ForceMarkerStrategy"
    };

    // Then: TypeScript validates structure
    expect(analysis.eligible).toBe(true);
    expect(analysis.strategy).toBeDefined();
  });
});
```

#### Step 2: Run test to verify it fails

Run: `npm test -- contentExtractorTypes.test.ts`
Expected: FAIL

#### Step 3: Create contentExtractorTypes.ts

```typescript
// src/types/contentExtractorTypes.ts

/**
 * Eligibility analysis result from strategy chain.
 * Integration: Used by analyzeEligibility and strategy implementations.
 */
export interface EligibilityAnalysis {
  /** Whether link is eligible for content extraction */
  eligible: boolean;

  /** Human-readable reason for decision */
  reason: string;

  /** Strategy class name that made decision */
  strategy: string;
}

/**
 * Extracted content block with metadata.
 * Integration: Created by ContentExtractor, consumed by extract commands.
 */
export interface ExtractedContent {
  /** SHA-256 hash prefix for content deduplication */
  contentId: string;

  /** Extracted markdown content */
  content: string;

  /** Source links that reference this content */
  sourceLinks: Array<{
    rawSourceLink: string;
    sourceLine: number;
  }>;
}

/**
 * Complete extraction result with all content blocks.
 * Integration: Top-level result from extractLinksContent.
 */
export interface OutgoingLinksExtractedContent {
  /** All extracted content blocks (deduplicated by contentId) */
  extractedContentBlocks: Record<string, ExtractedContent>;

  /** Total character length across all content */
  _totalContentCharacterLength: number;
}
```

#### Step 4: Run test to verify it passes

Run: `npm test -- contentExtractorTypes.test.ts`
Expected: PASS

#### Step 5: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.1] create contentExtractorTypes shared type library"

---

### Task 4.1.5: Document Type Organization Patterns

**Files:**
- `tools/citation-manager/docs/type-patterns.md` (CREATE)

#### Step 1: Create type-patterns.md skeleton

```markdown
# TypeScript Type Organization Patterns

**Purpose:** Document type patterns and organization strategy for citation-manager TypeScript migration.

**Audience:** Developers converting JavaScript files to TypeScript during Epic 4.

---

## Table of Contents

1. [Type Organization Decision Criteria](#type-organization-decision-criteria)
2. [Type Pattern Examples](#type-pattern-examples)
3. [Circular Dependency Prevention](#circular-dependency-prevention)

---
```

#### Step 2: Document 4 type patterns from Epic 3

```markdown
## Type Pattern Examples

### Pattern 1: Discriminated Union with Null

**Use for:** Functions that may return null based on input validation.

**Example:**

```typescript
export function normalizeBlockId(anchor: string | null): string | null {
  if (anchor && anchor.startsWith("^")) {
    return anchor.substring(1);
  }
  return anchor;
}
```

**Rationale:** Explicit null handling prevents undefined behavior. TypeScript strict null checking catches missing null guards.

---

### Pattern 2: Discriminated Union for State

**Use for:** Results that have multiple distinct states (success/failure, found/notFound).

**Example:**

```typescript
export type ResolutionResult =
  | { found: true; path: string; reason: 'direct' | 'cache' }
  | { found: false; path: null; reason: 'not_found' | 'duplicate'; candidates?: string[] };
```

**Rationale:** Discriminated unions make illegal states unrepresentable. TypeScript narrows types in conditional blocks.

---

### Pattern 3: Graceful Error Handling with Type Contract

**Use for:** Operations that may fail but should maintain type safety.

**Example:**

```typescript
export function decodeUrlAnchor(anchor: string | null): string | null {
  if (anchor === null) return null;

  try {
    return decodeURIComponent(anchor);
  } catch (error) {
    return anchor; // Graceful fallback preserves contract
  }
}
```

**Rationale:** Type contract guarantees return type even with errors. Fallback prevents exception propagation.

---

### Pattern 4: Explicit Optional Parameters

**Use for:** Dependency injection with optional overrides.

**Example:**

```typescript
export function createValidator(
  parser: MarkdownParser,
  cache?: FileCache
): CitationValidator {
  // Implementation uses cache if provided, otherwise validates without it
}
```

**Rationale:** Optional parameters document flexibility. TypeScript enforces null checks when accessing optional params.

---

#### Step 3: Add decision criteria table

```markdown
## Type Organization Decision Criteria

### Extract to `*Types.ts` vs Co-locate in Operation File

| Criteria | Extract to `*Types.ts` | Co-locate in operation file |
|----------|------------------------|----------------------------|
| **Used by 2+ modules?** | ✅ YES | ❌ NO |
| **Domain entity?** | ✅ YES (LinkObject, ValidationResult) | ❌ NO |
| **Public API contract?** | ✅ YES | ❌ NO |
| **Prevents circular deps?** | ✅ YES | ❌ NO |
| **Operation-internal helper?** | ❌ NO | ✅ YES (EligibilityAnalysis) |
| **Discriminated union for single operation?** | ❌ NO | ✅ YES |

### Examples

**Extract to citationTypes.ts (shared domain type):**

```typescript
// types/citationTypes.ts - SHARED across multiple modules
export interface LinkObject {
  rawSourceLink: string;
  target: { path: string; anchor: string | null };
  validation?: ValidationMetadata;
}
```

**Co-locate in analyzeEligibility.ts (operation-specific type):**

```typescript
// core/ContentExtractor/analyzeEligibility.ts
import type { LinkObject } from '../../types/citationTypes';

// ✅ Co-located: Only used by analyzeEligibility operation
export interface EligibilityAnalysis {
  eligible: boolean;
  reason: string;
  strategy: string;
}

export function analyzeEligibility(link: LinkObject): EligibilityAnalysis {
  // Uses shared LinkObject + local EligibilityAnalysis
}
```

---

## Circular Dependency Prevention

### Three-Layer Dependency Hierarchy

```text
Layer 1: types/ directory (ZERO dependencies)
         ↓ (types depend on nothing)
Layer 2: operations (depend ONLY on types/)
         ↓ (operations depend on types)
Layer 3: orchestrators (depend on types + operations)
```

### Rules

1. **Contracts depend on nothing** - types/ directory has zero imports from operations
2. **Operations depend on contracts** - import from types/
3. **Never the reverse** - types never import from operations

**Example:**

```typescript
// ✅ CORRECT: Operation imports contract
// core/ContentExtractor/analyzeEligibility.ts
import type { LinkObject } from '../../types/citationTypes';

// ❌ WRONG: Contract imports operation
// types/citationTypes.ts
import type { EligibilityAnalysis } from '../core/ContentExtractor/analyzeEligibility';
```

---

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "docs(typescript): [Epic 4.1] document type organization patterns and decision criteria"

---

### Task 4.1.6: Validate Automation Against Epic 3 Files

**Files:**
- None (verification task)

#### Step 1: Run validation script on Epic 3 normalizeAnchor.ts

Run: `npm run validate:ts-conversion -- tools/citation-manager/src/core/ContentExtractor/normalizeAnchor.ts`

Expected: All 7 checkpoints PASS

#### Step 2: Fix any checkpoint failures

If any checkpoint fails:
- Review failure message
- Fix validation script logic
- Re-run validation

#### Step 3: Improve error messages

Review validation output:
- Ensure checkpoint names match Epic 3 spec
- Add color coding (green/red) for pass/fail
- Include file path in output

#### Step 4: Commit improvements

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.1] validate automation script against Epic 3 POC files"

---

## Story 4.2: ContentExtractor Module Conversion

### Task 4.2.1: Convert generateContentId (test + source)

**Files:**
- `test/generate-content-id.test.js` → `.ts` (MODIFY)
- `src/core/ContentExtractor/generateContentId.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test file to TypeScript

```bash
# Boundary: Git operations for file rename
git mv tools/citation-manager/test/generate-content-id.test.js \
       tools/citation-manager/test/generate-content-id.test.ts
```

```typescript
// test/generate-content-id.test.ts
import { describe, it, expect } from 'vitest';
import { generateContentId } from '../src/core/ContentExtractor/generateContentId';

describe('generateContentId', () => {
  it('should generate consistent SHA-256 hash for content', () => {
    // Given: Sample content string
    const content: string = 'Sample markdown content';

    // When: Content ID is generated
    const id: string = generateContentId(content);

    // Then: ID is 16-character SHA-256 prefix
    // Verification: Hash length and format
    expect(id).toHaveLength(16);
    expect(id).toMatch(/^[a-f0-9]{16}$/);
  });

  it('should return same ID for identical content', () => {
    // Given: Two identical content strings
    const content1: string = 'Identical content';
    const content2: string = 'Identical content';

    // When: IDs are generated
    const id1: string = generateContentId(content1);
    const id2: string = generateContentId(content2);

    // Then: IDs match (deterministic hashing)
    expect(id1).toBe(id2);
  });
});
```

Run: `npm test -- generate-content-id.test.ts`
Expected: FAIL (cannot find module - source still .js)

#### Step 2: GREEN - Convert source file to TypeScript

```bash
git mv tools/citation-manager/src/core/ContentExtractor/generateContentId.js \
       tools/citation-manager/src/core/ContentExtractor/generateContentId.ts
```

```typescript
// src/core/ContentExtractor/generateContentId.ts
import { createHash } from 'crypto';

/**
 * Generate deterministic content ID using SHA-256 hash.
 * Integration: Uses Node.js crypto module for hashing.
 *
 * @param content - Content to hash
 * @returns 16-character hash prefix for content deduplication
 */
export function generateContentId(content: string): string {
  // --- Hash Generation ---
  // Integration: Node.js crypto.createHash for SHA-256
  const hash = createHash('sha256');

  // Boundary: Update hash with content string
  hash.update(content);

  // --- Hash Extraction ---
  // Pattern: Take first 16 characters of hex digest
  return hash.digest('hex').substring(0, 16);
}
```

Run: `npm test -- generate-content-id.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint

Run: `npm run validate:ts-conversion -- tools/citation-manager/src/core/ContentExtractor/generateContentId.ts`

Expected: All 7 checkpoints PASS

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.2] convert generateContentId to TypeScript"
- Files: test and source .ts files

---

### Task 4.2.2: Convert analyzeEligibility (test + source)

**Files:**
- `test/analyze-eligibility.test.js` → `.ts` (MODIFY)
- `src/core/ContentExtractor/analyzeEligibility.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test to TypeScript

```bash
git mv tools/citation-manager/test/analyze-eligibility.test.js \
       tools/citation-manager/test/analyze-eligibility.test.ts
```

```typescript
// test/analyze-eligibility.test.ts
import { describe, it, expect } from 'vitest';
import { analyzeEligibility } from '../src/core/ContentExtractor/analyzeEligibility';
import type { LinkObject } from '../src/types/citationTypes';
import type { EligibilityAnalysis } from '../src/types/contentExtractorTypes';

describe('analyzeEligibility', () => {
  it('should return eligible for section link with force marker', () => {
    // Given: Link object with section anchor and force marker
    // Fixture: Minimal LinkObject for testing strategy
    const link: LinkObject = {
      rawSourceLink: '[test](file.md#Section) %% force-extract %%',
      linkType: 'markdown',
      scope: 'internal',
      target: {
        path: { raw: 'file.md', absolute: '/abs/file.md', relative: null },
        anchor: 'Section'
      },
      text: 'test',
      fullMatch: /* full match string */,
      line: 1,
      column: 0
    };

    // When: Analyze eligibility with strategy chain
    const result: EligibilityAnalysis = /* analyzeEligibility(link, strategies) */;

    // Then: Link is eligible via ForceMarkerStrategy
    // Verification: Strategy name identifies decision maker
    expect(result.eligible).toBe(true);
    expect(result.strategy).toBe('ForceMarkerStrategy');
  });
});
```

Run: `npm test -- analyze-eligibility.test.ts`
Expected: FAIL (source still .js)

#### Step 2: GREEN - Convert source to TypeScript

```bash
git mv tools/citation-manager/src/core/ContentExtractor/analyzeEligibility.js \
       tools/citation-manager/src/core/ContentExtractor/analyzeEligibility.ts
```

```typescript
// src/core/ContentExtractor/analyzeEligibility.ts
import type { LinkObject } from '../../types/citationTypes';
import type { EligibilityAnalysis } from '../../types/contentExtractorTypes';
import type { ExtractionStrategy } from './eligibilityStrategies/ExtractionStrategy';

/**
 * Analyze link eligibility using strategy chain.
 * Integration: Chains strategies from eligibilityStrategies/ directory.
 *
 * Pattern: Chain of Responsibility - first strategy to decide wins.
 *
 * @param link - Link object to analyze
 * @param strategies - Ordered strategy chain
 * @returns Eligibility decision with reason and strategy name
 */
export function analyzeEligibility(
  link: LinkObject,
  strategies: ExtractionStrategy[]
): EligibilityAnalysis {
  // --- Strategy Chain Execution ---
  // Pattern: Iterate strategies until one makes decision
  for (const strategy of strategies) {
    // Integration: Call strategy.analyze(link)
    const analysis = /* strategy.analyze(link) */;

    // Decision: First non-null decision wins (chain terminates)
    if (analysis.eligible !== null) {
      return analysis;
    }
  }

  // --- Fallback Decision ---
  // Decision: No strategy matched, default to ineligible
  return {
    eligible: false,
    reason: 'No strategy matched',
    strategy: 'default'
  };
}
```

Run: `npm test -- analyze-eligibility.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint

Run: `npm run validate:ts-conversion -- tools/citation-manager/src/core/ContentExtractor/analyzeEligibility.ts`

Expected: All 7 checkpoints PASS

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.2] convert analyzeEligibility to TypeScript"

---

### Task 4.2.3: Convert ExtractionStrategy Interface (test + source)

**Files:**
- `test/extraction-strategy.test.js` → `.ts` (MODIFY)
- `src/core/ContentExtractor/eligibilityStrategies/ExtractionStrategy.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test to TypeScript

```bash
git mv tools/citation-manager/test/extraction-strategy.test.js \
       tools/citation-manager/test/extraction-strategy.test.ts
```

```typescript
// test/extraction-strategy.test.ts
import { describe, it, expect } from 'vitest';
import type { ExtractionStrategy } from '../src/core/ContentExtractor/eligibilityStrategies/ExtractionStrategy';
import type { LinkObject } from '../src/types/citationTypes';
import type { EligibilityAnalysis } from '../src/types/contentExtractorTypes';

describe('ExtractionStrategy', () => {
  it('should define strategy interface contract', () => {
    // Given: Strategy interface exists
    // When: Create implementation
    const strategy: ExtractionStrategy = {
      analyze(link: LinkObject): EligibilityAnalysis {
        return {
          eligible: true,
          reason: 'Test strategy',
          strategy: 'TestStrategy'
        };
      }
    };

    // Then: Implementation satisfies interface
    // Verification: TypeScript compiles without errors
    expect(strategy.analyze).toBeDefined();
  });
});
```

Run: `npm test -- extraction-strategy.test.ts`
Expected: FAIL

#### Step 2: GREEN - Convert source to TypeScript

```bash
git mv tools/citation-manager/src/core/ContentExtractor/eligibilityStrategies/ExtractionStrategy.js \
       tools/citation-manager/src/core/ContentExtractor/eligibilityStrategies/ExtractionStrategy.ts
```

```typescript
// src/core/ContentExtractor/eligibilityStrategies/ExtractionStrategy.ts
import type { LinkObject } from '../../../types/citationTypes';
import type { EligibilityAnalysis } from '../../../types/contentExtractorTypes';

/**
 * Extraction strategy interface for eligibility analysis.
 * Pattern: Strategy pattern for pluggable decision logic.
 *
 * Integration: Implemented by CliFlagStrategy, ForceMarkerStrategy, etc.
 */
export interface ExtractionStrategy {
  /**
   * Analyze link eligibility.
   *
   * @param link - Link object to analyze
   * @returns Eligibility decision or null if strategy doesn't apply
   */
  analyze(link: LinkObject): EligibilityAnalysis | null;
}
```

Run: `npm test -- extraction-strategy.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint

Run: `npm run validate:ts-conversion -- tools/citation-manager/src/core/ContentExtractor/eligibilityStrategies/ExtractionStrategy.ts`

Expected: All 7 checkpoints PASS

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.2] convert ExtractionStrategy interface to TypeScript"

---

### Task 4.2.4: Convert CliFlagStrategy (test + source)

**Files:**
- `test/cli-flag-strategy.test.js` → `.ts` (MODIFY)
- `src/core/ContentExtractor/eligibilityStrategies/CliFlagStrategy.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test to TypeScript

```bash
git mv test/cli-flag-strategy.test.js test/cli-flag-strategy.test.ts
```

```typescript
// test/cli-flag-strategy.test.ts
import { describe, it, expect } from 'vitest';
import { CliFlagStrategy } from '../src/core/ContentExtractor/eligibilityStrategies/CliFlagStrategy';
import type { LinkObject } from '../src/types/citationTypes';

describe('CliFlagStrategy', () => {
  it('should make all links eligible when includeAll flag is true', () => {
    // Given: Strategy with includeAll flag enabled
    const strategy = new CliFlagStrategy({ includeAll: true });

    // Fixture: Any link object
    const link: LinkObject = /* minimal link object */;

    // When: Analyze eligibility
    const result = strategy.analyze(link);

    // Then: Link is eligible via CLI flag
    // Verification: Strategy name identifies CLI override
    expect(result?.eligible).toBe(true);
    expect(result?.strategy).toBe('CliFlagStrategy');
  });
});
```

Run: `npm test -- cli-flag-strategy.test.ts`
Expected: FAIL

#### Step 2: GREEN - Convert source to TypeScript

```bash
git mv src/core/ContentExtractor/eligibilityStrategies/CliFlagStrategy.js \
       src/core/ContentExtractor/eligibilityStrategies/CliFlagStrategy.ts
```

```typescript
// src/core/ContentExtractor/eligibilityStrategies/CliFlagStrategy.ts
import type { ExtractionStrategy } from './ExtractionStrategy';
import type { LinkObject } from '../../../types/citationTypes';
import type { EligibilityAnalysis } from '../../../types/contentExtractorTypes';

/**
 * CLI flag options for strategy configuration.
 */
interface CliFlagOptions {
  includeAll: boolean;
}

/**
 * Strategy that makes all links eligible when CLI flag is set.
 * Pattern: Highest priority strategy in chain (overrides all others).
 *
 * Integration: Configured by CLI --include-all flag.
 */
export class CliFlagStrategy implements ExtractionStrategy {
  private options: CliFlagOptions;

  constructor(options: CliFlagOptions) {
    this.options = options;
  }

  /**
   * Analyze eligibility based on CLI flag.
   * Decision: includeAll flag overrides all other strategies.
   *
   * @param link - Link object (unused, all links eligible)
   * @returns Eligible if flag set, null otherwise
   */
  analyze(link: LinkObject): EligibilityAnalysis | null {
    // Decision: CLI flag takes precedence over all other strategies
    if (this.options.includeAll) {
      return {
        eligible: true,
        reason: 'CLI flag --include-all set',
        strategy: 'CliFlagStrategy'
      };
    }

    // Decision: Null means this strategy doesn't apply
    return null;
  }
}
```

Run: `npm test -- cli-flag-strategy.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint

Run: `npm run validate:ts-conversion -- tools/citation-manager/src/core/ContentExtractor/eligibilityStrategies/CliFlagStrategy.ts`

Expected: All 7 checkpoints PASS

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.2] convert CliFlagStrategy to TypeScript"

---

### Task 4.2.5: Convert ForceMarkerStrategy (test + source)

**Files:**
- `test/force-marker-strategy.test.js` → `.ts` (MODIFY)
- `src/core/ContentExtractor/eligibilityStrategies/ForceMarkerStrategy.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test to TypeScript

```bash
git mv test/force-marker-strategy.test.js test/force-marker-strategy.test.ts
```

```typescript
// test/force-marker-strategy.test.ts
import { describe, it, expect } from 'vitest';
import { ForceMarkerStrategy } from '../src/core/ContentExtractor/eligibilityStrategies/ForceMarkerStrategy';
import type { LinkObject } from '../src/types/citationTypes';

describe('ForceMarkerStrategy', () => {
  it('should make links eligible when force-extract marker present', () => {
    // Given: Link with force-extract marker
    const link: LinkObject = {
      rawSourceLink: '[test](file.md) %% force-extract %%',
      /* other required properties */
    };

    // When: Analyze with force marker strategy
    const strategy = new ForceMarkerStrategy();
    const result = strategy.analyze(link);

    // Then: Link is eligible via force marker
    expect(result?.eligible).toBe(true);
    expect(result?.reason).toContain('force-extract');
  });
});
```

Run: `npm test -- force-marker-strategy.test.ts`
Expected: FAIL

#### Step 2: GREEN - Convert source to TypeScript

```bash
git mv src/core/ContentExtractor/eligibilityStrategies/ForceMarkerStrategy.js \
       src/core/ContentExtractor/eligibilityStrategies/ForceMarkerStrategy.ts
```

```typescript
// src/core/ContentExtractor/eligibilityStrategies/ForceMarkerStrategy.ts
import type { ExtractionStrategy } from './ExtractionStrategy';
import type { LinkObject } from '../../../types/citationTypes';
import type { EligibilityAnalysis } from '../../../types/contentExtractorTypes';

/**
 * Strategy that checks for %% force-extract %% marker.
 * Pattern: Explicit opt-in via markdown comment marker.
 */
export class ForceMarkerStrategy implements ExtractionStrategy {
  /**
   * Analyze eligibility based on force-extract marker.
   *
   * @param link - Link object to check for marker
   * @returns Eligible if marker found, null otherwise
   */
  analyze(link: LinkObject): EligibilityAnalysis | null {
    // Pattern: Regex search for %% force-extract %% in raw source
    const hasMarker = /* check link.rawSourceLink contains marker */;

    // Decision: Force marker overrides normal eligibility rules
    if (hasMarker) {
      return {
        eligible: true,
        reason: 'Force extract marker present',
        strategy: 'ForceMarkerStrategy'
      };
    }

    return null;
  }
}
```

Run: `npm test -- force-marker-strategy.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint

Run: `npm run validate:ts-conversion`

Expected: All checkpoints PASS

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.2] convert ForceMarkerStrategy to TypeScript"

---

### Task 4.2.6: Convert SectionLinkStrategy (test + source)

**Files:**
- `test/section-link-strategy.test.js` → `.ts` (MODIFY)
- `src/core/ContentExtractor/eligibilityStrategies/SectionLinkStrategy.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test to TypeScript

```bash
git mv test/section-link-strategy.test.js test/section-link-strategy.test.ts
```

```typescript
// test/section-link-strategy.test.ts
import { describe, it, expect } from 'vitest';
import { SectionLinkStrategy } from '../src/core/ContentExtractor/eligibilityStrategies/SectionLinkStrategy';
import type { LinkObject } from '../src/types/citationTypes';

describe('SectionLinkStrategy', () => {
  it('should make links eligible when anchor is section heading', () => {
    // Given: Link with section anchor (not block)
    const link: LinkObject = {
      target: {
        path: { /* path details */ },
        anchor: 'Section Heading'  // Not starting with ^
      },
      /* other properties */
    };

    // When: Analyze with section link strategy
    const strategy = new SectionLinkStrategy();
    const result = strategy.analyze(link);

    // Then: Section link is eligible
    expect(result?.eligible).toBe(true);
    expect(result?.strategy).toBe('SectionLinkStrategy');
  });
});
```

Run: `npm test -- section-link-strategy.test.ts`
Expected: FAIL

#### Step 2: GREEN - Convert source to TypeScript

```bash
git mv src/core/ContentExtractor/eligibilityStrategies/SectionLinkStrategy.js \
       src/core/ContentExtractor/eligibilityStrategies/SectionLinkStrategy.ts
```

```typescript
// src/core/ContentExtractor/eligibilityStrategies/SectionLinkStrategy.ts
import type { ExtractionStrategy } from './ExtractionStrategy';
import type { LinkObject } from '../../../types/citationTypes';
import type { EligibilityAnalysis } from '../../../types/contentExtractorTypes';

/**
 * Strategy that makes section links eligible.
 * Pattern: Checks for heading anchor (not block reference).
 */
export class SectionLinkStrategy implements ExtractionStrategy {
  /**
   * Analyze eligibility for section links.
   * Decision: Section anchors (not starting with ^) are eligible.
   *
   * @param link - Link object to analyze
   * @returns Eligible if section link, null otherwise
   */
  analyze(link: LinkObject): EligibilityAnalysis | null {
    // Decision: Only links with anchors are candidates
    if (!link.target.anchor) {
      return null;
    }

    // Pattern: Block references start with ^, sections don't
    const isBlockReference = /* check if anchor starts with ^ */;

    // Decision: Section links eligible, block links not
    if (!isBlockReference) {
      return {
        eligible: true,
        reason: 'Section link with heading anchor',
        strategy: 'SectionLinkStrategy'
      };
    }

    return null;
  }
}
```

Run: `npm test -- section-link-strategy.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint

Run: `npm run validate:ts-conversion`

Expected: All checkpoints PASS

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.2] convert SectionLinkStrategy to TypeScript"

---

### Task 4.2.7: Convert StopMarkerStrategy (test + source)

**Files:**
- `test/stop-marker-strategy.test.js` → `.ts` (MODIFY)
- `src/core/ContentExtractor/eligibilityStrategies/StopMarkerStrategy.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test to TypeScript

```bash
git mv test/stop-marker-strategy.test.js test/stop-marker-strategy.test.ts
```

```typescript
// test/stop-marker-strategy.test.ts
import { describe, it, expect } from 'vitest';
import { StopMarkerStrategy } from '../src/core/ContentExtractor/eligibilityStrategies/StopMarkerStrategy';
import type { LinkObject } from '../src/types/citationTypes';

describe('StopMarkerStrategy', () => {
  it('should make links ineligible when stop-extract marker present', () => {
    // Given: Link with stop-extract marker
    const link: LinkObject = {
      rawSourceLink: '[test](file.md) %% stop-extract %%',
      /* other properties */
    };

    // When: Analyze with stop marker strategy
    const strategy = new StopMarkerStrategy();
    const result = strategy.analyze(link);

    // Then: Link is explicitly ineligible
    // Verification: Strategy returns decision (not null)
    expect(result?.eligible).toBe(false);
    expect(result?.reason).toContain('stop-extract');
  });
});
```

Run: `npm test -- stop-marker-strategy.test.ts`
Expected: FAIL

#### Step 2: GREEN - Convert source to TypeScript

```bash
git mv src/core/ContentExtractor/eligibilityStrategies/StopMarkerStrategy.js \
       src/core/ContentExtractor/eligibilityStrategies/StopMarkerStrategy.ts
```

```typescript
// src/core/ContentExtractor/eligibilityStrategies/StopMarkerStrategy.ts
import type { ExtractionStrategy } from './ExtractionStrategy';
import type { LinkObject } from '../../../types/citationTypes';
import type { EligibilityAnalysis } from '../../../types/contentExtractorTypes';

/**
 * Strategy that checks for %% stop-extract %% marker.
 * Pattern: Explicit opt-out via markdown comment marker.
 */
export class StopMarkerStrategy implements ExtractionStrategy {
  /**
   * Analyze eligibility based on stop-extract marker.
   * Decision: Stop marker prevents extraction regardless of other strategies.
   *
   * @param link - Link object to check for marker
   * @returns Ineligible if marker found, null otherwise
   */
  analyze(link: LinkObject): EligibilityAnalysis | null {
    // Pattern: Regex search for %% stop-extract %% in raw source
    const hasStopMarker = /* check link.rawSourceLink contains stop marker */;

    // Decision: Stop marker explicitly prevents extraction
    if (hasStopMarker) {
      return {
        eligible: false,
        reason: 'Stop extract marker present',
        strategy: 'StopMarkerStrategy'
      };
    }

    return null;
  }
}
```

Run: `npm test -- stop-marker-strategy.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint

Run: `npm run validate:ts-conversion`

Expected: All checkpoints PASS

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.2] convert StopMarkerStrategy to TypeScript"

---

### Task 4.2.8: Convert ContentExtractor (test + source)

**Files:**
- `test/content-extractor.test.js` → `.ts` (MODIFY)
- `src/core/ContentExtractor/ContentExtractor.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test to TypeScript

```bash
git mv test/content-extractor.test.js test/content-extractor.test.ts
```

```typescript
// test/content-extractor.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ContentExtractor } from '../src/core/ContentExtractor/ContentExtractor';
import type { LinkObject } from '../src/types/citationTypes';
import type { ExtractedContent } from '../src/types/contentExtractorTypes';

describe('ContentExtractor', () => {
  let extractor: ContentExtractor;

  beforeEach(() => {
    // Integration: Real components with DI (no mocks)
    extractor = /* new ContentExtractor(parser, cache, strategies) */;
  });

  it('should extract content for eligible links', () => {
    // Given: Link object eligible for extraction
    const link: LinkObject = /* eligible link fixture */;

    // When: Extract content
    const result: ExtractedContent | null = /* extractor.extract(link) */;

    // Then: Content extracted with contentId
    // Verification: Result has required properties
    expect(result).toBeDefined();
    expect(result?.contentId).toHaveLength(16);
    expect(result?.content).toBeTruthy();
  });
});
```

Run: `npm test -- content-extractor.test.ts`
Expected: FAIL

#### Step 2: GREEN - Convert source to TypeScript

```bash
git mv src/core/ContentExtractor/ContentExtractor.js \
       src/core/ContentExtractor/ContentExtractor.ts
```

```typescript
// src/core/ContentExtractor/ContentExtractor.ts
import type { LinkObject } from '../../types/citationTypes';
import type { ExtractedContent } from '../../types/contentExtractorTypes';
import type { ExtractionStrategy } from './eligibilityStrategies/ExtractionStrategy';
import type { MarkdownParser } from '../../MarkdownParser';
import type { ParsedFileCache } from '../../ParsedFileCache';

/**
 * Content extractor for citation targets.
 * Integration: Uses MarkdownParser and ParsedFileCache for content access.
 *
 * Pattern: Strategy pattern for eligibility, template method for extraction.
 */
export class ContentExtractor {
  private parser: MarkdownParser;
  private cache: ParsedFileCache;
  private strategies: ExtractionStrategy[];

  /**
   * Create content extractor.
   *
   * @param parser - Markdown parser for content parsing
   * @param cache - File cache for target file lookup
   * @param strategies - Ordered eligibility strategies
   */
  constructor(
    parser: MarkdownParser,
    cache: ParsedFileCache,
    strategies: ExtractionStrategy[]
  ) {
    this.parser = parser;
    this.cache = cache;
    this.strategies = strategies;
  }

  /**
   * Extract content for link if eligible.
   * Integration: Chains eligibility → resolution → extraction.
   *
   * @param link - Link object to extract content for
   * @returns Extracted content or null if ineligible/not found
   */
  extract(link: LinkObject): ExtractedContent | null {
    // --- Eligibility Check ---
    // Integration: Use analyzeEligibility with strategy chain
    const eligibility = /* analyzeEligibility(link, this.strategies) */;

    // Decision: Skip ineligible links
    if (!eligibility.eligible) {
      return null;
    }

    // --- Target Resolution ---
    // Integration: Use cache to resolve target file
    const targetPath = /* resolve link.target.path via cache */;

    // Decision: Skip if target not found
    if (!targetPath) {
      return null;
    }

    // --- Content Extraction ---
    // Integration: Parse target file, extract section/block
    const parsedDoc = /* parser.parse(targetPath) */;
    const content = /* extract content based on anchor type */;

    // Decision: Skip if content extraction fails
    if (!content) {
      return null;
    }

    // --- Result Construction ---
    // Integration: Generate contentId via generateContentId
    const contentId = /* generateContentId(content) */;

    return {
      contentId,
      content,
      sourceLinks: [{
        rawSourceLink: link.rawSourceLink,
        sourceLine: link.line
      }]
    };
  }
}
```

Run: `npm test -- content-extractor.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint

Run: `npm run validate:ts-conversion`

Expected: All checkpoints PASS

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.2] convert ContentExtractor class to TypeScript"

---

### Task 4.2.9: Convert extractLinksContent (test + source)

**Files:**
- `test/extract-links-content.test.js` → `.ts` (MODIFY)
- `src/core/ContentExtractor/extractLinksContent.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test to TypeScript

```bash
git mv test/extract-links-content.test.js test/extract-links-content.test.ts
```

```typescript
// test/extract-links-content.test.ts
import { describe, it, expect } from 'vitest';
import { extractLinksContent } from '../src/core/ContentExtractor/extractLinksContent';
import type { LinkObject } from '../src/types/citationTypes';
import type { OutgoingLinksExtractedContent } from '../src/types/contentExtractorTypes';

describe('extractLinksContent', () => {
  it('should deduplicate content by contentId', () => {
    // Given: Two links pointing to same content
    const links: LinkObject[] = /* two links with same target */;

    // When: Extract content from links
    const result: OutgoingLinksExtractedContent = /* extractLinksContent(links, extractor) */;

    // Then: Single content block with multiple source links
    // Verification: Deduplication by contentId
    const contentIds = /* Object.keys(result.extractedContentBlocks) */;
    expect(contentIds).toHaveLength(1);

    const content = /* result.extractedContentBlocks[contentIds[0]] */;
    expect(content.sourceLinks).toHaveLength(2);
  });
});
```

Run: `npm test -- extract-links-content.test.ts`
Expected: FAIL

#### Step 2: GREEN - Convert source to TypeScript

```bash
git mv src/core/ContentExtractor/extractLinksContent.js \
       src/core/ContentExtractor/extractLinksContent.ts
```

```typescript
// src/core/ContentExtractor/extractLinksContent.ts
import type { LinkObject } from '../../types/citationTypes';
import type { OutgoingLinksExtractedContent, ExtractedContent } from '../../types/contentExtractorTypes';
import type { ContentExtractor } from './ContentExtractor';

/**
 * Extract and deduplicate content from links.
 * Integration: Uses ContentExtractor for individual link extraction.
 *
 * Pattern: Aggregation with deduplication by contentId.
 *
 * @param links - Array of link objects to extract content from
 * @param extractor - Content extractor instance
 * @returns Deduplicated content blocks with source link tracking
 */
export function extractLinksContent(
  links: LinkObject[],
  extractor: ContentExtractor
): OutgoingLinksExtractedContent {
  // --- Content Extraction & Deduplication ---
  // Pattern: Aggregate by contentId, merge source links
  const contentBlocks: Record<string, ExtractedContent> = {};
  let totalLength = 0;

  // Integration: Extract content for each link via extractor
  for (const link of links) {
    const extracted = /* extractor.extract(link) */;

    // Decision: Skip null results (ineligible or not found)
    if (!extracted) {
      continue;
    }

    // --- Deduplication Logic ---
    // Pattern: Merge source links for duplicate contentIds
    if (contentBlocks[extracted.contentId]) {
      // Decision: Append source link to existing content block
      /* contentBlocks[extracted.contentId].sourceLinks.push(...) */;
    } else {
      // Decision: New content block
      contentBlocks[extracted.contentId] = extracted;
      totalLength += /* extracted.content.length */;
    }
  }

  // --- Result Construction ---
  return {
    extractedContentBlocks: contentBlocks,
    _totalContentCharacterLength: totalLength
  };
}
```

Run: `npm test -- extract-links-content.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint

Run: `npm run validate:ts-conversion`

Expected: All checkpoints PASS

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.2] convert extractLinksContent to TypeScript"

---

### Task 4.2.10: Validate ContentExtractor Module

**Files:**
- None (validation task)

#### Step 1: Run validation checkpoint for all ContentExtractor files

Run: `npm run validate:ts-conversion -- "tools/citation-manager/src/core/ContentExtractor/**/*.ts"`

Expected: All 11 files pass all 7 checkpoints

#### Step 2: Verify 304 tests pass

Run: `npm test`

Expected: 304/304 tests PASS

#### Step 3: Verify CLI executes

Run: `npm run citation:validate -- design-docs/ARCHITECTURE.md`

Expected: CLI executes successfully, validation completes

#### Step 4: Commit module completion

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.2] complete ContentExtractor module TypeScript conversion (11 files)"

---

### Task 4.2.11: Code Review Story 4.2

**Files:**
- None (review task)

#### Step 1: Request code-reviewer for ContentExtractor module

Use `requesting-code-review` skill with:
- WHAT_WAS_IMPLEMENTED: ContentExtractor module TypeScript conversion (11 files)
- PLAN_OR_REQUIREMENTS: Epic 4 Story 4.2
- BASE_SHA: Commit before Story 4.2 started
- HEAD_SHA: Current commit (Story 4.2 complete)
- DESCRIPTION: "Converted ContentExtractor module to TypeScript using test-first pattern"

#### Step 2: Review code-reviewer feedback

Examine:
- Strengths identified
- Issues (Critical/Important/Minor)
- Overall assessment

#### Step 3: Address Critical and Important issues

If issues found:
- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for future improvement

#### Step 4: Final commit

Use `create-git-commit` skill to commit fixes:
- Message: "refactor(typescript): [Epic 4.2] address code review feedback for ContentExtractor"

---

## Story 4.3: Core Components Conversion

### Task 4.3.1: Convert MarkdownParser (test + source)

**Files:**
- `test/markdown-parser.test.js` → `.ts` (MODIFY)
- `src/MarkdownParser.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test to TypeScript

```bash
git mv test/markdown-parser.test.js test/markdown-parser.test.ts
```

```typescript
// test/markdown-parser.test.ts
import { describe, it, expect } from 'vitest';
import { MarkdownParser } from '../src/MarkdownParser';

describe('MarkdownParser', () => {
  it('should parse markdown file and return ParsedDocument', () => {
    // Given: Markdown file path
    // Fixture: Real markdown file in test/fixtures/
    const filePath: string = /* resolve fixture path */;

    // When: Parse file
    const parser = new MarkdownParser();
    const result = /* parser.parse(filePath) */;

    // Then: ParsedDocument with tokens and anchors
    // Verification: Result has required properties
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('tokens');
    expect(result).toHaveProperty('anchors');
  });
});
```

Run: `npm test -- markdown-parser.test.ts`
Expected: FAIL

#### Step 2: GREEN - Convert source to TypeScript

```bash
git mv src/MarkdownParser.js src/MarkdownParser.ts
```

```typescript
// src/MarkdownParser.ts
import { marked } from 'marked';
import { readFileSync } from 'node:fs';

/**
 * Parsed markdown anchor metadata.
 */
interface Anchor {
  id: string;
  anchorType: 'heading' | 'block';
  line: number;
  text?: string;
}

/**
 * Markdown parser using marked.js.
 * Integration: Uses marked.js for markdown tokenization.
 *
 * Boundary: Reads files from file system.
 */
export class MarkdownParser {
  /**
   * Parse markdown file to structured representation.
   * Integration: marked.js lexer for tokenization.
   *
   * @param filePath - Absolute path to markdown file
   * @returns Parsed document with content, tokens, and anchors
   */
  parse(filePath: string): {
    content: string;
    tokens: marked.Token[];
    anchors: Anchor[];
  } {
    // --- File Reading ---
    // Boundary: Read markdown content from disk
    const content = readFileSync(filePath, 'utf8');

    // --- Tokenization ---
    // Integration: marked.js lexer parses markdown to token tree
    const tokens = /* marked.lexer(content) */;

    // --- Anchor Extraction ---
    // Pattern: Walk token tree, extract heading and block anchors
    const anchors: Anchor[] = /* extract anchors from tokens */;

    return {
      content,
      tokens,
      anchors
    };
  }
}
```

Run: `npm test -- markdown-parser.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint

Run: `npm run validate:ts-conversion -- tools/citation-manager/src/MarkdownParser.ts`

Expected: All 7 checkpoints PASS

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.3] convert MarkdownParser to TypeScript"

---

### Task 4.3.2: Convert FileCache (test + source)

**Files:**
- `test/file-cache.test.js` → `.ts` (MODIFY)
- `src/FileCache.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test to TypeScript

```bash
git mv test/file-cache.test.js test/file-cache.test.ts
```

```typescript
// test/file-cache.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { FileCache } from '../src/FileCache';
import type { ResolutionResult } from '../src/types/validationTypes';

describe('FileCache', () => {
  let cache: FileCache;

  beforeEach(() => {
    // Given: File cache with scope directory
    // Fixture: Use test/fixtures/ as scope
    const scopeDir: string = /* resolve fixtures directory */;
    cache = new FileCache(scopeDir);
  });

  it('should resolve existing files by partial path', () => {
    // Given: Partial path to file in scope
    const partialPath: string = 'test-file.md';

    // When: Resolve file
    const result: ResolutionResult = cache.resolve(partialPath);

    // Then: File found with absolute path
    // Verification: Discriminated union narrows to found state
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.path).toContain('test-file.md');
    }
  });
});
```

Run: `npm test -- file-cache.test.ts`
Expected: FAIL

#### Step 2: GREEN - Convert source to TypeScript

```bash
git mv src/FileCache.js src/FileCache.ts
```

```typescript
// src/FileCache.ts
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { ResolutionResult } from './types/validationTypes';

/**
 * File cache for fast path resolution within scope directory.
 * Boundary: Reads file system on initialization, caches paths.
 *
 * Pattern: In-memory cache with lazy initialization.
 */
export class FileCache {
  private scopeDirectory: string;
  private fileMap: Map<string, string[]>;

  /**
   * Create file cache for scope directory.
   * Boundary: Scans directory tree on construction.
   *
   * @param scopeDirectory - Root directory to cache
   */
  constructor(scopeDirectory: string) {
    this.scopeDirectory = scopeDirectory;
    this.fileMap = new Map();

    // --- Cache Initialization ---
    // Boundary: Recursive directory scan
    this.buildCache(scopeDirectory);
  }

  /**
   * Resolve partial path to absolute path.
   * Pattern: Lookup in pre-built cache, handle duplicates.
   *
   * @param partialPath - Partial file path to resolve
   * @returns Resolution result with found path or error reason
   */
  resolve(partialPath: string): ResolutionResult {
    // --- Cache Lookup ---
    // Pattern: Map lookup by partial path
    const candidates = /* this.fileMap.get(partialPath) */;

    // Decision: Return not_found if no matches
    if (!candidates || candidates.length === 0) {
      return {
        found: false,
        path: null,
        reason: 'not_found'
      };
    }

    // Decision: Return duplicate if multiple matches
    if (candidates.length > 1) {
      return {
        found: false,
        path: null,
        reason: 'duplicate',
        candidates
      };
    }

    // Decision: Return direct match for single candidate
    return {
      found: true,
      path: candidates[0],
      reason: 'cache'
    };
  }

  /**
   * Build file path cache recursively.
   * Boundary: Recursive file system traversal.
   *
   * @param directory - Directory to scan
   */
  private buildCache(directory: string): void {
    // Boundary: Read directory entries
    const entries = /* readdirSync(directory) */;

    for (const entry of entries) {
      const fullPath = join(directory, entry);

      // Boundary: Check if directory
      const stats = /* statSync(fullPath) */;

      if (stats.isDirectory()) {
        // Pattern: Recursive directory traversal
        this.buildCache(fullPath);
      } else {
        // Pattern: Store by filename for quick lookup
        /* this.fileMap.set(entry, [fullPath]) or append if exists */;
      }
    }
  }
}
```

Run: `npm test -- file-cache.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint

Run: `npm run validate:ts-conversion -- tools/citation-manager/src/FileCache.ts`

Expected: All 7 checkpoints PASS

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.3] convert FileCache to TypeScript"

---

### Task 4.3.3: Convert ParsedDocument (test + source)

**Files:**
- `test/parsed-document.test.js` → `.ts` (MODIFY)
- `src/ParsedDocument.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test to TypeScript

```bash
git mv test/parsed-document.test.js test/parsed-document.test.ts
```

```typescript
// test/parsed-document.test.ts
import { describe, it, expect } from 'vitest';
import { ParsedDocument } from '../src/ParsedDocument';
import type { marked } from 'marked';

describe('ParsedDocument', () => {
  it('should extract section content by heading', () => {
    // Given: Parsed document with sections
    // Fixture: Mock parsed data with tokens and anchors
    const data = {
      content: /* markdown content string */,
      tokens: /* marked.Token[] */,
      anchors: /* Anchor[] */
    };

    const doc = new ParsedDocument(data);

    // When: Extract section by heading
    const content: string | null = doc.extractSection('Section Heading', 2);

    // Then: Section content extracted
    expect(content).toBeTruthy();
    expect(content).toContain('Section Heading');
  });
});
```

Run: `npm test -- parsed-document.test.ts`
Expected: FAIL

#### Step 2: GREEN - Convert source to TypeScript

```bash
git mv src/ParsedDocument.js src/ParsedDocument.ts
```

```typescript
// src/ParsedDocument.ts
import type { marked } from 'marked';

/**
 * Parsed markdown anchor.
 */
interface Anchor {
  id: string;
  anchorType: 'heading' | 'block';
  line: number;
  text?: string;
}

/**
 * Parsed document data structure.
 */
interface ParsedDocumentData {
  content: string;
  tokens: marked.Token[];
  anchors: Anchor[];
}

/**
 * Parsed markdown document with content extraction methods.
 * Integration: Operates on MarkdownParser output.
 */
export class ParsedDocument {
  private _data: ParsedDocumentData;

  /**
   * Create parsed document wrapper.
   *
   * @param data - Parsed document data from MarkdownParser
   */
  constructor(data: ParsedDocumentData) {
    this._data = data;
  }

  /**
   * Extract content for section by heading.
   * Integration: Walks marked.js token tree to find section boundaries.
   *
   * @param headingText - Heading text to find
   * @param headingLevel - Heading level (1-6)
   * @returns Section content or null if not found
   */
  extractSection(headingText: string, headingLevel: number): string | null {
    // --- Target Heading Lookup ---
    // Integration: Find heading token in token tree
    const targetIndex = /* find token index matching heading */;

    // Decision: Return null if heading not found
    if (targetIndex === -1) {
      return null;
    }

    // --- Section Boundary Detection ---
    // Pattern: Collect tokens until next same-level heading
    const endIndex = /* find next heading at same or higher level */;

    // --- Content Reconstruction ---
    // Pattern: Reconstruct markdown from token range
    const sectionTokens = /* slice tokens[targetIndex:endIndex] */;
    const content = /* reconstruct markdown from tokens */;

    return content;
  }

  /**
   * Extract content for block reference.
   *
   * @param anchorId - Block anchor ID (without ^ prefix)
   * @returns Single line content or null if not found
   */
  extractBlock(anchorId: string): string | null {
    // --- Anchor Lookup ---
    // Integration: Query anchors array from parser output
    const anchor = this._data.anchors.find(a =>
      a.anchorType === 'block' && a.id === anchorId
    );

    // Decision: Return null if block not found
    if (!anchor) {
      return null;
    }

    // --- Line Extraction ---
    // Boundary: Split content into lines
    const lines = this._data.content.split('\n');
    const lineIndex = anchor.line - 1;  // Pattern: 1-based to 0-based

    // Decision: Validate line index
    if (lineIndex < 0 || lineIndex >= lines.length) {
      return null;
    }

    return lines[lineIndex];
  }
}
```

Run: `npm test -- parsed-document.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint and verify module complete

Run: `npm run validate:ts-conversion -- "tools/citation-manager/src/{MarkdownParser,FileCache,ParsedDocument}.ts"`

Expected: All 3 files pass all 7 checkpoints

Run: `npm test`

Expected: 304/304 tests PASS

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.3] convert ParsedDocument to TypeScript - Core Components complete"

---

### Task 4.3.4: Code Review Story 4.3

**Files:**
- None (review task)

#### Step 1: Request code-reviewer for Core Components

Use `requesting-code-review` skill with:
- WHAT_WAS_IMPLEMENTED: Core Components TypeScript conversion (3 files: MarkdownParser, FileCache, ParsedDocument)
- PLAN_OR_REQUIREMENTS: Epic 4 Story 4.3
- BASE_SHA: Commit before Story 4.3 started
- HEAD_SHA: Current commit
- DESCRIPTION: "Converted Core Components to TypeScript using test-first pattern"

#### Step 2: Address feedback

Follow same process as Task 4.2.11:
- Review strengths and issues
- Fix Critical and Important issues
- Note Minor issues

#### Step 3: Final commit

Use `create-git-commit` skill to commit:
- Message: "refactor(typescript): [Epic 4.3] address code review feedback for Core Components"

---

## Story 4.4: Integration Layer Conversion

### Task 4.4.1: Convert ParsedFileCache (test + source)

**Files:**
- `test/parsed-file-cache.test.js` → `.ts` (MODIFY)
- `src/ParsedFileCache.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test to TypeScript

```bash
git mv test/parsed-file-cache.test.js test/parsed-file-cache.test.ts
```

```typescript
// test/parsed-file-cache.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ParsedFileCache } from '../src/ParsedFileCache';
import { MarkdownParser } from '../src/MarkdownParser';
import { ParsedDocument } from '../src/ParsedDocument';

describe('ParsedFileCache', () => {
  let cache: ParsedFileCache;

  beforeEach(() => {
    // Integration: Real MarkdownParser (no mocks)
    const parser = new MarkdownParser();
    cache = new ParsedFileCache(parser);
  });

  it('should cache parsed documents by file path', () => {
    // Given: File path to parse
    // Fixture: Real markdown file
    const filePath: string = /* resolve fixture path */;

    // When: Get parsed document twice
    const doc1: ParsedDocument = cache.get(filePath);
    const doc2: ParsedDocument = cache.get(filePath);

    // Then: Same instance returned (cached)
    // Verification: Object identity check
    expect(doc1).toBe(doc2);
  });
});
```

Run: `npm test -- parsed-file-cache.test.ts`
Expected: FAIL

#### Step 2: GREEN - Convert source to TypeScript

```bash
git mv src/ParsedFileCache.js src/ParsedFileCache.ts
```

```typescript
// src/ParsedFileCache.ts
import type { MarkdownParser } from './MarkdownParser';
import { ParsedDocument } from './ParsedDocument';

/**
 * Cache for parsed markdown documents.
 * Integration: Uses MarkdownParser for parsing, caches ParsedDocument instances.
 *
 * Pattern: Lazy initialization cache with Map storage.
 */
export class ParsedFileCache {
  private parser: MarkdownParser;
  private cache: Map<string, ParsedDocument>;

  /**
   * Create parsed file cache.
   *
   * @param parser - Markdown parser instance
   */
  constructor(parser: MarkdownParser) {
    this.parser = parser;
    this.cache = new Map();
  }

  /**
   * Get parsed document for file path (cached).
   * Pattern: Lazy cache initialization on first access.
   *
   * @param filePath - Absolute file path
   * @returns ParsedDocument instance
   */
  get(filePath: string): ParsedDocument {
    // --- Cache Lookup ---
    // Pattern: Check cache first
    if (this.cache.has(filePath)) {
      return /* this.cache.get(filePath)! */;
    }

    // --- Parse & Cache ---
    // Integration: Use MarkdownParser to parse file
    const data = /* this.parser.parse(filePath) */;
    const doc = new ParsedDocument(data);

    // Pattern: Store in cache for future requests
    this.cache.set(filePath, doc);

    return doc;
  }

  /**
   * Clear cache (useful for testing).
   */
  clear(): void {
    this.cache.clear();
  }
}
```

Run: `npm test -- parsed-file-cache.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint

Run: `npm run validate:ts-conversion -- tools/citation-manager/src/ParsedFileCache.ts`

Expected: All 7 checkpoints PASS

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.4] convert ParsedFileCache to TypeScript"

---

### Task 4.4.2: Convert CitationValidator (test + source)

**Files:**
- `test/citation-validator.test.js` → `.ts` (MODIFY)
- `src/CitationValidator.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test to TypeScript

```bash
git mv test/citation-validator.test.js test/citation-validator.test.ts
```

```typescript
// test/citation-validator.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { CitationValidator } from '../src/CitationValidator';
import type { FileValidationSummary } from '../src/types/validationTypes';

describe('CitationValidator', () => {
  let validator: CitationValidator;

  beforeEach(() => {
    // Integration: Real components (no mocks)
    // Research: DI setup for validator dependencies
    validator = /* new CitationValidator(cache, linkResolver) */;
  });

  it('should validate file and return summary with enriched links', async () => {
    // Given: File with citations
    // Fixture: Real markdown file with mixed valid/invalid citations
    const filePath: string = /* resolve fixture path */;

    // When: Validate file
    const result: FileValidationSummary = await validator.validateFile(filePath);

    // Then: Summary with enriched link validation
    // Verification: New contract with summary + links (not separate results)
    expect(result).toHaveProperty('filePath');
    expect(result).toHaveProperty('totalCitations');
    expect(result).toHaveProperty('results');
  });
});
```

Run: `npm test -- citation-validator.test.ts`
Expected: FAIL

#### Step 2: GREEN - Convert source to TypeScript

```bash
git mv src/CitationValidator.js src/CitationValidator.ts
```

```typescript
// src/CitationValidator.ts
import type { ParsedFileCache } from './ParsedFileCache';
import type { LinkObject } from './types/citationTypes';
import type { FileValidationSummary, CitationValidationResult } from './types/validationTypes';

/**
 * Citation validator with enrichment pattern.
 * Integration: Uses ParsedFileCache for target resolution.
 *
 * Pattern: Enrichment pattern - adds validation metadata to LinkObjects.
 */
export class CitationValidator {
  private cache: ParsedFileCache;

  /**
   * Create citation validator.
   *
   * @param cache - Parsed file cache for target lookup
   */
  constructor(cache: ParsedFileCache) {
    this.cache = cache;
  }

  /**
   * Validate citations in file.
   * Integration: Parses file, validates each link, enriches with metadata.
   *
   * @param filePath - File to validate
   * @returns Validation summary with enriched links
   */
  async validateFile(filePath: string): Promise<FileValidationSummary> {
    // --- File Parsing ---
    // Integration: Get parsed document from cache
    const doc = /* this.cache.get(filePath) */;

    // Integration: Extract links from document
    const links: LinkObject[] = /* extract links from doc */;

    // --- Link Validation ---
    // Pattern: Map each link to validation result
    const results: CitationValidationResult[] = [];
    let validCount = 0;
    let warningCount = 0;
    let errorCount = 0;

    for (const link of links) {
      // Integration: Validate link and enrich
      const result = /* this.validateLink(link) */;

      results.push(result);

      // Pattern: Aggregate counts from validation status
      if (result.status === 'valid') validCount++;
      if (result.status === 'warning') warningCount++;
      if (result.status === 'error') errorCount++;
    }

    // --- Summary Construction ---
    return {
      filePath,
      totalCitations: links.length,
      validCount,
      warningCount,
      errorCount,
      results
    };
  }

  /**
   * Validate single link and enrich with metadata.
   * Pattern: Enrichment - adds validation property to LinkObject.
   *
   * @param link - Link object to validate
   * @returns Validation result with enriched link
   */
  private validateLink(link: LinkObject): CitationValidationResult {
    // --- Target Existence Check ---
    // Integration: Check if target file exists via cache
    const fileExists = /* check target file in cache */;

    // Decision: Error if file not found
    if (!fileExists) {
      return {
        link: {
          ...link,
          validation: {
            status: 'error',
            fileExists: false,
            anchorExists: null,
            suggestions: /* generate suggestions */
          }
        },
        status: 'error',
        message: 'Target file not found',
        suggestions: /* suggestions array */
      };
    }

    // --- Anchor Validation ---
    // Integration: Check anchor exists in target file
    const anchorExists = /* validate anchor if present */;

    // Decision: Warning if anchor not found
    if (link.target.anchor && !anchorExists) {
      return {
        link: {
          ...link,
          validation: {
            status: 'warning',
            fileExists: true,
            anchorExists: false,
            suggestions: /* suggest anchors */
          }
        },
        status: 'warning',
        message: 'Anchor not found in target file',
        suggestions: /* suggestions */
      };
    }

    // --- Valid Result ---
    return {
      link: {
        ...link,
        validation: {
          status: 'valid',
          fileExists: true,
          anchorExists: link.target.anchor ? true : null
        }
      },
      status: 'valid',
      message: 'Citation valid',
      suggestions: []
    };
  }
}
```

Run: `npm test -- citation-validator.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint and verify module complete

Run: `npm run validate:ts-conversion -- "tools/citation-manager/src/{ParsedFileCache,CitationValidator}.ts"`

Expected: Both files pass all 7 checkpoints

Run: `npm test`

Expected: 304/304 tests PASS

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.4] convert CitationValidator to TypeScript - Integration Layer complete"

---

### Task 4.4.3: Code Review Story 4.4

**Files:**
- None (review task)

#### Step 1: Request code-reviewer for Integration Layer

Use `requesting-code-review` skill with:
- WHAT_WAS_IMPLEMENTED: Integration Layer TypeScript conversion (2 files: ParsedFileCache, CitationValidator)
- PLAN_OR_REQUIREMENTS: Epic 4 Story 4.4
- BASE_SHA: Commit before Story 4.4 started
- HEAD_SHA: Current commit
- DESCRIPTION: "Converted Integration Layer to TypeScript using test-first pattern"

#### Step 2: Address feedback

Review and fix issues

#### Step 3: Final commit

Use `create-git-commit` skill to commit:
- Message: "refactor(typescript): [Epic 4.4] address code review feedback for Integration Layer"

---

## Story 4.5: Factories & CLI Conversion

### Task 4.5.1: Convert LinkObjectFactory (test + source)

**Files:**
- `test/link-object-factory.test.js` → `.ts` (MODIFY)
- `src/factories/LinkObjectFactory.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test to TypeScript

```bash
git mv test/link-object-factory.test.js test/link-object-factory.test.ts
```

```typescript
// test/link-object-factory.test.ts
import { describe, it, expect } from 'vitest';
import { LinkObjectFactory } from '../src/factories/LinkObjectFactory';
import type { LinkObject } from '../src/types/citationTypes';

describe('LinkObjectFactory', () => {
  it('should create LinkObject from markdown link syntax', () => {
    // Given: Markdown link string
    const markdown: string = '[text](file.md#anchor)';
    const line: number = 5;
    const column: number = 0;

    // When: Create LinkObject
    const factory = new LinkObjectFactory();
    const link: LinkObject = factory.createFromMarkdown(markdown, line, column);

    // Then: LinkObject with parsed target
    // Verification: Target path and anchor extracted
    expect(link.linkType).toBe('markdown');
    expect(link.target.path.raw).toBe('file.md');
    expect(link.target.anchor).toBe('anchor');
  });
});
```

Run: `npm test -- link-object-factory.test.ts`
Expected: FAIL

#### Step 2: GREEN - Convert source to TypeScript

```bash
git mv src/factories/LinkObjectFactory.js src/factories/LinkObjectFactory.ts
```

```typescript
// src/factories/LinkObjectFactory.ts
import type { LinkObject, LinkScope } from '../types/citationTypes';

/**
 * Factory for creating LinkObject instances.
 * Pattern: Factory pattern for complex object construction.
 */
export class LinkObjectFactory {
  /**
   * Create LinkObject from markdown link syntax.
   * Pattern: Parse syntax, construct normalized object.
   *
   * @param markdown - Raw markdown link string
   * @param line - Source line number (1-based)
   * @param column - Source column number (0-based)
   * @returns LinkObject instance
   */
  createFromMarkdown(markdown: string, line: number, column: number): LinkObject {
    // --- Syntax Parsing ---
    // Pattern: Regex extraction of [text](path#anchor) components
    const match = /* regex match for markdown link */;

    const text = /* extract text from match */;
    const pathAndAnchor = /* extract path#anchor from match */;

    // --- Path/Anchor Splitting ---
    // Pattern: Split on # to separate path from anchor
    const [rawPath, anchor] = /* split pathAndAnchor on # */;

    // --- Scope Classification ---
    // Decision: External if starts with http/https
    const scope: LinkScope = /* rawPath.startsWith('http') ? 'external' : 'internal' */;

    // --- LinkObject Construction ---
    return {
      rawSourceLink: markdown,
      linkType: 'markdown',
      scope,
      target: {
        path: {
          raw: rawPath,
          absolute: null,  // Resolved later by validator
          relative: null
        },
        anchor: anchor || null
      },
      text,
      fullMatch: markdown,
      line,
      column
    };
  }

  /**
   * Create LinkObject from wiki link syntax.
   *
   * @param wikiLink - Raw wiki link string [[target]]
   * @param line - Source line number
   * @param column - Source column number
   * @returns LinkObject instance
   */
  createFromWiki(wikiLink: string, line: number, column: number): LinkObject {
    // Similar pattern to createFromMarkdown
    // Pattern: Parse [[text|path#anchor]] or [[path#anchor]]
    /* implementation */
  }
}
```

Run: `npm test -- link-object-factory.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint

Run: `npm run validate:ts-conversion -- tools/citation-manager/src/factories/LinkObjectFactory.ts`

Expected: All 7 checkpoints PASS

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.5] convert LinkObjectFactory to TypeScript"

---

### Task 4.5.2: Convert componentFactory (test + source)

**Files:**
- `test/component-factory.test.js` → `.ts` (MODIFY)
- `src/factories/componentFactory.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test to TypeScript

```bash
git mv test/component-factory.test.js test/component-factory.test.ts
```

```typescript
// test/component-factory.test.ts
import { describe, it, expect } from 'vitest';
import { createCitationValidator } from '../src/factories/componentFactory';
import { CitationValidator } from '../src/CitationValidator';

describe('componentFactory', () => {
  it('should create fully wired CitationValidator', () => {
    // Given: Scope directory for validator
    const scopeDir: string = /* test fixtures directory */;

    // When: Create validator via factory
    const validator: CitationValidator = createCitationValidator(scopeDir);

    // Then: Validator is ready to use
    // Verification: Instance type check
    expect(validator).toBeInstanceOf(CitationValidator);
  });
});
```

Run: `npm test -- component-factory.test.ts`
Expected: FAIL

#### Step 2: GREEN - Convert source to TypeScript

```bash
git mv src/factories/componentFactory.js src/factories/componentFactory.ts
```

```typescript
// src/factories/componentFactory.ts
import { MarkdownParser } from '../MarkdownParser';
import { FileCache } from '../FileCache';
import { ParsedFileCache } from '../ParsedFileCache';
import { CitationValidator } from '../CitationValidator';

/**
 * Create fully wired CitationValidator with dependencies.
 * Pattern: Factory function for dependency injection wiring.
 *
 * @param scopeDirectory - Root directory for file resolution
 * @returns CitationValidator with wired dependencies
 */
export function createCitationValidator(scopeDirectory: string): CitationValidator {
  // --- Dependency Construction ---
  // Pattern: Build dependency graph from leaves to root

  // Integration: MarkdownParser has no dependencies
  const parser = new MarkdownParser();

  // Integration: FileCache depends on scope directory
  const fileCache = new FileCache(scopeDirectory);

  // Integration: ParsedFileCache depends on parser
  const parsedCache = new ParsedFileCache(parser);

  // Integration: CitationValidator depends on parsed cache
  const validator = new CitationValidator(parsedCache);

  return validator;
}
```

Run: `npm test -- component-factory.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint

Run: `npm run validate:ts-conversion -- tools/citation-manager/src/factories/componentFactory.ts`

Expected: All 7 checkpoints PASS

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.5] convert componentFactory to TypeScript"

---

### Task 4.5.3: Convert citation-manager CLI (test + source)

**Files:**
- `test/citation-manager.test.js` → `.ts` (MODIFY)
- `src/citation-manager.js` → `.ts` (MODIFY)

#### Step 1: RED - Convert test to TypeScript

```bash
git mv test/citation-manager.test.js test/citation-manager.test.ts
```

```typescript
// test/citation-manager.test.ts
import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';

describe('citation-manager CLI', () => {
  it('should execute validate command from compiled dist/', () => {
    // Given: Test markdown file
    // Fixture: Real file with citations
    const testFile: string = /* resolve fixture path */;

    // When: Execute CLI from dist/
    // Boundary: Spawn CLI as subprocess
    const output: string = execSync(
      `node dist/citation-manager.js validate "${testFile}"`,
      { encoding: 'utf8', cwd: /* tools/citation-manager */ }
    );

    // Then: Validation completes successfully
    // Verification: Output contains validation summary
    expect(output).toContain('Total citations:');
  });
});
```

Run: `npm test -- citation-manager.test.ts`
Expected: FAIL (source still .js)

#### Step 2: GREEN - Convert source to TypeScript

```bash
git mv src/citation-manager.js src/citation-manager.ts
```

```typescript
// src/citation-manager.ts
import { Command } from 'commander';
import { createCitationValidator } from './factories/componentFactory';
import type { FileValidationSummary } from './types/validationTypes';

/**
 * CLI program for citation validation.
 * Integration: Uses commander for CLI parsing.
 */
const program = new Command();

// --- CLI Configuration ---
program
  .name('citation-manager')
  .description('Validate markdown citations')
  .version('1.0.0');

// --- Validate Command ---
program
  .command('validate')
  .description('Validate citations in markdown file')
  .argument('<file>', 'File to validate')
  .option('--format <type>', 'Output format (text|json)', 'text')
  .action(async (file: string, options: { format: string }) => {
    // --- Validator Setup ---
    // Integration: Create validator via factory
    const validator = createCitationValidator(process.cwd());

    // --- File Validation ---
    // Integration: Run validation
    const result: FileValidationSummary = await validator.validateFile(file);

    // --- Output Formatting ---
    // Decision: JSON or text based on --format flag
    if (options.format === 'json') {
      // Boundary: Write JSON to stdout
      console.log(JSON.stringify(result, null, 2));
    } else {
      // Pattern: Format human-readable report
      /* console.log(formatTextReport(result)) */;
    }

    // --- Exit Code ---
    // Decision: Exit 1 if errors found
    const exitCode = result.errorCount > 0 ? 1 : 0;
    process.exit(exitCode);
  });

// --- Program Execution ---
// Pattern: Only parse if executed directly (not imported)
if (import.meta.url === /* resolve to current file URL */) {
  program.parse();
}

export { program };
```

Run: `npm test -- citation-manager.test.ts`
Expected: PASS

#### Step 3: REFACTOR - Run validation checkpoint and verify Epic complete

Run: `npm run validate:ts-conversion -- "tools/citation-manager/src/**/*.ts"`

Expected: All 58 files pass all 7 checkpoints

Verify no .js files in src/:

Run: `find tools/citation-manager/src -name "*.js"`

Expected: No output (zero .js files)

#### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(typescript): [Epic 4.5] convert citation-manager CLI to TypeScript - Epic 4 COMPLETE"

---

### Task 4.5.4: Final Epic Validation and Code Review

**Files:**
- None (validation and review task)

#### Step 1: Run full test suite

Run: `npm test`

Expected: 304/304 tests PASS

#### Step 2: Test CLI execution from dist/

Run: `npm run build`

Expected: Build completes successfully

Run: `npm run citation:validate -- design-docs/ARCHITECTURE.md`

Expected: CLI executes from dist/, validation completes

Run: `npm run citation:extract -- design-docs/ARCHITECTURE.md "References"`

Expected: Extract command works from dist/

#### Step 3: Request final code-reviewer

Use `requesting-code-review` skill with:
- WHAT_WAS_IMPLEMENTED: Complete Epic 4 TypeScript migration (58 files converted)
- PLAN_OR_REQUIREMENTS: Epic 4 entire epic
- BASE_SHA: Commit at start of Epic 4
- HEAD_SHA: Current commit
- DESCRIPTION: "Systematically converted all 58 citation-manager files to TypeScript using automation-first, module-by-module approach with continuous GREEN validation"

#### Step 4: Address final feedback

Review final code review:
- Fix any Critical or Important issues
- Document Minor issues for future improvement

#### Step 5: Final commit

Use `create-git-commit` skill to commit:
- Message: "refactor(typescript): [Epic 4] address final code review feedback - TypeScript migration complete"

---

## Execution Handoff

**Plan complete and saved to:**
`design-docs/features/20251112-typescript-vite-migration/user-stories/epic4-systematic-conversion/epic4-systematic-conversion-implement-plan.md`

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration with quality gates

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
