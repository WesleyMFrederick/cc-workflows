#!/bin/bash
# PostToolUse(TaskCreate|TaskUpdate) hook: Sync task state to current-status.json in real-time
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
STATUS_FILE="${PROJECT_ROOT}/current-status.json"

INPUT=$(cat)

session_id=$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)
[[ -z "$session_id" ]] && exit 0
[[ ! -f "$STATUS_FILE" ]] && exit 0

# Scan task files for current in_progress task (same pattern as stop-sync.sh)
tasks_dir="$HOME/.claude/tasks/$session_id"
current_task_number=""
task_summary=""
if [[ -d "$tasks_dir" ]]; then
  for task_file in "$tasks_dir"/*.json; do
    [[ -f "$task_file" ]] || continue
    task_status=$(jq -r '.status // ""' "$task_file" 2>/dev/null)
    if [[ "$task_status" == "in_progress" ]]; then
      current_task_number=$(jq -r '.id // ""' "$task_file" 2>/dev/null)
      task_active_form=$(jq -r '.activeForm // ""' "$task_file" 2>/dev/null)
      task_summary="Task #${current_task_number}: ${task_active_form}"
      break
    fi
  done
fi

# Resolve current_task_header from plan file (if available)
plan_path=$(jq -r --arg sid "$session_id" '.active_sessions[$sid].plan_path // empty' "$STATUS_FILE" 2>/dev/null)
current_task_header=""
if [[ -n "$plan_path" && -f "$plan_path" && -n "$current_task_number" ]]; then
  current_task_header=$(grep -m1 "^### .*${current_task_number}[:.)]" "$plan_path" || echo "")
fi

# Update current-status.json
jq --arg sid "$session_id" \
   --arg task_num "${current_task_number:-}" \
   --arg tasks_path "${tasks_dir:-}" \
   --arg task_sum "${task_summary:-}" \
   --arg task_hdr "${current_task_header:-}" \
   '.active_sessions[$sid].current_task_number = (if $task_num == "" then null else $task_num end) |
    .active_sessions[$sid].tasks_path = (if $tasks_path == "" then null else $tasks_path end) |
    .active_sessions[$sid].task_summary = (if $task_sum == "" then null else $task_sum end) |
    .active_sessions[$sid].current_task_header = (if $task_hdr == "" then null else $task_hdr end)' \
   "$STATUS_FILE" > "${STATUS_FILE}.tmp.$$" && mv "${STATUS_FILE}.tmp.$$" "$STATUS_FILE"

exit 0
