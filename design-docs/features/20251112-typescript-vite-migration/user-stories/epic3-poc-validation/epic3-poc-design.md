# Epic 3: POC Validation - Design Document

**Date:** 2024-11-18
**Status:** Approved by CEO
**Requirements:** [typescript-vite-migration-prd.md](../../typescript-vite-migration-prd.md) - Epic 3

## Overview

Validate end-to-end TypeScript conversion workflow using minimal risk (2 files) before committing to systematic conversion of all 58 citation-manager files. Proves infrastructure works and surfaces critical risks early.

**Primary Use Case:** Convert one leaf-node component (`normalizeAnchor`) to TypeScript following TDD discipline, validating that test-first conversion maintains continuous GREEN and that JavaScript/TypeScript interop works correctly.

## Architecture Decision

**Selected Approach:** Sequential Test-First Conversion

**Rationale:**

| Principle Category | Compliance |
|-------------------|------------|
| MVP Principles | ✅ Minimal scope (2 files) proves concept without over-engineering |
| Safety-First Design | ✅ Each conversion step validated independently before proceeding |
| Modular Design | ✅ Leaf node selection (zero dependencies) prevents cascade work |
| Data-First Design | ✅ Type signatures serve as explicit API contracts |
| TDD Discipline | ✅ Test-first sequence mirrors workflow for Epic 4 (58 files) |

**Rejected Alternatives:**
- Atomic paired conversion: Higher debugging complexity, no interop validation
- Parallel shadowing: Unnecessary overhead, duplicates files temporarily

## Component Design

### Target Component Selection

**Selected File:** `normalizeAnchor.js`

**Selection Criteria Evidence:**

```text
Location: tools/citation-manager/src/core/ContentExtractor/normalizeAnchor.js
Size: 40 lines, 2 exported functions
Dependencies: Zero internal dependencies (true leaf node)
Test Coverage: 6 passing tests
Consumers: 3 files (ContentExtractor, extractLinksContent, citation-manager)
Data Types: Primitives only (string, null)
```

**Why This Component:**
- Zero internal dependencies validates infrastructure without cascade conversions
- Simple data types (string | null) require no complex type definitions
- Existing test coverage provides immediate validation
- 3 consuming files validate JavaScript/TypeScript interop

### Conversion Phases

#### Phase 1: Workspace Setup

**Isolation Strategy:**

```bash
# Create feature branch in git worktree
git worktree add ../cc-workflows-epic3-poc feature/typescript-epic3-poc
cd ../cc-workflows-epic3-poc

# Verify baseline GREEN
npx tsc --noEmit  # Epic 1 infrastructure check
npm test          # All existing tests pass
```

**Success Criteria:**
- Worktree created successfully
- TypeScript compiler runs without errors (zero .ts files)
- All existing JavaScript tests pass

---

#### Phase 2: Test File Conversion (REFACTOR - Stay GREEN)

**Action:**

```bash
cd tools/citation-manager/test
git mv normalize-anchor.test.js normalize-anchor.test.ts
```

**Type Annotation Pattern:**

```typescript
// normalize-anchor.test.ts
import { describe, it, expect } from 'vitest';
import { normalizeBlockId, decodeUrlAnchor } from '../src/core/ContentExtractor/normalizeAnchor.js';

describe('normalizeBlockId', () => {
  it('should remove leading caret from block IDs', () => {
    const input: string = '^my-block-id';
    const result: string | null = normalizeBlockId(input);
    expect(result).toBe('my-block-id');
  });

  it('should return null for null input', () => {
    const result: string | null = normalizeBlockId(null);
    expect(result).toBeNull();
  });

  // ... 4 additional tests with explicit type annotations
});
```

**Key Design Decisions:**
- Explicit types on test variables (`const input: string`)
- Import path uses `.js` extension (ESM standard - imports compiled output)
- Tests import JavaScript source (validates interop)

**Validation:**

```bash
npm test -- normalize-anchor.test.ts
# Expected: 6/6 tests PASS (GREEN)
```

**Risk Validated:** TypeScript test files can import JavaScript source files (critical for Epic 4 incremental conversion).

---

#### Phase 3: Source File Conversion (REFACTOR - Stay GREEN)

**Action:**

```bash
cd tools/citation-manager/src/core/ContentExtractor
git mv normalizeAnchor.js normalizeAnchor.ts
```

**Type Safety Pattern:**

```typescript
// normalizeAnchor.ts

/**
 * Remove leading caret (^) from Obsidian block IDs
 * @param anchor - Block ID that may start with ^
 * @returns Block ID without leading caret, or null if input is null
 */
export function normalizeBlockId(anchor: string | null): string | null {
  if (anchor && anchor.startsWith("^")) {
    return anchor.substring(1);
  }
  return anchor;
}

/**
 * Decode URL-encoded anchor text
 * @param anchor - URL-encoded anchor string
 * @returns Decoded anchor string, original if decoding fails, or null if input null
 */
export function decodeUrlAnchor(anchor: string | null): string | null {
  if (anchor === null) {
    return null;
  }

  try {
    return decodeURIComponent(anchor);
  } catch (error) {
    return anchor;  // Fallback preserves type contract
  }
}
```

**Type Safety Patterns Applied:**
1. Explicit parameter types: `anchor: string | null`
2. Explicit return types: `: string | null`
3. Discriminated unions (type narrows in if-blocks)
4. Strict null handling (early return for null input)
5. Error handling preserves type contract

**No `any` Escapes Required:** Functions use only primitives (string, null).

**Validation:**

```bash
npx tsc --noEmit                      # Type checking
npm test -- normalize-anchor.test.ts  # Functional validation
# Expected: Zero compiler errors, 6/6 tests PASS
```

