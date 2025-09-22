# Document Sharding Task

**FIRST:** Load `.bmad-core/core-config.yaml` and extract `paths.outputBase` and `paths.featurePrefix` values to construct file paths.

## Purpose

- Split a large document into multiple smaller documents based on level 2 sections
- Create a folder structure to organize the sharded documents
- Maintain all content integrity including code blocks, diagrams, and markdown formatting

## Primary Method: Automatic with LlamaIndex MarkdownNodeParser

[[LLM: First, check if markdownExploder is set to true in {{paths.bmadCore}}/core-config.yaml. If it is, attempt to use the LlamaIndex MarkdownNodeParser to split the document programmatically.

If the splitting succeeds, inform the user in chat window that the document has been sharded successfully and STOP - do not proceed further.

If the command fails (especially with an error indicating the package is not available), inform the user in chat window: "The markdownExploder setting is enabled but the @llamaindex/core package is not available. Please either:

1. Install @llamaindex/core with: `npm install @llamaindex/core`
2. Or set markdownExploder to false in {{paths.bmadCore}}/core-config.yaml

**IMPORTANT: STOP HERE - do not proceed with manual sharding until one of the above actions is taken.**"

If markdownExploder is set to false, inform the user in chat window: "The markdownExploder setting is currently false. For better performance and reliability, you should:

1. Set markdownExploder to true in {{paths.bmadCore}}/core-config.yaml
2. Install @llamaindex/core with: `npm install @llamaindex/core`

I will now proceed with the manual sharding process."

Then proceed with the manual method below ONLY if markdownExploder is false.]]

### Installation and Usage

1. **Install the modern package**:

   ```bash
   npm install @llamaindex/core
   ```

2. **CLI Usage** (via shard-markdown.js script):

   ```bash
   # Basic usage (index-based filenames)
   node utility-scripts/shard-markdown.js ${outputBase}/${featurePrefix}/prd.md ${outputBase}/${featurePrefix}/prd/

   # Use heading text for filenames (recommended)
   node utility-scripts/shard-markdown.js ${outputBase}/${featurePrefix}/prd.md ${outputBase}/${featurePrefix}/prd/ --use-headings

   # Custom prefix with headings
   node utility-scripts/shard-markdown.js ${outputBase}/${featurePrefix}/architecture.md ${outputBase}/${featurePrefix}/architecture/ --use-headings --prefix arch

   # For any document with custom options
   node utility-scripts/shard-markdown.js [source-document] [destination-folder] [options]
   ```

3. **Available Options**:
   - `--use-headings`: Generate filenames from heading text (e.g., "tech-stack.md")
   - `--prefix <name>`: Add custom prefix to filenames
   - `--start-index <n>`: Starting number for indexed files (default: 1)
   - `--help`: Show complete usage information

4. **What it does**:
   - Automatically splits the document by semantic sections based on headings
   - Creates properly named files based on heading content or index
   - Generates an index.md file with links to all sections
   - Handles all edge cases with code blocks and special markdown
   - Uses modern 2025 LlamaIndex MarkdownNodeParser architecture

If the user has @llamaindex/core installed, use this CLI script approach and skip the manual process below.

---

## Manual Method (if @llamaindex/core is not available or user indicated manual method)

### Task Instructions

1. Identify Document and Target Location

- Determine which document to shard (user-provided path)
- Create a new folder under `${outputBase}/${featurePrefix}/` with the same name as the document (without extension)
- Example: `${outputBase}/${featurePrefix}/prd.md` → create folder `${outputBase}/${featurePrefix}/prd/`

2. Parse and Extract Sections

CRITICAL AEGNT SHARDING RULES:

1. Read the entire document content
2. Identify all level 2 sections (## headings)
3. For each level 2 section:
   - Extract the section heading and ALL content until the next level 2 section
   - Include all subsections, code blocks, diagrams, lists, tables, etc.
   - Be extremely careful with:
     - Fenced code blocks (```) - ensure you capture the full block including closing backticks and account for potential misleading level 2's that are actually part of a fenced section example
     - Mermaid diagrams - preserve the complete diagram syntax
     - Nested markdown elements
     - Multi-line content that might contain ## inside code blocks

CRITICAL: Use proper parsing that understands markdown context. A ## inside a code block is NOT a section header.]]

### 3. Create Individual Files

For each extracted section:

1. **Generate filename**: Convert the section heading to lowercase-dash-case
   - Remove special characters
   - Replace spaces with dashes
   - Example: "## Tech Stack" → `tech-stack.md`

2. **Adjust heading levels**:
   - The level 2 heading becomes level 1 (# instead of ##) in the sharded new document
   - All subsection levels decrease by 1:

   ```txt
     - ### → ##
     - #### → ###
     - ##### → ####
     - etc.
   ```

3. **Write content**: Save the adjusted content to the new file

### 4. Create Index File

Create an `index.md` file in the sharded folder that:

1. Contains the original level 1 heading and any content before the first level 2 section
2. Lists all the sharded files with links:

```markdown
# Original Document Title

[Original introduction content if any]

## Sections

- [Section Name 1](./section-name-1.md)
- [Section Name 2](./section-name-2.md)
- [Section Name 3](./section-name-3.md)
  ...
```

### 5. Preserve Special Content

1. **Code blocks**: Must capture complete blocks including:

   ```language
   content
   ```

2. **Mermaid diagrams**: Preserve complete syntax:

   ```mermaid
   graph TD
   ...
   ```

3. **Tables**: Maintain proper markdown table formatting

4. **Lists**: Preserve indentation and nesting

5. **Inline code**: Preserve backticks

6. **Links and references**: Keep all markdown links intact

7. **Template markup**: If documents contain {{placeholders}} ,preserve exactly

### 6. Validation

After sharding:

1. Verify all sections were extracted
2. Check that no content was lost
3. Ensure heading levels were properly adjusted
4. Confirm all files were created successfully

### 7. Report Results

Update/Save detailed sharding summary to task completion report file using this format:

```text
Document sharded successfully:
- Source: [original document path]
- Destination: ${outputBase}/${featurePrefix}/[folder-name]/
- Files created: [count]
- Sections:
  - section-name-1.md: "Section Title 1"
  - section-name-2.md: "Section Title 2"
  ...
```

## Important Notes

- Never modify the actual content, only adjust heading levels
- Preserve ALL formatting, including whitespace where significant
- Handle edge cases like sections with code blocks containing ## symbols
- Ensure the sharding is reversible (could reconstruct the original from shards)
