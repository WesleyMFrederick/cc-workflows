# TypeScript tsconfig.json Best Practices 2025

**Research Date:** 2024-11-18
**Source:** Perplexity AI Search
**Query:** "TypeScript tsconfig.json Node.js CLI tool library strict settings best practices 2025"

---

## Executive Summary

For a **Node.js CLI tool/library written in TypeScript in 2025**, with an emphasis on **strict settings and best practices**, use a layered `tsconfig.json` structure, strict type-checking, modern module features, and environment-specific overrides.

---

## Best Practices Overview

### Configuration Structure

**Layer your configs:**
- Use a `tsconfig.base.json` for shared strict and modern options
- Have separate files for building (`tsconfig.build.json`), editing (`tsconfig.json`), and testing (`tsconfig.test.json`), each extending the base
- Exclude tests, mocks, and benchmarks from build/output

### Compiler Options (Core Strict and Node.js ESM Settings)

```json
{
  "extends": "@tsconfig/strictest/tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "declaration": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "noEmit": false,
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src/**/*"],
  "exclude": ["**/*.test.ts", "**/*.spec.ts", "benchmarks/**", "dist/**"]
}
```

---

## Key Compiler Options Explained

### Module Settings

- **`module: "NodeNext"`** - Best for modern Node.js (supports ESM and CommonJS)
- **`moduleResolution: "NodeNext"`** - Matches module setting for proper resolution
- **`target: "ES2022"`** - Or "ESNext" for bleeding-edge features

### Strict Type Checking

- **`strict: true`** - Enables ALL strict checks (master switch)
- **`noUncheckedIndexedAccess: true`** - Prevents accessing array/object without checking if defined
- **`exactOptionalPropertyTypes: true`** - Distinguishes undefined vs missing properties
- **`noImplicitOverride: true`** - Requires explicit override keyword
- **`noImplicitReturns: true`** - Catches missing return statements
- **`noFallthroughCasesInSwitch: true`** - Prevents switch fallthrough bugs
- **`noPropertyAccessFromIndexSignature: true`** - Forces bracket notation for index signatures

### Output Settings

- **`declaration: true`** - For libraries (generates .d.ts files)
- **`sourceMap: true`** - Useful for debugging
- **`outDir: "dist"`** - Typical output directory

### Module Interoperability

- **`esModuleInterop: true`** - Easier interoperability with CommonJS
- **`resolveJsonModule: true`** - Import JSON configs
- **`forceConsistentCasingInFileNames: true`** - Prevents cross-platform issues

### Performance

- **`skipLibCheck: true`** - Faster builds, generally safe for libraries

---

## Project References (For Monorepos)

Use `composite: true` and TypeScript project references for fast, scalable builds in monorepos or large codebases.

**Benefits:**
- Faster incremental builds
- Better workspace tooling support
- Clear dependency boundaries

---

## Validation and Consistency

### Configuration Validation

- Use JSON Schema validation or `tsconfig-schema` to catch misconfigurations
- Run `tsc --showConfig` to review the final merged config

### Linting Integration

- Pair with ESLint using `@typescript-eslint/parser` for best type-awareness
- Set `parserOptions.project` to your main tsconfig
- Disallow unused variables, unreachable code, implicit any, and "any" types

---

## Runtime and Test Configurations

### CLI Tools

- Ensure proper `"bin"` entry in package.json
- Check emitted JS compatibility with targeted Node.js LTS

### Test Configs

- Use a separate config that includes test-only globals/framework types
- Relax certain restrictions if reasonable (but keep strict by default)

---

## Upgrade and Maintenance Tips

### Modern Defaults (2025)

- Prefer modern ES targets (`ES2022` or later)
- Use `NodeNext`/`ESNext` settings to match evolving Node.js ecosystem
- Regularly review and update base configs

### Community Base Configs

Community packages provide maintained defaults:
- `@tsconfig/node18` / `@tsconfig/node20` / `@tsconfig/node22`
- `@tsconfig/strictest`

---

## Key Takeaways

1. **Strict mode is essential** - `"strict": true` and all strict sub-flags catch bugs at compile-time
2. **Separate configs by purpose** - Build/test/editor configs prevent accidental emission of dev code
3. **Modern module settings** - `"module": "NodeNext"` and `"target": "ES2022"` are 2025 best practices
4. **Validate as part of CI** - Ensure consistency across teams
5. **Project references for scale** - Enable incremental builds for complex workspaces

---

## Sources

1. [Everything You Need to Know About tsconfig.json in TypeScript](https://overctrl.com/everything-you-need-to-know-about-tsconfig-json-in-typescript/)
2. [TypeScript in 2025: The Ultimate Guide to tsconfig.json](https://javascript.plainenglish.io/typescript-in-2025-the-ultimate-guide-to-tsconfig-json-b3dff16d6811)
3. [TypeScript: TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
4. [2ality: The tsconfig.json File](https://2ality.com/2025/01/tsconfig-json.html)
5. [TypeScript Best Practices in 2025](https://dev.to/mitu_mariam/typescript-best-practices-in-2025-57hb)
6. [My 2025 TypeScript Setup That Just Works](https://blog.stackademic.com/my-2025-typescript-setup-that-just-works-53ece37b060f)

---

## Applicability to cc-workflows

**Direct Application:**
- Use `module: "NodeNext"` for Node.js 18+ ESM compatibility
- Enable all strict flags for maximum type safety
- Use `composite: true` for monorepo project references
- Generate `.d.ts` files via `declaration: true` (FR6 requirement)

**Adaptations Needed:**
- No separate test configs initially (keep Epic 1 simple)
- Skip `@tsconfig/strictest` base (define our own for transparency)
- No path mapping yet (YAGNI until shared packages exist)
