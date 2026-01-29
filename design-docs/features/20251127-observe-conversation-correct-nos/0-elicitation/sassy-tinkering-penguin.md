# Plan: Update CitationValidator Component Guide Following MarkdownParser Guide Patterns

## Context

**Goal**: Update CitationValidator Implementation Guide to document TypeScript implementation following MarkdownParser guide's structure, tone, and inline documentation patterns.

**Constraint**: NO new sections. Enhance existing sections only.

**Pattern Source**: MarkdownParser Implementation Guide (879 lines)
- Shows TypeScript interfaces directly in Data Contracts section
- Uses inline notes for TypeScript-specific details
- Includes discriminated unions in existing contract documentation
- Bold **`component names`** with code formatting that link to proper files
- No links to .archive folder

**Target Guide**: CitationValidator Implementation Guide (755 lines)
- Similar structure to MarkdownParser
- Needs TypeScript patterns added to existing sections
- Epic 5 completed migration (commit 5754f3e, 313/313 tests)

---

## MarkdownParser Link Pattern Examples

**Pattern 1 - Module Definitions** (link to arch doc level 3 heading):

```markdown
[**`ParsedDocument`**](../ARCHITECTURE-Citation-Manager.md#Citation%20Manager.ParsedDocument)
```

**Pattern 2 - External Component Guides Internal Headers** (specific contracts/sections):

```markdown
[**`MarkdownParser.Output.DataContract`**](#Data%20Contracts)
[`ValidationResult`](#Data%20Contracts)
```

**Pattern 3 - Implementation Guide References** (link to guide file):

```markdown
[CitationValidator Implementation Guide](CitationValidator%20Implementation%20Guide.md)
```

---

## Implementation Plan (NO New Sections - Enhance Only)

### Enhancement 1: File Structure Section

**Location**: Lines 84-122 (existing File Structure section)

**Diff Patch**:

```diff
-**Current Structure** (JavaScript Implementation):
+**Current Structure** (TypeScript Implementation):

 ```text
 tools/citation-manager/
 ├── src/
-│   └── CitationValidator.js                       // Monolithic validation component (745+ lines)
+│   ├── CitationValidator.ts                       // TypeScript implementation (~883 lines)
+│   │   ├── ParsedFileCacheInterface              // DI interface
+│   │   ├── FileCacheInterface                    // DI interface
+│   │   ├── validateFile()                        // Main orchestrator → ValidationResult
+│   │   ├── validateSingleCitation()              // Single link validation → EnrichedLinkObject
+│   │   ├── enrichLinkWithValidation()            // Enrichment with discriminated union
+│   │   └── helpers                               // Inline helper methods
+│   │
+│   └── types/
+│       └── validationTypes.ts                    // Validation type definitions
+│           ├── ValidationMetadata                // Discriminated union (status-based)
+│           ├── EnrichedLinkObject                // LinkObject + validation property
+│           └── ValidationResult                  // { summary, links } output
│
```

---

### Enhancement 2: Data Contracts Section (Replace JSON Schema)

**Location**: Lines 278-456 (existing Data Contract JSON Schema section)

**Change**: Replace entire JSON Schema with TypeScript interfaces

**Diff Patch**:

```diff
-## `CitationValidator.ValidationResult.Output.DataContract` JSON Schema
+## Data Contracts

-The `ValidationResult` structure returns enriched LinkObjects with validation metadata added by the validator (updated in US1.8, 2025-10-17).
+TypeScript interfaces defining validator output structure. Source: `src/types/validationTypes.ts`

-```json
-{
-  "$schema": "https://json-schema.org/draft/2020-12/schema",
-  ...
-}
+### ValidationMetadata Type (Discriminated Union)
+
+```typescript
+export type ValidationMetadata =
+  | { status: "valid" }
+  | {
+      status: "error";
+      error: string;
+      suggestion?: string;
+      pathConversion?: PathConversion;
+    }
+  | {
+      status: "warning";
+      error: string;
+      suggestion?: string;
+      pathConversion?: PathConversion;
+    };
+```
+
+> **Note**: TypeScript narrows `ValidationMetadata` based on `status` checks. When `status === "error"`, TypeScript makes `error` property available without additional type guards.
+
+### EnrichedLinkObject Interface
+
+```typescript
+export interface EnrichedLinkObject extends LinkObject {
+  /** Validation metadata (added post-parse by enrichment pattern) */
+  validation: ValidationMetadata;
+}
+```
+
+### ValidationResult Interface
+
+```typescript
+export interface ValidationResult {
+  summary: ValidationSummary;
+  links: EnrichedLinkObject[];
+}
+```
+
+### ValidationSummary Interface
+
+```typescript
+export interface ValidationSummary {
+  total: number;
+  valid: number;
+  warnings: number;
+  errors: number;
+}
 ```

---

### Enhancement 3: Pseudocode Section

**Location**: Lines 171-276 (existing Pseudocode section)

**Change**: Add inline TypeScript implementation note at enrichment pattern

**Diff Patch**:

```diff
 // Enriches a LinkObject with validation metadata (instead of returning separate result)
 private async method enrichLinkWithValidation(link: EnrichedLinkObject): void is
