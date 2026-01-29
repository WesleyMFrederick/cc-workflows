#!/usr/bin/env bash
# postinstall.sh — Runs after npm install to set up build artifacts and symlinks.
# Handles worktree environments by symlinking gitignored files from main repo.
set -e

# 1. Build citation-manager TypeScript
npm run build -w tools/citation-manager

# 2. Create root dist/ symlink (CLI integration tests expect it here)
mkdir -p dist
ln -sf ../tools/citation-manager/dist/citation-manager.js dist/citation-manager.js

# 3. In worktrees: symlink gitignored files from main repo
git_common_dir=$(git rev-parse --git-common-dir 2>/dev/null || echo ".git")
if [ "$git_common_dir" != ".git" ]; then
  main_repo=$(cd "$git_common_dir/.." && pwd)

  # Symlink current-status.json (session tracking)
  if [ -f "$main_repo/current-status.json" ] && [ ! -e "current-status.json" ]; then
    ln -sf "$main_repo/current-status.json" current-status.json
    echo "postinstall: symlinked current-status.json from main repo"
  fi
fi
