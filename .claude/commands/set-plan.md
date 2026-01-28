---
name: set-plan
description: Manually register any file as the active plan for session tracking
arguments:
  - name: path
    description: Path to the plan file (absolute or relative)
    required: true
---

# Set Active Plan

Register the specified file as this session's active plan in `current-status.json`.

## Instructions

1. **Validate** the file exists at the given path
2. **Resolve** to absolute path if relative
3. **Detect plan type** from filename:
   - `whiteboard` → "Discovery:"
   - `prd` or `requirements` → "Requirements:"
   - `design` → "Design:"
   - `sequencing` → "Sequence:"
   - `implement` → "Implement:"
   - Default → "Plan:"
4. **Extract focus** from first H1 header in file
5. **Update** `current-status.json` for this session:
   - Set `plan_path` to absolute file path
   - Set `focus` to "{Type}: {H1 title}"

## Example

Input: `/set-plan tools/citation-manager/design-docs/features/20251119-type-contract-restoration/typescript-migration-sequencing.md`

Result in `current-status.json`:

```json
{
  "plan_path": "/Users/.../typescript-migration-sequencing.md",
  "focus": "Sequence: TypeScript Migration - Sequencing"
}
```
