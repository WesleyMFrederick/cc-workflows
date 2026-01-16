#!/usr/bin/env bash

# Script to calculate a date by adding/subtracting days from an event date
# Usage: calculate-event-date.sh <event-date> <offset>
# Example: calculate-event-date.sh "2026-02-17" "-60"

set -e

# Function to display usage
usage() {
    echo "Usage: $0 <event-date> <offset>"
    echo "  event-date: Date in YYYY-MM-DD format"
    echo "  offset: Signed integer for days to add/subtract (e.g., -60, +15)"
    echo ""
    echo "Examples:"
    echo "  $0 \"2026-02-17\" \"-60\"  # Subtract 60 days"
    echo "  $0 \"2026-02-17\" \"+15\"  # Add 15 days"
    exit 1
}

# Validate number of arguments
if [ $# -ne 2 ]; then
    echo "Error: Expected 2 arguments, got $#" >&2
    usage
fi

EVENT_DATE="$1"
OFFSET="$2"

# Validate date format (YYYY-MM-DD)
if ! [[ $EVENT_DATE =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo "Error: Invalid date format. Expected YYYY-MM-DD, got: $EVENT_DATE" >&2
    exit 1
fi

# Validate offset is a signed integer
if ! [[ $OFFSET =~ ^[+-]?[0-9]+$ ]]; then
    echo "Error: Invalid offset. Expected signed integer (e.g., -60, +15), got: $OFFSET" >&2
    exit 1
fi

# Strip leading + if present (for consistency)
OFFSET=${OFFSET#+}

# Cross-platform date calculation using GNU date or BSD date
calculate_date() {
    local event_date="$1"
    local offset="$2"

    # Detect OS type
    if date --version >/dev/null 2>&1; then
        # GNU date (Linux)
        date -d "$event_date $offset days" +%Y-%m-%d
    else
        # BSD date (macOS)
        # Convert offset to the format BSD date expects
        if [ "$offset" -ge 0 ]; then
            date -j -v+${offset}d -f "%Y-%m-%d" "$event_date" +%Y-%m-%d
        else
            # Remove negative sign for BSD date
            local abs_offset=${offset#-}
            date -j -v-${abs_offset}d -f "%Y-%m-%d" "$event_date" +%Y-%m-%d
        fi
    fi
}

# Validate that the date exists
if ! date -j -f "%Y-%m-%d" "$EVENT_DATE" >/dev/null 2>&1 && \
   ! date -d "$EVENT_DATE" >/dev/null 2>&1; then
    echo "Error: Invalid date: $EVENT_DATE" >&2
    exit 1
fi

# Calculate and output the result
RESULT=$(calculate_date "$EVENT_DATE" "$OFFSET")
echo "$RESULT"
