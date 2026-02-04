#!/bin/bash
# setup-worktree.sh - Create isolated git worktree for feature work
#
# Usage:
#   setup-worktree.sh <scope> <feature>
#   setup-worktree.sh continuous-learning phase3-visibility
#
# Creates:
#   - Worktree: ../{repo}.worktree.{scope}.{feature}
#   - Branch: {scope}/{feature}
#
# Runs: npm install, npm test (if package.json exists)

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[worktree]${NC} $1"; }
warn() { echo -e "${YELLOW}[worktree]${NC} $1"; }
fail() { echo -e "${RED}[worktree]${NC} $1" >&2; exit 1; }

# Validate args
if [ $# -lt 2 ]; then
  echo "Usage: $0 <scope> <feature>"
  echo ""
  echo "Examples:"
  echo "  $0 continuous-learning phase3-visibility"
  echo "  $0 ptsf-tools event-qr-codes"
  echo "  $0 citation-manager ast-refactor"
  exit 1
fi

SCOPE="$1"
FEATURE="$2"

# Get repo info
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO=$(basename "$REPO_ROOT")
PARENT_DIR=$(dirname "$REPO_ROOT")

# Construct names
WORKTREE_DIR="${REPO}.worktree.${SCOPE}.${FEATURE}"
WORKTREE_PATH="${PARENT_DIR}/${WORKTREE_DIR}"
BRANCH_NAME="${SCOPE}/${FEATURE}"

log "Setting up worktree for ${SCOPE}/${FEATURE}"
echo ""

# Phase 1: Pre-flight checks
log "Phase 1: Pre-flight checks"

if ! git diff --quiet || ! git diff --cached --quiet; then
  fail "Dirty git state. Commit or stash changes first."
fi
log "  ✓ Git status clean"

if [ -f package.json ]; then
  if ! npm test > /dev/null 2>&1; then
    fail "Tests failing. Fix tests before creating worktree."
  fi
  log "  ✓ Tests passing"
fi

# Phase 2: Clean up existing
log "Phase 2: Checking for existing worktree"

if git worktree list | grep -q "$WORKTREE_DIR"; then
  warn "  Removing existing worktree..."
  git worktree remove "$WORKTREE_PATH" --force 2>/dev/null || true
  git branch -D "$BRANCH_NAME" 2>/dev/null || true
  log "  ✓ Cleaned up existing worktree"
else
  log "  ✓ No existing worktree"
fi

# Phase 3: Create worktree
log "Phase 3: Creating worktree"

git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME"
log "  ✓ Worktree created"

# Phase 4: Environment setup
log "Phase 4: Environment setup"

cd "$WORKTREE_PATH"

if [ -f package.json ]; then
  npm install > /dev/null 2>&1
  log "  ✓ npm install complete"
fi

if [ -f Cargo.toml ]; then
  cargo build > /dev/null 2>&1
  log "  ✓ cargo build complete"
fi

if [ -f requirements.txt ]; then
  pip install -r requirements.txt > /dev/null 2>&1
  log "  ✓ pip install complete"
fi

# Phase 5: Test validation
log "Phase 5: Test validation"

if [ -f package.json ]; then
  if npm test > /dev/null 2>&1; then
    log "  ✓ Tests passing in worktree"
  else
    fail "Tests failing in worktree. Debug before proceeding."
  fi
fi

# Done
echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}Worktree setup complete${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "  Location: $WORKTREE_PATH"
echo "  Branch:   $BRANCH_NAME"
echo ""
echo "To work in worktree:"
echo "  cd $WORKTREE_PATH"
echo ""
