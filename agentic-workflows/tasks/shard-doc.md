---
type: task
task-name: shard-document
description: Split large documents into multiple smaller documents based on level 2 sections
required-inputs:
  - name: config-file
    path: agentic-workflows/config.yaml
    description: 'Project agentic workflows configuration file'
    validation: file-exists
---

# Document Sharding Task

**FIRST:** Load {{required-inputs.config-file.path}} and extract `outputBase` and `featurePrefix` values to construct file paths.

## Purpose

Split a large document into multiple smaller documents based on level 2 sections using the automated shard-markdown.js utility script.

## Usage

### Config-Based Mode (Recommended)

Uses paths from `agentic-workflows/config.yaml`:

```bash
# Shard PRD document
node agentic-workflows/utility-scripts/shard-markdown.js --doc prd --use-headings

# Shard architecture document
node agentic-workflows/utility-scripts/shard-markdown.js --doc architecture --use-headings --prefix arch
```

The script automatically resolves:
- **Source**: `${outputBase}/${featurePrefix}/prd.md` or `architecture.md`
- **Destination**: `${outputBase}/${featurePrefix}/prd/` or `architecture/`

### Manual Mode

Pass source and destination paths directly:

```bash
# Basic usage
node agentic-workflows/utility-scripts/shard-markdown.js /path/to/document.md /path/to/output/

# With heading-based filenames (recommended)
node agentic-workflows/utility-scripts/shard-markdown.js /path/to/document.md /path/to/output/ --use-headings

# With custom prefix
node agentic-workflows/utility-scripts/shard-markdown.js /path/to/document.md /path/to/output/ --use-headings --prefix myprefix
```

## What It Does

1. **Parses** markdown document into Level 2 sections (`## headings`)
2. **Creates** individual files for each section with adjusted heading levels:
   - `## Section` becomes `# Section` in the new file
   - `### Subsection` becomes `## Subsection`
3. **Generates** filenames from heading text (kebab-case) when `--use-headings` is used
4. **Creates** `index.md` with links to all sharded files
5. **Preserves** all markdown formatting, code blocks, and special content

## File Organization

After sharding `${outputBase}/${featurePrefix}/prd.md`:

```text
${outputBase}/${featurePrefix}/prd/
├── index.md              # Main index with links
├── introduction.md       # From "## Introduction"
├── tech-stack.md        # From "## Tech Stack"
├── user-requirements.md # From "## User Requirements"
└── ...
```

## Options

- `--use-headings`: Generate filenames from heading text (recommended)
- `--prefix <name>`: Add prefix to all filenames
- `--start-index <n>`: Starting number for indexed files (default: 1)
- `--help`: Show complete usage information

## Validation

After sharding, verify:
1. All Level 2 sections were extracted as separate files
2. Heading levels were properly adjusted
3. `index.md` contains links to all sections
4. No content was lost during the process

## Report Results

Document completion with:

```text
Document sharded successfully:
- Source: ${outputBase}/${featurePrefix}/[document-name]
- Destination: ${outputBase}/${featurePrefix}/[folder-name]/
- Files created: [count] (including index.md)
- Sections:
  - introduction.md: "Introduction"
  - tech-stack.md: "Tech Stack"
  - ...
```
