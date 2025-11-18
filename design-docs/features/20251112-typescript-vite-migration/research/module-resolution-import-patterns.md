# TypeScript Module Resolution and Import Patterns Research

**Date:** 2024-11-18
**Research Question:** How do TypeScript moduleResolution settings (NodeNext vs bundler) affect import patterns and testing without build steps?
**Research Method:** Perplexity AI reasoning with "best practices 2025"

---

## Executive Summary

**Key Finding:** Our project uses `moduleResolution: "bundler"` which allows importing TypeScript files directly WITHOUT `.js` extensions, enabling build-free testing with Vitest.

**Impact on Epic 4:** The initial design incorrectly stated imports need `.js` extensions (ESM standard). This is only true for `moduleResolution: "nodenext"`, NOT for bundler mode.

**Correct Pattern:**

```typescript
// ✅ CORRECT for bundler mode
import { normalizeBlockId } from '../src/core/ContentExtractor/normalizeAnchor';

// ❌ WRONG for bundler mode
import { normalizeBlockId } from '../src/core/ContentExtractor/normalizeAnchor.js';
```

---

## Understanding Module Resolution Options

### NodeNext vs Node vs Bundler

**Node (node10):**
- Legacy option for older Node.js versions
- CommonJS-only support
- No longer recommended for new projects

**NodeNext:**
- Modern Node.js (v12+) supporting both ESM and CommonJS
- Enforces strict Node.js module resolution rules
- **REQUIRES .js extensions in imports** (references compiled output)

**Bundler:**
- Designed for bundler/transpiler environments (webpack, Vite, esbuild)
- Intelligent module resolution
- **Allows importing .ts files directly**
- Ideal for development with tools like Vitest

---

## The .js Extension Requirement Explained

### When NodeNext Requires .js Extensions

When using `moduleResolution: "nodenext"`:

```typescript
// Source file: example.ts
export function greet() {
  return "Hello";
}

// Importing from another .ts file - NodeNext REQUIRES:
import { greet } from "./example.js";  // Reference .js, not .ts!
```

**Why?** TypeScript validates imports as Node.js will see them in compiled output. The `.js` file doesn't exist yet during development, but WILL exist after compilation. This enforces correctness.

**From research:**
> "When moduleResolution is node16/nodenext, TypeScript will tell you to add .js extensions when referencing other .ts files because it's referencing the compiled output."

### When Bundler Mode Does NOT Require .js Extensions

When using `moduleResolution: "bundler"`:

```typescript
// ✅ Import TypeScript source directly
import { greet } from "./example.ts";
import { add } from "./utils.ts";

// Or omit extension (TypeScript resolves intelligently)
import { greet } from "./example";
```

**Why?** Bundler mode assumes a smart transpiler (like Vitest, Vite, webpack) handles both TypeScript parsing AND import resolution. No .js extension needed because the bundler never creates .js files during development.

---

## Configuration Patterns

### Pattern 1: Self-Transpiling with TSC (Production Build)

**Use when:** Compiling with TypeScript's own compiler for production

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "target": "esnext",
    "esModuleInterop": true,
    "declaration": true,
    "outDir": "./dist"
  }
}
```

**Consequence:** Must use .js extensions, tests require pre-compilation or tsx runtime

### Pattern 2: Bundler/Transpiler Mode (Development + Vitest)

**Use when:** Using Vitest, Vite, webpack, or other bundlers

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "target": "esnext",
    "esModuleInterop": true,
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "strict": true
  }
}
```

**Consequence:** Can import .ts files directly, tests run without pre-compilation

---

## Impact on Testing Without Build Steps

### With NodeNext Configuration

**Friction points:**
- Imports reference .js extensions (compiled output that doesn't exist yet)
- Must either:
  - Pre-compile TypeScript before running tests, OR
  - Use tsx runtime that translates .js imports back to .ts

**Testing workflow:**

```bash
# Option 1: Pre-compile
npm run build
npm test -- dist/

# Option 2: Use tsx runtime (adds complexity)
vitest --config vitest.config.tsx.ts
```

### With Bundler Configuration (Recommended for Vitest)

**Zero friction:**
- Vitest's built-in TypeScript transformation handles everything
- Tests run directly against TypeScript source
- No build step required

**Testing workflow:**

```bash
# Direct execution - no build needed
npm test
```

**From research:**
> "Vitest typically expects to work directly with TypeScript source files during testing without a build step... When using Vitest, the recommended approach is to use moduleResolution: 'bundler'"

---

## Our Project Configuration

### Current tsconfig.base.json

```json
{
  "compilerOptions": {
    "module": "ES2022",
    "moduleResolution": "bundler",  // ← KEY SETTING
    "target": "ES2022",
    "strict": true,
    "declaration": true,
    "sourceMap": true
  }
}
```

### What This Means

- ✅ **Can import TypeScript source directly** (no .js extensions)
- ✅ **Vitest tests work without build step** (built-in transpilation)
- ✅ **Development iteration is fast** (no compilation delay)
- ✅ **Production builds work correctly** (tsc still generates .js + .d.ts)

---

## Correction to Epic 4 Design

### Original (Incorrect) Guidance

> "3. Update imports to use .js extensions (ESM standard)"

### Corrected Guidance

**For bundler moduleResolution:**
- Imports reference TypeScript source files directly
- No .js extensions needed
- Vitest handles transpilation automatically

**Example:**

```typescript
// test/normalize-anchor.test.ts
import { normalizeBlockId } from '../src/core/ContentExtractor/normalizeAnchor';  // No .js!

describe('normalizeBlockId', () => {
  it('should remove leading caret from block IDs', () => {
    const input: string = '^my-block-id';
    const result: string | null = normalizeBlockId(input);
    expect(result).toBe('my-block-id');
  });
});
```

---

## Key Takeaways

1. **NodeNext vs Bundler is a critical choice** that affects your entire development workflow
2. **Our project uses bundler mode** which enables fast, build-free testing
3. **.js extensions are NOT needed** with bundler moduleResolution
4. **Epic 4 design needs correction** to remove .js extension guidance
5. **Vitest integration works seamlessly** with bundler configuration

---

## References

**Perplexity AI Research Output** (2024-11-18):
- Query: "TypeScript moduleResolution NodeNext vs Node vs ESM best practices 2025"
- Sources cited:
  - TypeScript Official Documentation (modules reference, tsconfig reference)
  - Total TypeScript Workshop (moduleResolution option guide)
  - TypeScript Module Resolution Examples (IanVS GitHub)
  - Node.js TypeScript ESM Guide (dev.to)

**Related Documentation:**
- [tsconfig.base.json](../../../tsconfig.base.json) - Our workspace configuration
- [Epic 4 Design](../user-stories/epic4-systematic-conversion/epic4-systematic-conversion-design.md) - Requires update
- [ARCHITECTURE.md](../../../ARCHITECTURE.md) - TypeScript development workflow section
