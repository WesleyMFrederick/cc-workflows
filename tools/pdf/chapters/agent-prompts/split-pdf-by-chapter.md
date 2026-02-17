# Split PDF by Chapter - Agent Prompt

## Task

Extract chapters from a PDF into separate PDF files.

## Inputs

- **PDF Path:** `{{PDF_PATH}}`
- **Output Dir:** `{{OUTPUT_DIR}}` (defaults to `./chapters/`)
- **Chapters to Extract:** `{{CHAPTER_LIST}}` (e.g., "1,2,3" or "all")

## Instructions

### Option 1: Use the Script (Recommended)

```bash
source .venv/bin/activate
python scripts/split_chapters.py "{{PDF_PATH}}" "{{OUTPUT_DIR}}"
```

The script automatically:

1. Tries PDF bookmarks first (most accurate)
2. Falls back to text pattern matching if no bookmarks
3. Creates `Chapter_01_Title.pdf`, `Chapter_02_Title.pdf`, etc.

### Option 2: Manual Single Chapter Extraction

If extracting specific chapters with known page ranges:

```python
from pypdf import PdfReader, PdfWriter
from pathlib import Path

reader = PdfReader("{{PDF_PATH}}")
writer = PdfWriter()

# Pages are 0-indexed in pypdf
start_page = START_PDF_PAGE - 1  # Convert 1-indexed to 0-indexed
end_page = END_PDF_PAGE          # Exclusive end

for page_num in range(start_page, end_page):
    writer.add_page(reader.pages[page_num])

output_file = Path("{{OUTPUT_DIR}}") / "Chapter_{{NUM:02d}}_{{TITLE_SLUG}}.pdf"
with open(output_file, "wb") as f:
    writer.write(f)
```

### Option 3: Extract Bookmarks First

To get accurate page numbers before extraction:

```python
from pypdf import PdfReader

reader = PdfReader("{{PDF_PATH}}")

def print_outline(items, level=0):
    for item in items:
        if isinstance(item, list):
            print_outline(item, level + 1)
        else:
            page = reader.get_destination_page_number(item) + 1
            print(f"{'  ' * level}{item.title} -> page {page}")

print_outline(reader.outline)
```

## Page Number Notes

- **PDF bookmarks** give 0-indexed page numbers; add 1 for display
- **pypdf** uses 0-indexed pages; `range(16, 38)` = pages 17-38 inclusive
- **Chapter N ends** at (next chapter's start page - 1)

## Verification

After extraction: `ls -la {{OUTPUT_DIR}}/`
