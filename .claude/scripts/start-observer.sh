#!/bin/bash
# Continuous Learning v2 - Observer Agent Launcher
#
# Starts the background observer agent that analyzes observations
# and creates instincts. Uses Haiku model for cost efficiency.
#
# Usage:
#   start-observer.sh        # Start observer in background
#   start-observer.sh stop   # Stop running observer
#   start-observer.sh status # Check if observer is running

set -e

CONFIG_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude/learned"
PID_FILE="${CONFIG_DIR}/.observer.pid"
LOG_FILE="${CONFIG_DIR}/observer.log"
OBSERVATIONS_FILE="${CONFIG_DIR}/observations.jsonl"
INSTINCTS_DIR="${CONFIG_DIR}/instincts/personal"

mkdir -p "$CONFIG_DIR"
mkdir -p "$INSTINCTS_DIR"

case "${1:-start}" in
  stop)
    if [ -f "$PID_FILE" ]; then
      pid=$(cat "$PID_FILE")
      if kill -0 "$pid" 2>/dev/null; then
        echo "Stopping observer (PID: $pid)..."
        # First try SIGTERM, then SIGKILL if needed
        kill "$pid" 2>/dev/null || true
        sleep 0.5
        if kill -0 "$pid" 2>/dev/null; then
          kill -9 "$pid" 2>/dev/null || true
        fi
        rm -f "$PID_FILE"
        echo "Observer stopped."
      else
        echo "Observer not running (stale PID file)."
        rm -f "$PID_FILE"
      fi
    else
      echo "Observer not running."
    fi
    exit 0
    ;;

  status)
    if [ -f "$PID_FILE" ]; then
      pid=$(cat "$PID_FILE")
      if kill -0 "$pid" 2>/dev/null; then
        echo "Observer is running (PID: $pid)"
        echo "Log: $LOG_FILE"
        echo "Observations: $(wc -l < "$OBSERVATIONS_FILE" 2>/dev/null | tr -d ' ' || echo 0) lines"
        exit 0
      else
        echo "Observer not running (stale PID file)"
        rm -f "$PID_FILE"
        exit 1
      fi
    else
      echo "Observer not running"
      exit 1
    fi
    ;;

  start)
    # Check if already running
    if [ -f "$PID_FILE" ]; then
      pid=$(cat "$PID_FILE")
      if kill -0 "$pid" 2>/dev/null; then
        echo "Observer already running (PID: $pid)"
        exit 0
      fi
      rm -f "$PID_FILE"
    fi

    echo "Starting observer agent..."

    # Create a temporary script for the observer loop
    observer_loop_script=$(mktemp)
    cat > "$observer_loop_script" << 'OBSERVER_SCRIPT'
#!/bin/bash
CONFIG_DIR="$1"
PID_FILE="$2"
LOG_FILE="$3"
OBSERVATIONS_FILE="$4"
INSTINCTS_DIR="$5"

trap 'rm -f "$PID_FILE"; exit 0' TERM INT

analyze_observations() {
  # Only analyze if we have enough observations
  obs_count=$(wc -l < "$OBSERVATIONS_FILE" 2>/dev/null | tr -d ' ' || echo 0)
  if [ "$obs_count" -lt 20 ]; then
    return
  fi

  echo "[$(date)] Analyzing $obs_count observations..." >> "$LOG_FILE"

  # Use Claude Code with Haiku to analyze observations
  if command -v claude &> /dev/null; then
    claude --model haiku --max-turns 3 --print \
      "Read $OBSERVATIONS_FILE and identify patterns. If you find 3+ occurrences of the same pattern, create an instinct file in $INSTINCTS_DIR following the YAML format in .claude/agents/observer.md. Be conservative - only create instincts for clear patterns." \
      >> "$LOG_FILE" 2>&1 || true
  fi

  # Archive processed observations
  if [ -f "$OBSERVATIONS_FILE" ]; then
    archive_dir="${CONFIG_DIR}/observations.archive"
    mkdir -p "$archive_dir"
    mv "$OBSERVATIONS_FILE" "$archive_dir/processed-$(date +%Y%m%d-%H%M%S).jsonl"
    touch "$OBSERVATIONS_FILE"
  fi
}

# Handle SIGUSR1 for on-demand analysis
trap 'analyze_observations' USR1

# Write PID file with this process's PID
echo "$$" > "$PID_FILE"
echo "[$(date)] Observer started (PID: $$)" >> "$LOG_FILE"

while true; do
  # Check every 5 minutes
  sleep 300

  analyze_observations
done
OBSERVER_SCRIPT

    chmod +x "$observer_loop_script"

    # Start the observer loop in the background using nohup to ensure it persists
    nohup "$observer_loop_script" "$CONFIG_DIR" "$PID_FILE" "$LOG_FILE" "$OBSERVATIONS_FILE" "$INSTINCTS_DIR" > /dev/null 2>&1 &

    # Wait for PID file to be created
    wait_count=0
    while [ ! -f "$PID_FILE" ] && [ $wait_count -lt 10 ]; do
      sleep 0.1
      wait_count=$((wait_count + 1))
    done

    # Verify PID file and process
    if [ -f "$PID_FILE" ]; then
      stored_pid=$(cat "$PID_FILE")
      if kill -0 "$stored_pid" 2>/dev/null; then
        echo "Observer started (PID: $stored_pid)"
        echo "Log: $LOG_FILE"
      else
        echo "Failed to start observer"
        rm -f "$PID_FILE"
        rm -f "$observer_loop_script"
        exit 1
      fi
    else
      echo "Failed to start observer"
      rm -f "$observer_loop_script"
      exit 1
    fi

    # Clean up temporary script
    rm -f "$observer_loop_script"
    ;;

  *)
    echo "Usage: $0 {start|stop|status}"
    exit 1
    ;;
esac
