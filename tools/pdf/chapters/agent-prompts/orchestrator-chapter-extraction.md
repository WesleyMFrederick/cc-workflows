# Orchestrator: PDF Chapter Extraction

## When to Use

User requests to split a PDF into chapters.

## Workflow

### Step 1: Locate Resources

- **PDF file:** Confirm path exists
- **Working directory:** `/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/pdf`
- **Script:** `scripts/split_chapters.py`
- **Venv:** `.venv/bin/activate`

### Step 2: Extract Bookmarks (Get TOC)

Run this to get accurate chapter page numbers:

```bash
source .venv/bin/activate && python3 -c "
from pypdf import PdfReader

reader = PdfReader('{{PDF_PATH}}')

def print_outline(items, level=0):
    for item in items:
        if isinstance(item, list):
            print_outline(item, level + 1)
        else:
            page = reader.get_destination_page_number(item) + 1
            print(f\"{'  ' * level}{item.title} -> page {page}\")

print_outline(reader.outline)
"
```

### Step 3: Dispatch Sub-Agents (Parallel)

For each chapter, launch a **haiku** Bash sub-agent:

```yaml
Task tool parameters:
- subagent_type: "Bash"
- model: "haiku"
- description: "Extract Chapter N PDF"
- prompt: <see template below>
```

**Sub-agent prompt template:**

```text
Extract Chapter {{N}} from the PDF.

Working directory: /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/cc-workflows/tools/pdf

1. Activate venv: `source .venv/bin/activate`
2. Run Python to extract pages {{START}}-{{END}} (0-indexed: {{START-1}}-{{END-1}}):

from pypdf import PdfReader, PdfWriter
from pathlib import Path

reader = PdfReader("{{PDF_PATH}}")
writer = PdfWriter()

for page_num in range({{START-1}}, {{END}}):
    writer.add_page(reader.pages[page_num])

output_file = Path("chapters") / "Chapter_{{N:02d}}_{{TITLE_SLUG}}.pdf"
with open(output_file, "wb") as f:
    writer.write(f)
print(f"Created: {output_file}")

3. Verify with `ls -la chapters/`
```

### Step 4: Verify Results

After all sub-agents complete:

```bash
ls -la chapters/
```

## Page Range Calculation

- Chapter N starts at PDF page `START`
- Chapter N ends at `NEXT_CHAPTER_START - 1`
- pypdf uses 0-indexed: `range(START-1, NEXT_CHAPTER_START-1)`

## Example Dispatch

For chapters 2-5 from "Domain Modeling Made Functional":

| Chapter | Title | Start | End | 0-indexed range |
|---------|-------|-------|-----|-----------------|
| 2 | Understanding the Domain | 39 | 56 | range(38, 56) |
| 3 | A Functional Architecture | 57 | 69 | range(56, 69) |
| 4 | Understanding Types | 71 | 87 | range(70, 87) |
| 5 | Domain Modeling with Types | 88 | 113 | range(87, 113) |

Launch all 4 sub-agents in parallel using a single message with multiple Task tool calls.
