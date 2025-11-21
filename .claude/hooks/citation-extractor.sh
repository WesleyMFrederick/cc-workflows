#!/usr/bin/env bash
# citation-extractor.sh - Extracts citation content after reading markdown files
#
# SYNOPSIS
#   citation-extractor.sh
#
# DESCRIPTION
#   Automatically runs citation-manager extract links on markdown files after Read operations.
#   Injects extracted content as context for Claude via JSON hookSpecificOutput.
#   Receives hook input via stdin from Claude Code PostToolUse event.
#
#   Uses session-based caching to avoid re-extracting the same file multiple times
#   within a conversation (session_id + file_path tracking).
#
# EXIT CODES
#   0 - Always (non-blocking, context injection only)

set +e  # Don't exit on errors - we control exit codes

# Cache directory for tracking extracted files per session
# Use .citation-manager in project root for cache
CACHE_DIR=".citation-manager/claude-cache"
mkdir -p "$CACHE_DIR" 2>/dev/null || true

# Check if jq is available
if ! command -v jq &> /dev/null; then
    exit 0  # Silently skip if jq not available
fi

# Check if citation-manager is available
if ! command -v citation-manager &> /dev/null; then
    exit 0  # Silently skip if citation-manager not available
fi

# Read JSON input from stdin
if [[ -t 0 ]]; then
    # No stdin available (not running as a hook)
    exit 0
fi

# Parse hook input
json_input=$(cat)

# Extract session_id and file path from hook input
session_id=$(echo "$json_input" | jq -r '.session_id // empty' 2>/dev/null)
file_path=$(echo "$json_input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

# Check if we got required data
if [[ -z "$file_path" || "$file_path" == "null" ]]; then
    exit 0
fi

if [[ -z "$session_id" || "$session_id" == "null" ]]; then
    # No session_id available, skip caching
    session_id="no-session"
fi

# Create cache key: session_id + file_path hash
cache_key="${session_id}_$(echo -n "$file_path" | md5 2>/dev/null || echo -n "$file_path" | shasum -a 256 | cut -d' ' -f1)"
cache_file="${CACHE_DIR}/${cache_key}"

# Check if we've already extracted this file in this session
if [[ -f "$cache_file" ]]; then
    # Already extracted in this session - exit silently
    exit 0
fi

# Check if the file is a markdown file
if [[ ! "$file_path" =~ \.md$ ]]; then
    exit 0
fi

# Check if file exists
if [[ ! -f "$file_path" ]]; then
    exit 0
fi

# Run citation-manager extract links and filter to extractedContentBlocks
extracted_content=$(citation-manager extract links "$file_path" 2>/dev/null | jq '.extractedContentBlocks' 2>/dev/null)

# Check if extraction succeeded and has content
if [[ -z "$extracted_content" || "$extracted_content" == "null" || "$extracted_content" == "{}" ]]; then
    # No citations found or extraction failed - exit silently
    exit 0
fi

# Format the extracted content for Claude
# Filter out _totalContentCharacterLength and format remaining blocks
formatted_content=$(echo "$extracted_content" | jq -r 'to_entries | map(select(.key != "_totalContentCharacterLength")) | map("## Citation: \(.key)\n\n\(.value.content)\n") | join("\n---\n\n")' 2>/dev/null)

if [[ -z "$formatted_content" || "$formatted_content" == "null" ]]; then
    exit 0
fi

# Mark this file as extracted in this session
touch "$cache_file" 2>/dev/null || true

# Output JSON with hookSpecificOutput for context injection
jq -n \
  --arg content "$formatted_content" \
  '{
    "hookSpecificOutput": {
      "hookEventName": "PostToolUse",
      "additionalContext": $content
    }
  }'

exit 0