---

#### Phase 4: Comprehensive Validation (7 Checkpoints)

**Type Safety Validation (Compiler-Level):**

```bash
# Checkpoint 1: TypeScript compilation
npx tsc --noEmit
# Expected: Zero errors

# Checkpoint 2: No `any` escapes
grep -r "any" tools/citation-manager/src/core/ContentExtractor/normalizeAnchor.ts
# Expected: Zero matches

# Checkpoint 3: Explicit return types
cat tools/citation-manager/src/core/ContentExtractor/normalizeAnchor.ts | grep "export function"
# Expected: Both functions have `: string | null`

# Checkpoint 4: Strict null checking
npx tsc --noEmit --strictNullChecks
# Expected: Zero errors
```

**Functional Validation (Test-Level):**

```bash
# Checkpoint 5: All tests pass
npm test -- normalize-anchor.test.ts
# Expected: 6/6 tests PASS

# Checkpoint 6: JavaScript consumers work
npm test -- ContentExtractor.test.js
npm test -- extractLinksContent.test.js
# Expected: All tests PASS (validates interop)
```

**Build Validation (Compilation):**

```bash
# Checkpoint 7: Compiled output generation
npx tsc --build tools/citation-manager/tsconfig.json
ls -la tools/citation-manager/dist/core/ContentExtractor/normalizeAnchor.{js,d.ts}
# Expected: Both .js and .d.ts files exist

# Verify CLI from dist/
npm run citation:validate -- tools/citation-manager/test/fixtures/valid-citations.md
# Expected: CLI executes successfully
```

---

#### Phase 5: Commit and Review

**Report Results:**
- Output 7 checkpoint pass/fail results to chat
- Note any issues discovered
- Document lessons learned for Epic 4

**Commit:**
Use `create-git-commit` skill (don't specify commit message - skill handles it)

**Code Review:**
Use `requesting-code-review` skill before merging to main

## Data Flow

```text
Setup Phase:
  Create git worktree → Verify baseline GREEN
         ↓
Test Conversion (REFACTOR):
  Rename .test.js → .test.ts → Add type annotations → Run tests → Verify GREEN
         ↓
  [INTEROP VALIDATED: .test.ts imports .js source successfully]
         ↓
Source Conversion (REFACTOR):
  Rename .js → .ts → Add type annotations → Run compiler → Run tests → Verify GREEN
         ↓
  [TYPE SAFETY VALIDATED: Strict mode, no `any` escapes, explicit contracts]
         ↓
Comprehensive Validation:
  Run 7 checkpoints → Document results → Request code review
         ↓
  [PATTERN VALIDATED: Ready for Epic 4 systematic conversion]
```

## Testing Strategy

### Risk Mitigation Validation

| Risk | Validation Method | Success Criteria |
|------|-------------------|------------------|
| TypeScript config errors | Checkpoint 1 (`tsc --noEmit`) | Zero compiler errors |
| JS/TS interop failures | Checkpoint 6 (JS consumers pass) | All consuming tests pass |
| Test runner compatibility | Checkpoint 5 (`.test.ts` runs) | 6/6 tests pass |
| npm link execution breaks | Checkpoint 7 (CLI from `dist/`) | CLI executes successfully |
| Type annotation complexity | Checkpoint 2 (no `any`) | Zero `any` escapes |

### Expected Outcomes

**If POC Succeeds (All 7 Checkpoints Pass):**
- TypeScript infrastructure from Epic 1 validated
- JavaScript/TypeScript interop proven
- Test-first conversion pattern validated
- Ready to proceed to Epic 4 (systematic conversion)

**If POC Fails (Any Checkpoint Fails):**
- Document failure mode
- Fix infrastructure issue before Epic 4
- Re-run POC to validate fix
- Adjust Epic 4 approach if needed

## Success Criteria

**POC Complete When:**
- [ ] All 7 validation checkpoints pass ✅ NFR12, NFR13
- [ ] Zero `any` type escapes ✅ NFR5
- [ ] Continuous GREEN maintained (all tests pass) ✅ NFR12
- [ ] JavaScript consumers still work ✅ FR7, FR8
- [ ] Results documented in epic3-poc-results.md
- [ ] Code review completed
- [ ] Pattern validated for Epic 4 scaling

**Architecture Compliance:**
- [ ] MVP-First Approach (minimal scope proves concept) ✅ NFR1
- [ ] Safety-First Design (each step validated) ✅ NFR4
- [ ] Modular Design (leaf node, zero cascade) ✅ NFR2
- [ ] TDD Discipline (continuous GREEN) ✅ NFR12

## Out of Scope

**Explicitly NOT included in Epic 3 POC:**
- Complex object type definitions (deferred to Epic 4)
- Dependency injection typing (deferred to Epic 4)
- Test fixture typing (none exist for this component)
- Factory pattern typing (deferred to Epic 4)
- Converting consuming files (JavaScript consumers validate interop)
- Performance optimization (not a POC goal)

**Rationale:** POC deliberately chooses EASIEST conversion to validate infrastructure and process, not hardest. Complex typing challenges addressed incrementally in Epic 4.

## References

- **Requirements:** [typescript-vite-migration-prd.md](../../typescript-vite-migration-prd.md) - Epic 3
- **Architecture:** [ARCHITECTURE.md](../../../../../ARCHITECTURE.md)
- **Architecture Principles:** [ARCHITECTURE-PRINCIPLES.md](../../../../../ARCHITECTURE-PRINCIPLES.md)
- **Epic 1 Infrastructure:** [epic1-typescript-infrastructure-setup-design.md](../epic1-typescript-infrastructure-setup/epic1-typescript-infrastructure-setup-design.md)
