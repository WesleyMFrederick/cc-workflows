#!/usr/bin/env bash
# verify-installation.sh - Verify Claude wrapper installation

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Installation Verification ===${NC}\n"

ERRORS=0
WARNINGS=0

# --- Check 1: Directory ---
echo -e "${BLUE}Check 1: ~/.local/bin${NC}"
if [[ -d "$HOME/.local/bin" ]]; then
    echo -e "  ${GREEN}✓${NC} Exists"
else
    echo -e "  ${RED}✗${NC} Missing"
    ((ERRORS++))
fi
echo ""

# --- Check 2: Symlink ---
echo -e "${BLUE}Check 2: Symlink${NC}"
if [[ -L "$HOME/.local/bin/claude" ]]; then
    echo -e "  ${GREEN}✓${NC} Exists"
    target="$(readlink "$HOME/.local/bin/claude")"
    echo "  Target: $target"
else
    echo -e "  ${RED}✗${NC} Missing"
    ((ERRORS++))
fi
echo ""

# --- Check 3: PATH ---
echo -e "${BLUE}Check 3: PATH${NC}"
if [[ ":$PATH:" == *":$HOME/.local/bin:"* ]]; then
    echo -e "  ${GREEN}✓${NC} In PATH"
else
    echo -e "  ${RED}✗${NC} NOT in PATH"
    ((ERRORS++))
fi
echo ""

# --- Check 4: which Resolution ---
echo -e "${BLUE}Check 4: which claude${NC}"
which_result="$(which claude || true)"
if [[ "$which_result" == "$HOME/.local/bin/claude" ]]; then
    echo -e "  ${GREEN}✓${NC} Resolves to wrapper"
else
    echo -e "  ${YELLOW}⚠${NC} Incorrect resolution"
    if [[ -n "$which_result" ]]; then
        echo "  Found at: $which_result"
    else
        echo "  Not found in PATH"
    fi
    ((WARNINGS++))
fi
echo ""

# --- Check 5: Real Claude ---
echo -e "${BLUE}Check 5: Real claude binary${NC}"
found_claude=false
IFS=':'
for dir in $PATH; do
    if [[ -x "$dir/claude" && "$dir" != "$HOME/.local/bin" ]]; then
        echo -e "  ${GREEN}✓${NC} Found"
        echo "  Location: $dir/claude"
        found_claude=true
        break
    fi
done
if [[ "$found_claude" == false ]]; then
    echo -e "  ${RED}✗${NC} Not found"
    ((ERRORS++))
fi
echo ""

# --- Summary ---
echo -e "${BLUE}=== Summary ===${NC}"
if [[ $ERRORS -eq 0 && $WARNINGS -eq 0 ]]; then
    echo -e "${GREEN}✓ All checks passed${NC}"
    exit 0
elif [[ $ERRORS -eq 0 ]]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s), $WARNINGS warning(s)${NC}"
    exit 1
fi
