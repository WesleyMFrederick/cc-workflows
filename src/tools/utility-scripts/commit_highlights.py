#!/usr/bin/env python3
"""Commit Highlights Tool for LLM-Generated Content

This script removes <mark> tags from specified group IDs while preserving the content inside.
Designed for Task agents and LLMs to commit their approved highlights in walkthrough documents.

Usage:
    python commit_highlights.py <file_path> <group_id>
    python commit_highlights.py <file_path> --all

Examples:
    python commit_highlights.py interceptor-ts-deep-dive.md response-20250623103000
    python commit_highlights.py walkthrough-claude-trace-development.md --all

"""

import argparse
import re
import sys
from pathlib import Path


def remove_group_highlights(content: str, group_id: str) -> str:
    """Remove all <mark> tags for a specific group ID while preserving content.
    
    Args:
        content: File content as string
        group_id: The group ID to remove (e.g., "response-20250623103000")
    
    Returns:
        Content with specified group's mark tags removed

    """
    # Remove HTML comment delimiters for the group
    content = re.sub(rf"<!-- group-id:{re.escape(group_id)} -->\n?", "", content)
    content = re.sub(rf"<!-- /group-id:{re.escape(group_id)} -->\n?", "", content)

    # Remove mark tags with the specific group ID, preserving content
    pattern = rf'<mark[^>]*data-group-id="{re.escape(group_id)}"[^>]*>(.*?)</mark>'
    content = re.sub(pattern, r"\1", content, flags=re.DOTALL)

    return content

def remove_all_highlights(content: str) -> str:
    """Remove ALL <mark> tags while preserving content.
    
    Args:
        content: File content as string
    
    Returns:
        Content with all mark tags removed

    """
    # Remove all HTML comment group delimiters
    content = re.sub(r"<!-- group-id:[^>]+ -->\n?", "", content)
    content = re.sub(r"<!-- /group-id:[^>]+ -->\n?", "", content)

    # Remove all mark tags, preserving content
    content = re.sub(r"<mark[^>]*>(.*?)</mark>", r"\1", content, flags=re.DOTALL)

    return content

def find_group_ids(content: str) -> list:
    """Find all group IDs in the content.
    
    Args:
        content: File content as string
    
    Returns:
        List of group IDs found in the content

    """
    pattern = r'data-group-id="([^"]+)"'
    matches = re.findall(pattern, content)
    return list(set(matches))  # Remove duplicates

def main():
    parser = argparse.ArgumentParser(
        description="Remove <mark> tags from LLM-generated content while preserving text",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s interceptor-ts-deep-dive.md response-20250623103000
  %(prog)s walkthrough-claude-trace-development.md --all
  %(prog)s --list interceptor-ts-deep-dive.md
        """
    )

    parser.add_argument("file_path", help="Path to the markdown file")
    parser.add_argument("group_id", nargs="?", help="Group ID to commit (e.g., response-20250623103000)")
    parser.add_argument("--all", action="store_true", help="Remove all highlight marks")
    parser.add_argument("--list", action="store_true", help="List all group IDs in the file")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be changed without modifying file")

    args = parser.parse_args()

    # Validate file path
    file_path = Path(args.file_path)
    if not file_path.exists():
        print(f"Error: File {file_path} does not exist")
        sys.exit(1)

    # Read file content
    try:
        with open(file_path, encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)

    # List group IDs if requested
    if args.list:
        group_ids = find_group_ids(content)
        if group_ids:
            print("Found group IDs:")
            for gid in sorted(group_ids):
                print(f"  - {gid}")
        else:
            print("No group IDs found in file")
        return

    # Validate arguments
    if not args.all and not args.group_id:
        print("Error: Must specify either a group_id or --all")
        parser.print_help()
        sys.exit(1)

    if args.all and args.group_id:
        print("Error: Cannot specify both group_id and --all")
        sys.exit(1)

    # Process content
    if args.all:
        print(f"Removing ALL highlight marks from {file_path}")
        new_content = remove_all_highlights(content)
    else:
        print(f"Removing highlights for group '{args.group_id}' from {file_path}")
        new_content = remove_group_highlights(content, args.group_id)

    # Check if any changes were made
    if content == new_content:
        if args.all:
            print("No highlight marks found to remove")
        else:
            print(f"No highlights found for group '{args.group_id}'")
        return

    # Show changes or write file
    if args.dry_run:
        print("\n--- CHANGES (dry run) ---")
        # Simple diff indication
        original_marks = len(re.findall(r"<mark[^>]*>", content))
        new_marks = len(re.findall(r"<mark[^>]*>", new_content))
        print(f"Would remove {original_marks - new_marks} mark tags")

        # Show sample of what would be removed
        if args.group_id:
            pattern = rf'<mark[^>]*data-group-id="{re.escape(args.group_id)}"[^>]*>'
            sample_marks = re.findall(pattern, content)
            if sample_marks:
                print(f"Sample mark to be removed: {sample_marks[0][:100]}...")
    else:
        # Write the modified content back to file
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_content)

            original_marks = len(re.findall(r"<mark[^>]*>", content))
            new_marks = len(re.findall(r"<mark[^>]*>", new_content))
            print(f"✅ Successfully removed {original_marks - new_marks} mark tags")

        except Exception as e:
            print(f"Error writing file: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()
