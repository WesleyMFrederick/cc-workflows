#!/bin/bash
# Filter specific tools from mcporter server output
# Usage: ./mcp-filter-tools.sh <server-name> <tool-to-filter> [tool2] [tool3]...

set -e

SERVER=$1
shift

if [ -z "$SERVER" ]; then
  echo "Usage: $0 <server-name> <tool-to-filter> [tool2...]"
  echo "Example: $0 perplexity deep_research"
  exit 1
fi

# Build jq filter expression
FILTER=".tools |= map(select("
for tool in "$@"; do
  FILTER+=" .name != \"$tool\" and"
done
FILTER="${FILTER% and})" # Remove trailing 'and'
FILTER+=")"

# Run mcporter and filter
npx mcporter list "$SERVER" --json | jq "$FILTER"