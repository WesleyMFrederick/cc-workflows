#!/usr/bin/env bash
# install-claude-wrapper.sh - Install PATH-based Claude interception

set -euo pipefail

# --- Color Definitions ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# --- Dry Run Detection ---
DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}🔍 DRY RUN MODE${NC}\n"
fi

# --- Path Setup ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONDITIONAL_CLAUDE_PATH="$SCRIPT_DIR/conditional-claude.sh"
LOCAL_BIN_DIR="$HOME/.local/bin"
SYMLINK_PATH="$LOCAL_BIN_DIR/claude"

# --- Step 1: Create Directory ---
echo -e "${BLUE}Step 1: Creating ~/.local/bin directory${NC}"
if [[ ! -d "$LOCAL_BIN_DIR" ]]; then
    if [[ "$DRY_RUN" == true ]]; then
        echo "  Would create: $LOCAL_BIN_DIR"
    else
        mkdir -p "$LOCAL_BIN_DIR"
        echo -e "  ${GREEN}✓${NC} Created"
    fi
else
    echo -e "  ${GREEN}✓${NC} Already exists"
fi
echo ""

# --- Step 2: Create Symlink ---
echo -e "${BLUE}Step 2: Creating symlink${NC}"
if [[ -e "$SYMLINK_PATH" ]]; then
    if [[ -L "$SYMLINK_PATH" ]]; then
        # Pattern: Handle existing symlink
        existing_target="$(readlink "$SYMLINK_PATH")"
        echo -e "  ${YELLOW}⚠${NC} Symlink exists"
        echo "  Current: $existing_target"
        echo "  New: $CONDITIONAL_CLAUDE_PATH"

        if [[ "$DRY_RUN" == true ]]; then
            echo "  Would replace"
        else
            # Prompt for replacement
            read -p "  Replace? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                rm "$SYMLINK_PATH"
                ln -s "$CONDITIONAL_CLAUDE_PATH" "$SYMLINK_PATH"
                echo -e "  ${GREEN}✓${NC} Replaced"
            else
                echo -e "  ${YELLOW}⚠${NC} Skipped replacement"
                exit 0
            fi
        fi
    else
        echo -e "  ${RED}✗${NC} File exists (not symlink)"
        exit 1
    fi
else
    if [[ "$DRY_RUN" == true ]]; then
        echo "  Would create: $SYMLINK_PATH -> $CONDITIONAL_CLAUDE_PATH"
    else
        ln -s "$CONDITIONAL_CLAUDE_PATH" "$SYMLINK_PATH"
        echo -e "  ${GREEN}✓${NC} Created"
    fi
fi
echo ""

# --- Step 3: Verify PATH ---
echo -e "${BLUE}Step 3: Verifying PATH${NC}"
if [[ ":$PATH:" == *":$LOCAL_BIN_DIR:"* ]]; then
    echo -e "  ${GREEN}✓${NC} In PATH"
else
    echo -e "  ${RED}✗${NC} NOT in PATH"
    echo "  Add to ~/.zshrc: export PATH=\"\$HOME/.local/bin:\$PATH\""
fi
echo ""

# --- Step 4: Verification Steps ---
if [[ "$DRY_RUN" == false ]]; then
    echo -e "${BLUE}Verification:${NC}"
    echo "  which claude"
    echo "  ls -l \$(which claude)"
fi
