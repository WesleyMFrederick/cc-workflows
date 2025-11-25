# Epic 4: TypeScript Migration Learnings

## Import Extensions in TypeScript ESM Projects

### Context

During Epic 4 (Parser Facade & Cache migration), we discovered confusion about proper import extensions when migrating `.js` files to `.ts`.

### The Problem

When renaming `ParsedDocument.js` → `ParsedDocument.ts`, the question arose: Should imports reference `.js` or `.ts`?

Initial incorrect assumption: Change `import ParsedDocument from "./ParsedDocument.js"` to `"./ParsedDocument.ts"`

### The Correct Answer (2025 Best Practices)

**For Node.js ESM with `moduleResolution: NodeNext`:**

✅ **CORRECT:** Import statements should use `.js` extensions, even when importing from `.ts` files

```typescript
// In ParsedFileCache.js or ParsedFileCache.ts
import ParsedDocument from "./ParsedDocument.js"; // ✅ Correct
```

❌ **INCORRECT:**
```typescript
import ParsedDocument from "./ParsedDocument.ts";  // ❌ Wrong
import ParsedDocument from "./ParsedDocument";     // ❌ Wrong (missing extension)
```

### Why `.js` Extensions?

1. **Node.js ESM Requirement:** Node.js ESM module resolution requires explicit file extensions and does not perform extension searching

2. **Output-Based Imports:** Import paths reference the **compiled output** files (`.js`), not the source files (`.ts`)

3. **TypeScript Design:** TypeScript intentionally does NOT rewrite import paths during compilation. What you write is what gets emitted.

4. **Runtime Reality:** At runtime, Node.js loads `.js` files from the `dist/` folder, not `.ts` files from `src/`

### Module Resolution Modes

#### NodeNext (Node16, Node18)
- **Use case:** Publishing packages for Node.js (no bundler)
- **Rule:** MUST use `.js` extensions in imports
- **Our project:** ✅ Uses this mode (`moduleResolution: NodeNext`)

#### Bundler
- **Use case:** Frontend code processed by Webpack/Vite/etc.
- **Rule:** Can omit extensions or use `.ts` extensions
- **Our project:** ❌ Not applicable (we're a CLI tool)

### Verification in Our Codebase

```bash
# Check our module resolution mode
cat tsconfig.base.json | grep moduleResolution
# Output: "moduleResolution": "NodeNext"

# This means: Use .js extensions in all imports
```

### Implementation Impact

**During Epic 4 migration:**

1. When renaming `.js` → `.ts`: Keep imports pointing to `.js`
2. When creating new `.ts` files: Use `.js` in imports
3. When `.ts` files import other `.ts` files: Still use `.js` extensions

**Example:**
```typescript
// src/ParsedDocument.ts imports from types
import type { ParserOutput } from "./types/citationTypes.js"; // .js extension

// src/ParsedFileCache.ts imports ParsedDocument
import ParsedDocument from "./ParsedDocument.js"; // .js extension
```

### References

- [TypeScript ESM Node.js Handbook](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [TypeScript Module Resolution](https://www.typescriptlang.org/tsconfig/moduleResolution.html)
- [TypeScript Modules Theory](https://www.typescriptlang.org/docs/handbook/modules/theory.html)
- [Node.js, TypeScript and ESM Guide](https://dev.to/a0viedo/nodejs-typescript-and-esm-it-doesnt-have-to-be-painful-438e)

### Action Items

- [x] Document this learning in epic4-learnings.md
- [ ] Update epic4-parser-facade-cache-implementation-plan.md to include import best practices
- [ ] Review and fix any incorrect `.ts` extensions in imports
- [ ] Add this to architecture principles for future reference
