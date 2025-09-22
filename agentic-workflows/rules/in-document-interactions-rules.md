# Document Highlighted Comments Interaction Instructions

1. **Gather Context**
   - Run `git cpdf` and `git cplsm` to understand recent changes to the target document
   - Read the target document to understand current content and any existing highlights

2. **Add Highlighted Comments**
   - Use proper `<mark class="model-highlight">` markup with required attributes:
     - `data-model="claude-sonnet-4-20250514"`
     - `data-created="YYYY-MM-DDTHH:MM:SS"`
     - `data-modified="YYYY-MM-DDTHH:MM:SS"`
     - `data-id="mark-TIMESTAMP-RANDOM"`
     - `data-group-id="response-YYYYMMDDHHMM"`
     - Wrap entire response with group delimiters:
       - Start: `<!-- group-id:response-YYYYMMDDHHMM -->`
       - End: `<!-- /group-id:response-YYYYMMDDHHMM -->`

3. **Identify Comment Groups and Insertion Points**
   - Scan for user comments (user-highlight marks)
   - Group related user comments together:
     - Comments within bulleted/numbered lists
     - Standalone comments immediately following lists
     - Comments separated by minimal whitespace (1-2 lines)
   - Find insertion point AFTER the last comment in the group
   - Insert response BEFORE the next "approved" (non-highlighted) section
   - For example: respond after final user comment, before next unhighlighted heading/section

4. **Follow Obsidian Formatting Rules**
   - Put `<mark>` tags INSIDE markdown formatting (bold, italic, bullets)
   - Create separate `<mark>` tags for each line/paragraph
   - For code blocks, wrap entire block including fence markers
   - No spaces between adjacent mark tags

5. **Add Comments Below User Content Groups**
   - Never overwrite existing content
   - Identify ALL related user comments in a section
   - Find the LAST user comment in the related group
   - Insert response immediately after that final comment
   - Place response BEFORE the next unhighlighted section/heading
   - Address all user comments in the group as a cohesive response
   - Use local file context to make relevant, specific comments

6. **COMMIT HIGHLIGHTS**
   - When user requests to commit highlights, use the commit_highlights.js script:
     - List available group IDs: `node utility-scripts/commit_highlights.js [file_path] --list`
     - Commit specific group: `node utility-scripts/commit_highlights.js [file_path] [group_id]`
     - Commit all highlights: `node utility-scripts/commit_highlights.js [file_path] --all`
     - Always use `--dry-run` first to preview changes
   - This converts highlighted content to clean, permanent content by removing markup
   - Only commit when user explicitly requests it or when response is complete and approved

7. **STOP**
   - Do not remove or modify existing highlights unless using the commit script
   - Do not use cleanup tools unless explicitly requested

**COMPLIANCE:**

- **CRITICAL**: Comments must be added directly to the target document. No chat-only responses for document interaction requests.
- **CRITICAL**: All comments must be made directly below the user's comment.
- **CRITICAL**: Do not add extra bold formatting around your entire response - use existing markdown formatting only
- **CRITICAL**: When using markdown formatting (bold, italic, bullet points), put `<mark>` tags inside each formatting element
- **CRITICAL**: For fenced code blocks, wrap the entire code block (including fence markers) in a single `<mark>` tag - do NOT put individual `<mark>` tags inside the code block content

**Correct Examples:**

- Single line: `**<mark class="model-highlight" data-model="..." data-created="..." data-modified="...">Bold text here</mark>**`
- Bullet with bold: `• **<mark class="model-highlight" data-model="..." data-created="..." data-modified="...">Tool Name</mark>**<mark class="model-highlight" data-model="..." data-created="..." data-modified="..."> - description text</mark>`
- Multiple lines: Each line gets its own mark tag
- Italic: `*<mark class="model-highlight" data-model="..." data-created="..." data-modified="...">italic text</mark>*`
- Code blocks: `<mark class="model-highlight" data-model="..." data-created="..." data-modified="...">```bash\nnpm install\n```</mark>`
- **CRITICAL**: No spaces between adjacent mark tags - connect them directly: `</mark><mark>` not `</mark> <mark>`

**Incorrect Examples:**

- Outside formatting: `<mark>**text**</mark>` ❌
- Extra bold wrapper: `**<mark>entire response</mark>**` ❌
- Missing marks in bullets: `• **Tool** - description` (no marks) ❌
- Multi-line single mark: `<mark>Line 1\n\nLine 2</mark>` ❌
- Code blocks with internal marks: `bash\n<mark>npm install</mark>\n` ❌
- Spaces between mark tags: `</mark> <mark>` ❌
- This applies to all highlight states (model-highlight, model-highlight-approval-pending, user-highlight)
