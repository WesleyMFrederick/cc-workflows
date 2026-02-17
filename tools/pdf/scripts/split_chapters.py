#!/usr/bin/env python3
"""
Segment a PDF into multiple PDFs by chapter.
Prioritizes PDF bookmarks/outline, falls back to text pattern matching.

Requires: pip install pypdf pdfplumber
"""

import re
import sys
from pathlib import Path

import pdfplumber
from pypdf import PdfReader, PdfWriter


def extract_chapters_from_bookmarks(pdf_path, chapter_pattern=r'^(\d+)\.|^Ch(apter)?\s*\d+'):
    """
    Extract chapter info from PDF bookmarks/outline.

    Args:
        pdf_path: Path to the PDF file
        chapter_pattern: Regex to identify chapter entries (vs parts, sections)

    Returns:
        List of tuples: [(chapter_name, start_page), ...] or empty if no bookmarks
    """
    reader = PdfReader(pdf_path)

    if not reader.outline:
        return []

    chapters = []

    def process_outline(items, level=0):
        for item in items:
            if isinstance(item, list):
                # Nested items (subsections) - recurse but skip for chapter extraction
                process_outline(item, level + 1)
            else:
                try:
                    title = item.title.strip()
                    page_num = reader.get_destination_page_number(item)

                    # Only capture top-level chapter entries (level 1 typically)
                    # Match patterns like "1. Title", "Chapter 1", "Ch 1"
                    if level == 1 and re.match(chapter_pattern, title, re.IGNORECASE):
                        chapters.append((title, page_num))
                        print(f"Bookmark: {title} -> page {page_num + 1}")
                except Exception:
                    pass

    process_outline(reader.outline)
    return chapters


def detect_chapters_from_text(pdf_path, chapter_pattern=r'^Chapter \d+|^CHAPTER \d+'):
    """
    Fallback: Detect chapters by scanning page text for headings.

    Args:
        pdf_path: Path to the PDF file
        chapter_pattern: Regex pattern to match chapter headings

    Returns:
        List of tuples: [(chapter_name, start_page), ...]
    """
    chapters = []

    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if not text:
                continue

            lines = text.split('\n')[:5]
            for line in lines:
                if re.match(chapter_pattern, line.strip(), re.IGNORECASE):
                    chapters.append((line.strip(), i))
                    print(f"Text match: {line.strip()} on page {i + 1}")
                    break

    return chapters


def split_pdf_by_chapters(pdf_path, chapters, output_dir=None):
    """
    Split PDF into separate files by chapter.

    Args:
        pdf_path: Path to the PDF file
        chapters: List of (chapter_name, start_page) tuples
        output_dir: Directory to save chapter PDFs
    """
    pdf_path = Path(pdf_path)
    output_dir = Path(output_dir) if output_dir else pdf_path.parent / "chapters"
    output_dir.mkdir(exist_ok=True)

    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)

    # Calculate page ranges
    chapter_ranges = []
    for i, (name, start) in enumerate(chapters):
        end = chapters[i + 1][1] if i + 1 < len(chapters) else total_pages
        chapter_ranges.append((name, start, end))

    # Create separate PDF for each chapter
    for idx, (chapter_name, start_page, end_page) in enumerate(chapter_ranges, 1):
        writer = PdfWriter()

        for page_num in range(start_page, end_page):
            writer.add_page(reader.pages[page_num])

        # Clean filename
        safe_name = re.sub(r'[^\w\s-]', '', chapter_name).strip().replace(' ', '_')
        output_file = output_dir / f"Chapter_{idx:02d}_{safe_name}.pdf"

        with open(output_file, "wb") as output:
            writer.write(output)

        print(f"Created: {output_file} (pages {start_page + 1}-{end_page})")


def main():
    if len(sys.argv) < 2:
        print("Usage: python split_chapters.py <pdf_file> [output_dir]")
        print("Example: python split_chapters.py book.pdf ./chapters/")
        sys.exit(1)

    pdf_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None

    print(f"Analyzing: {pdf_file}\n")

    # Try bookmarks first (most reliable)
    print("Attempting bookmark extraction...")
    chapters = extract_chapters_from_bookmarks(pdf_file)

    if chapters:
        print(f"\nFound {len(chapters)} chapters from bookmarks")
    else:
        # Fallback to text pattern matching
        print("No bookmarks found, falling back to text pattern matching...")
        chapters = detect_chapters_from_text(pdf_file)

        if chapters:
            print(f"\nFound {len(chapters)} chapters from text patterns")
        else:
            print("No chapters found! Check PDF structure.")
            sys.exit(1)

    split_pdf_by_chapters(pdf_file, chapters, output_dir)
    print("\nDone!")


if __name__ == "__main__":
    main()
