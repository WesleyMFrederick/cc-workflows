#!/usr/bin/env python3
"""
Convert PDF to Markdown with tables and images.

Requires: pip install pdfplumber pypdfium2

Usage:
    python pdf_to_markdown.py <input.pdf> <output.md> [--images-dir <dir>]
"""

import argparse
import sys
from pathlib import Path

import pdfplumber
import pypdfium2 as pdfium


def extract_images(pdf_path: Path, output_dir: Path, base_name: str) -> list[tuple[int, str]]:
    """
    Extract images from PDF using pypdfium2.

    Args:
        pdf_path: Path to the PDF file
        output_dir: Directory to save extracted images
        base_name: Base name for image files

    Returns:
        List of (page_number, image_filename) tuples
    """
    from pypdfium2._helpers.pageobjects import PdfImage

    images = []
    output_dir.mkdir(parents=True, exist_ok=True)

    pdf = pdfium.PdfDocument(str(pdf_path))

    for page_idx in range(len(pdf)):
        page = pdf[page_idx]
        img_count = 0

        # Iterate through page objects looking for images
        for obj in page.get_objects():
            if isinstance(obj, PdfImage):
                img_count += 1
                try:
                    # Get the image bitmap
                    bitmap = obj.get_bitmap()
                    img_filename = f"{base_name}_p{page_idx + 1}_img{img_count}.png"
                    img_path = output_dir / img_filename

                    # Save image
                    pil_image = bitmap.to_pil()
                    pil_image.save(str(img_path))

                    images.append((page_idx + 1, img_filename))
                    print(f"  Extracted: {img_filename}")
                except Exception as e:
                    print(f"  Warning: Could not extract image on page {page_idx + 1}: {e}")

    pdf.close()
    return images


def table_to_markdown(table: list[list]) -> str:
    """
    Convert a pdfplumber table to markdown format.

    Args:
        table: 2D list of cell values

    Returns:
        Markdown-formatted table string
    """
    if not table or not table[0]:
        return ""

    # Clean cells - replace None with empty string, strip whitespace
    clean_table = []
    for row in table:
        clean_row = []
        for cell in row:
            if cell is None:
                clean_row.append("")
            else:
                # Replace newlines with spaces, strip whitespace
                clean_row.append(str(cell).replace("\n", " ").strip())
        clean_table.append(clean_row)

    # Build markdown table
    lines = []

    # Header row
    header = clean_table[0]
    lines.append("| " + " | ".join(header) + " |")

    # Separator row
    lines.append("| " + " | ".join(["---"] * len(header)) + " |")

    # Data rows
    for row in clean_table[1:]:
        # Ensure row has same number of columns as header
        while len(row) < len(header):
            row.append("")
        lines.append("| " + " | ".join(row[: len(header)]) + " |")

    return "\n".join(lines)


def extract_page_content(page, page_num: int) -> tuple[str, list[str]]:
    """
    Extract text and tables from a single page.

    Args:
        page: pdfplumber page object
        page_num: Page number (1-indexed)

    Returns:
        Tuple of (markdown_content, list_of_table_markdowns)
    """
    # Extract text
    text = page.extract_text() or ""

    # Extract tables
    tables = page.extract_tables()
    table_markdowns = []

    for table in tables:
        if table:
            md_table = table_to_markdown(table)
            if md_table:
                table_markdowns.append(md_table)

    return text, table_markdowns


def pdf_to_markdown(
    pdf_path: Path,
    output_path: Path,
    images_dir: Path | None = None,
    extract_imgs: bool = True,
) -> None:
    """
    Convert PDF to Markdown.

    Args:
        pdf_path: Path to input PDF
        output_path: Path for output markdown file
        images_dir: Directory for extracted images (default: output_dir/assets)
        extract_imgs: Whether to extract images
    """
    print(f"Converting: {pdf_path.name}")

    # Set up paths
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if images_dir is None:
        images_dir = output_path.parent / "assets"

    base_name = pdf_path.stem

    # Extract images first
    images = []
    if extract_imgs:
        print("Extracting images...")
        images = extract_images(pdf_path, images_dir, base_name)
        print(f"  Found {len(images)} images")

    # Create image lookup by page
    images_by_page = {}
    for page_num, filename in images:
        if page_num not in images_by_page:
            images_by_page[page_num] = []
        images_by_page[page_num].append(filename)

    # Extract text and tables
    print("Extracting text and tables...")
    markdown_parts = []

    # Add document title
    markdown_parts.append(f"# {base_name.replace('_', ' ')}\n")

    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"  Processing {total_pages} pages...")

        for page_idx, page in enumerate(pdf.pages):
            page_num = page_idx + 1

            text, tables = extract_page_content(page, page_num)

            # Add page marker (as HTML comment for reference)
            markdown_parts.append(f"\n<!-- Page {page_num} -->\n")

            # Add text content
            if text:
                markdown_parts.append(text)

            # Add tables
            for table_md in tables:
                markdown_parts.append(f"\n{table_md}\n")

            # Add image references for this page
            if page_num in images_by_page:
                for img_file in images_by_page[page_num]:
                    rel_path = f"assets/{img_file}"
                    markdown_parts.append(f"\n![{img_file}]({rel_path})\n")

    # Write output
    content = "\n".join(markdown_parts)
    output_path.write_text(content)
    print(f"Written: {output_path}")
    print(f"  Size: {len(content):,} characters")


def main():
    parser = argparse.ArgumentParser(
        description="Convert PDF to Markdown with tables and images"
    )
    parser.add_argument("input", type=Path, help="Input PDF file")
    parser.add_argument("output", type=Path, help="Output markdown file")
    parser.add_argument(
        "--images-dir",
        type=Path,
        help="Directory for extracted images (default: output_dir/assets)",
    )
    parser.add_argument(
        "--no-images",
        action="store_true",
        help="Skip image extraction",
    )

    args = parser.parse_args()

    if not args.input.exists():
        print(f"Error: Input file not found: {args.input}")
        sys.exit(1)

    pdf_to_markdown(
        pdf_path=args.input,
        output_path=args.output,
        images_dir=args.images_dir,
        extract_imgs=not args.no_images,
    )


if __name__ == "__main__":
    main()