+  // TypeScript Implementation Note (CitationValidator.ts line 184):
+  // Cast to 'any' to add validation property (LinkObject doesn't include it yet)
+  // Then rely on return type to enforce EnrichedLinkObject contract
+  // (link as any).validation = validation;
+
   // Decision: Check if the target file path was successfully resolved by the parser.
   if (link.target.path.absolute == null) then
     // Enrichment: Add validation property directly to link
```

---

### Enhancement 4: Update Internal Links

**Pattern**: Match MarkdownParser guide's bold+code link format

**Files to Update**:

**Diff Patch 1** - Structure section (line 15-18):

```diff
-The [**`CitationValidator`**](../ARCHITECTURE-Citation-Manager.md#Citation Manager.Citation Validator): The class that orchestrates the validation process.
+The [**`CitationValidator`**](../ARCHITECTURE-Citation-Manager.md#Citation%20Manager.Citation%20Validator): The class that orchestrates the validation process.

-[ParsedFileCache](ParsedFileCache%20Implementation%20Guide.md): The dependency used to retrieve `ParsedDocument` instances efficiently.
+[**`ParsedFileCache`**](ParsedFileCache%20Implementation%20Guide.md): The dependency used to retrieve [**`ParsedDocument`**](ParsedDocument%20Implementation%20Guide.md) instances efficiently.
```

**Diff Patch 2** - Remove .archive links:

```diff
-([Story 1.8 Acceptance Criteria](<../.archive/features/20251003-content-aggregation/content-aggregation-prd.md#Story 1.8 Acceptance Criteria>))
+(Story 1.8 Acceptance Criteria - see Epic 5 completion)
```

**Diff Patch 3** - Update contract references:

```diff
-The component's constructor accepts two dependencies:
-1. An implementation of a [`ParsedFileCache interface`](ParsedFileCache%20Implementation%20Guide.md#Public%20Contracts)
-2. An implementation of a [`FileCache interface`](<../.archive/features/20251003-content-aggregation/content-aggregation-architecture.md#Citation Manager.File Cache>)
+The component's constructor accepts two dependencies:
+1. An implementation of [**`ParsedFileCacheInterface`**](ParsedFileCache%20Implementation%20Guide.md#Public%20Contracts) that returns [**`ParsedDocument`**](ParsedDocument%20Implementation%20Guide.md) instances
+2. An implementation of **`FileCacheInterface`** for legacy path resolution
```

---

## Implementation Sequence

1. ✅ **Enhancement 1**: File Structure - Update to `.ts`, add type organization
2. ✅ **Enhancement 3**: Pseudocode - Add TypeScript inline note at enrichment
3. ✅ **Enhancement 2**: Data Contracts - Replace JSON Schema with TypeScript interfaces
4. ✅ **Enhancement 4**: Update internal links to match MarkdownParser pattern

---

## Validation Checklist

After enhancements:
- [ ] File Structure shows `.ts` extension (matches MarkdownParser line 106)
- [ ] Type organization shows `types/validationTypes.ts` structure
- [ ] Data Contracts uses TypeScript interfaces (matches MarkdownParser lines 195-347)
- [ ] Discriminated union shown for ValidationMetadata
- [ ] Pseudocode has TypeScript implementation note at line 184 enrichment
- [ ] All internal links use bold+code format: `[**\`Component\`**](file.md)`
- [ ] No links to .archive folder
- [ ] All code from `src/types/validationTypes.ts` and `src/CitationValidator.ts`
- [ ] NO new sections added

---

## Critical Files to Read During Implementation

- `/tools/citation-manager/src/types/validationTypes.ts` - All TypeScript type definitions
- `/tools/citation-manager/src/CitationValidator.ts` (line 184) - Enrichment implementation
- `/tools/citation-manager/design-docs/component-guides/CitationValidator Implementation Guide.md` - Target document
- `/tools/citation-manager/design-docs/component-guides/Markdown Parser Implementation Guide.md` - Pattern reference

---

## Summary

**Goal**: Document TypeScript implementation in existing sections only.

**Approach**: Enhance 4 existing sections - NO new sections.

**Key Changes**:
1. File Structure → Show TypeScript `.ts` + type organization
2. Data Contracts → Replace JSON Schema with TypeScript interfaces
3. Pseudocode → Add inline TypeScript note at enrichment
4. Links → Update to bold+code format, remove .archive

**Constraint Satisfied**: Zero new sections added.
