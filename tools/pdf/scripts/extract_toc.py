#!/usr/bin/env python3
"""
Extract table of contents from a PDF.
Requires: pip install pdfplumber
"""

import sys
from pathlib import Path

import pdfplumber


def extract_toc(pdf_path, start_page=1, end_page=None):
    """
    Extract table of contents from specified page range.

    Args:
        pdf_path: Path to the PDF file
        start_page: First page to extract (1-indexed)
        end_page: Last page to extract (1-indexed, None = auto-detect)

    Returns:
        Extracted text from TOC pages
    """
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)

        # Convert to 0-indexed
        start_idx = start_page - 1
        end_idx = end_page if end_page else min(start_page + 10, total_pages)

        print(f"PDF: {Path(pdf_path).name}")
        print(f"Total pages: {total_pages}")
        print(f"Extracting TOC from pages {start_page}-{end_idx}\n")
        print("=" * 80)

        toc_text = []
        for i in range(start_idx, end_idx):
            if i >= total_pages:
                break

            text = pdf.pages[i].extract_text()
            if text:
                print(f"\n--- Page {i+1} ---\n")
                print(text)
                toc_text.append(text)

        return "\n\n".join(toc_text)


def main():
    if len(sys.argv) < 2:
        print("Usage: python extract_toc.py <pdf_file> [start_page] [end_page]")
        print("Example: python extract_toc.py book.pdf 7 10")
        sys.exit(1)

    pdf_file = sys.argv[1]
    start_page = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    end_page = int(sys.argv[3]) if len(sys.argv) > 3 else None

    extract_toc(pdf_file, start_page, end_page)


if __name__ == "__main__":
    main()
