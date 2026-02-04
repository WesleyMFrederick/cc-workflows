# Phase 3: Visibility — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `subagent-driven-development` to implement this plan task-by-task.

**Goal:** Users can see learned instincts with confidence bars via `/instinct-status`.

**Architecture:** JS CLI reads instinct YAML files from `.claude/learned/instincts/`, parses frontmatter, groups by domain, displays with confidence bars. Skill invokes CLI.

**Tech Stack:** Node.js (ES modules), Vitest for unit tests, Bash for E2E

**ACs Covered:** AC23-AC27 from [Spec](../../continuous-learning-port-spec.md)

**Dependency:** Phase 2 must be complete (needs instinct YAML files to display)

---

## Task 1 — learning-utils.js

**Type:** TDD (Vitest)

### Files

- `.claude/scripts/lib/learning-utils.js` (CREATE)
- `.claude/scripts/lib/learning-utils.test.js` (CREATE & TEST)

### Step 1: Write the failing tests

```javascript
// .claude/scripts/lib/learning-utils.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ensureDir, readFile, writeFile, findFiles, log } from './learning-utils.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('learning-utils', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'learning-utils-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe('ensureDir', () => {
    it('creates nested directories', () => {
      const nested = path.join(testDir, 'a', 'b', 'c');
      ensureDir(nested);
      expect(fs.existsSync(nested)).toBe(true);
    });

    it('is idempotent for existing directories', () => {
      ensureDir(testDir);
      expect(fs.existsSync(testDir)).toBe(true);
    });
  });

  describe('readFile', () => {
    it('reads file content', () => {
      const filePath = path.join(testDir, 'test.txt');
      fs.writeFileSync(filePath, 'hello world');
      expect(readFile(filePath)).toBe('hello world');
    });

    it('returns null for missing file', () => {
      expect(readFile(path.join(testDir, 'missing.txt'))).toBeNull();
    });
  });

  describe('writeFile', () => {
    it('writes content and creates parent dirs', () => {
      const filePath = path.join(testDir, 'sub', 'file.txt');
      writeFile(filePath, 'test content');
      expect(fs.readFileSync(filePath, 'utf-8')).toBe('test content');
    });
  });

  describe('findFiles', () => {
    it('finds files matching pattern', () => {
      fs.writeFileSync(path.join(testDir, 'a.yaml'), '');
      fs.writeFileSync(path.join(testDir, 'b.yaml'), '');
      fs.writeFileSync(path.join(testDir, 'c.txt'), '');

      const yamlFiles = findFiles(testDir, '.yaml');
      expect(yamlFiles).toHaveLength(2);
      expect(yamlFiles.every(f => f.endsWith('.yaml'))).toBe(true);
    });

    it('returns empty array for missing directory', () => {
      expect(findFiles(path.join(testDir, 'missing'), '.yaml')).toEqual([]);
    });
  });
});
```

### Step 2: Run test — expect FAIL

Run: `npm test -- .claude/scripts/lib/learning-utils.test.js`

**Expected:** FAIL — Cannot find module './learning-utils.js'

### Step 3: Write minimal implementation

```javascript
// .claude/scripts/lib/learning-utils.js
/**
 * Learning utilities for Continuous Learning v2
 * File I/O helpers for instinct CLI and related scripts.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Ensure directory exists, creating parent dirs if needed.
 * @param {string} dirPath - Directory path to create
 */
export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Read file content safely.
 * @param {string} filePath - File to read
 * @returns {string|null} File content or null if missing
 */
export function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Write file, creating parent directories if needed.
 * @param {string} filePath - File to write
 * @param {string} content - Content to write
 */
export function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Append to file, creating parent directories if needed.
 * @param {string} filePath - File to append to
 * @param {string} content - Content to append
 */
export function appendFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, content, 'utf-8');
}

/**
 * Find files in directory matching extension.
 * @param {string} dir - Directory to search
 * @param {string} ext - Extension to match (e.g., '.yaml')
 * @returns {string[]} Array of full file paths
 */
export function findFiles(dir, ext) {
  try {
    const files = fs.readdirSync(dir);
    return files
      .filter(f => f.endsWith(ext))
      .map(f => path.join(dir, f));
  } catch {
    return [];
  }
}

/**
 * Log message to stderr.
 * @param {string} message - Message to log
 */
export function log(message) {
  console.error(message);
}

/**
 * Output data to stdout (JSON-aware).
 * @param {*} data - Data to output
 */
export function output(data) {
  if (typeof data === 'object') {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(data);
  }
}
```

### Step 4: Run test — expect PASS

Run: `npm test -- .claude/scripts/lib/learning-utils.test.js`

**Expected:** All tests pass

### Step 5: Commit

Use `create-git-commit` skill.

---

## Task 2 — instinct-cli.js (status command)

**Type:** TDD (Vitest)

### Files

- `.claude/scripts/instinct-cli.js` (CREATE)
- `.claude/scripts/instinct-cli.test.js` (CREATE & TEST)

### Step 1: Write the failing tests

```javascript
// .claude/scripts/instinct-cli.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseInstinctFile, loadAllInstincts, formatConfidenceBar, formatStatus } from './instinct-cli.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('instinct-cli', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'instinct-cli-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe('parseInstinctFile', () => {
    it('parses YAML frontmatter with content', () => {
      const content = `---
id: test-instinct
trigger: "when testing"
confidence: 0.75
domain: testing
source: session-observation
---

# Test Instinct

## Action
Do the test thing.

## Evidence
- Observed 5 times
`;
      const instincts = parseInstinctFile(content);
      expect(instincts).toHaveLength(1);
      expect(instincts[0].id).toBe('test-instinct');
      expect(instincts[0].trigger).toBe('when testing');
      expect(instincts[0].confidence).toBe(0.75);
      expect(instincts[0].domain).toBe('testing');
      expect(instincts[0].content).toContain('## Action');
    });

    it('handles multiple instincts in one file', () => {
      const content = `---
id: first
confidence: 0.5
domain: workflow
---

First content.

---
id: second
confidence: 0.8
domain: git
---

Second content.
`;
      const instincts = parseInstinctFile(content);
      expect(instincts).toHaveLength(2);
      expect(instincts[0].id).toBe('first');
      expect(instincts[1].id).toBe('second');
    });

    it('skips instincts without id', () => {
      const content = `---
trigger: "something"
confidence: 0.5
---

No id here.
`;
      const instincts = parseInstinctFile(content);
      expect(instincts).toHaveLength(0);
    });
  });

  describe('formatConfidenceBar', () => {
    it('renders 10-char bar at 0.7', () => {
      const bar = formatConfidenceBar(0.7);
      expect(bar).toHaveLength(10);
      expect(bar).toMatch(/^█{7}░{3}$/);
    });

    it('renders empty bar at 0', () => {
      expect(formatConfidenceBar(0)).toBe('░░░░░░░░░░');
    });

    it('renders full bar at 1', () => {
      expect(formatConfidenceBar(1)).toBe('██████████');
    });
  });

  describe('loadAllInstincts', () => {
    it('loads instincts from personal and inherited dirs', () => {
      const personalDir = path.join(testDir, 'instincts', 'personal');
      const inheritedDir = path.join(testDir, 'instincts', 'inherited');
      fs.mkdirSync(personalDir, { recursive: true });
      fs.mkdirSync(inheritedDir, { recursive: true });

      fs.writeFileSync(path.join(personalDir, 'test.yaml'), `---
id: personal-instinct
confidence: 0.6
domain: workflow
---
Personal content.
`);

      fs.writeFileSync(path.join(inheritedDir, 'imported.yaml'), `---
id: inherited-instinct
confidence: 0.8
domain: git
---
Inherited content.
`);

      const instincts = loadAllInstincts(testDir);
      expect(instincts).toHaveLength(2);
      expect(instincts.find(i => i.id === 'personal-instinct')).toBeDefined();
      expect(instincts.find(i => i.id === 'inherited-instinct')).toBeDefined();
    });

    it('returns empty array when no instincts exist', () => {
      const instincts = loadAllInstincts(testDir);
      expect(instincts).toEqual([]);
    });
  });

  describe('formatStatus', () => {
    it('groups instincts by domain', () => {
      const instincts = [
        { id: 'a', domain: 'git', confidence: 0.8, trigger: 'when committing' },
        { id: 'b', domain: 'git', confidence: 0.6, trigger: 'when branching' },
        { id: 'c', domain: 'testing', confidence: 0.7, trigger: 'when testing' },
      ];
      const output = formatStatus(instincts);
      expect(output).toContain('GIT (2)');
      expect(output).toContain('TESTING (1)');
    });

    it('shows confidence bars', () => {
      const instincts = [
        { id: 'test', domain: 'workflow', confidence: 0.75, trigger: 'when working' },
      ];
      const output = formatStatus(instincts);
      expect(output).toContain('███████░░░');
      expect(output).toContain('75%');
    });
  });
});
```

### Step 2: Run test — expect FAIL

Run: `npm test -- .claude/scripts/instinct-cli.test.js`

**Expected:** FAIL — Cannot find module './instinct-cli.js'

### Step 3: Write minimal implementation

```javascript
#!/usr/bin/env node
// .claude/scripts/instinct-cli.js
/**
 * Instinct CLI - Manage instincts for Continuous Learning v2
 *
 * Commands:
 * status   - Show all instincts and their status
 * import   - Import instincts from file or URL (Phase 4)
 * export   - Export instincts to file (Phase 4)
 * evolve   - Cluster instincts into skills (Phase 4)
 */

import path from 'node:path';
import { readFile, findFiles, log } from './lib/learning-utils.js';

// ─────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────

const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const LEARNED_DIR = path.join(PROJECT_DIR, '.claude', 'learned');
const INSTINCTS_DIR = path.join(LEARNED_DIR, 'instincts');
const PERSONAL_DIR = path.join(INSTINCTS_DIR, 'personal');
const INHERITED_DIR = path.join(INSTINCTS_DIR, 'inherited');
const OBSERVATIONS_FILE = path.join(LEARNED_DIR, 'observations.jsonl');

// ─────────────────────────────────────────
// Instinct Parser
// ─────────────────────────────────────────

/**
 * Parse YAML-like instinct file format.
 * @param {string} content - File content
 * @returns {Array<Object>} Parsed instincts
 */
export function parseInstinctFile(content) {
  const instincts = [];
  let current = {};
  let inFrontmatter = false;
  let contentLines = [];

  for (const line of content.split('\n')) {
    if (line.trim() === '---') {
      if (inFrontmatter) {
        // End of frontmatter
        inFrontmatter = false;
        if (Object.keys(current).length > 0) {
          current.content = contentLines.join('\n').trim();
          instincts.push(current);
          current = {};
          contentLines = [];
        }
      } else {
        // Start of frontmatter
        inFrontmatter = true;
        if (Object.keys(current).length > 0) {
          current.content = contentLines.join('\n').trim();
          instincts.push(current);
        }
        current = {};
        contentLines = [];
      }
    } else if (inFrontmatter) {
      // Parse YAML-like frontmatter
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const key = line.slice(0, colonIdx).trim();
        let value = line.slice(colonIdx + 1).trim();
        // Remove quotes
        value = value.replace(/^["']|["']$/g, '');
        if (key === 'confidence') {
          current[key] = parseFloat(value);
        } else {
          current[key] = value;
        }
      }
    } else {
      contentLines.push(line);
    }
  }

  // Don't forget the last instinct
  if (Object.keys(current).length > 0) {
    current.content = contentLines.join('\n').trim();
    instincts.push(current);
  }

  // Filter out instincts without id
  return instincts.filter(i => i.id);
}

/**
 * Load all instincts from personal and inherited directories.
 * @param {string} baseDir - Base learned directory (defaults to LEARNED_DIR)
 * @returns {Array<Object>} All loaded instincts
 */
export function loadAllInstincts(baseDir = LEARNED_DIR) {
  const instincts = [];
  const personalDir = path.join(baseDir, 'instincts', 'personal');
  const inheritedDir = path.join(baseDir, 'instincts', 'inherited');

  for (const [directory, sourceType] of [[personalDir, 'personal'], [inheritedDir, 'inherited']]) {
    const files = findFiles(directory, '.yaml');
    for (const file of files) {
      const content = readFile(file);
      if (content) {
        try {
          const parsed = parseInstinctFile(content);
          for (const inst of parsed) {
            inst._sourceFile = file;
            inst._sourceType = sourceType;
          }
          instincts.push(...parsed);
        } catch (e) {
          log(`Warning: Failed to parse ${file}: ${e.message}`);
        }
      }
    }
  }

  return instincts;
}

// ─────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────

/**
 * Format confidence as 10-char visual bar.
 * @param {number} confidence - 0.0 to 1.0
 * @returns {string} Visual bar
 */
export function formatConfidenceBar(confidence) {
  const filled = Math.round(confidence * 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
}

/**
 * Format status output for display.
 * @param {Array<Object>} instincts - Instincts to format
 * @returns {string} Formatted output
 */
export function formatStatus(instincts) {
  if (instincts.length === 0) {
    return `No instincts found.

Instinct directories:
  Personal:  ${PERSONAL_DIR}
  Inherited: ${INHERITED_DIR}
`;
  }

  // Group by domain
  const byDomain = {};
  for (const inst of instincts) {
    const domain = inst.domain || 'general';
    if (!byDomain[domain]) byDomain[domain] = [];
    byDomain[domain].push(inst);
  }

  const lines = [];

  // Header
  lines.push('');
  lines.push('='.repeat(60));
  lines.push(`  INSTINCT STATUS - ${instincts.length} total`);
  lines.push('='.repeat(60));
  lines.push('');

  // Summary by source
  const personal = instincts.filter(i => i._sourceType === 'personal');
  const inherited = instincts.filter(i => i._sourceType === 'inherited');
  lines.push(`  Personal:  ${personal.length}`);
  lines.push(`  Inherited: ${inherited.length}`);
  lines.push('');

  // Print by domain
  for (const domain of Object.keys(byDomain).sort()) {
    const domainInstincts = byDomain[domain];
    lines.push(`## ${domain.toUpperCase()} (${domainInstincts.length})`);
    lines.push('');

    // Sort by confidence descending
    domainInstincts.sort((a, b) => (b.confidence || 0.5) - (a.confidence || 0.5));

    for (const inst of domainInstincts) {
      const conf = inst.confidence || 0.5;
      const confBar = formatConfidenceBar(conf);
      const trigger = inst.trigger || 'unknown trigger';

      lines.push(`  ${confBar} ${Math.round(conf * 100).toString().padStart(3)}%  ${inst.id}`);
      lines.push(`            trigger: ${trigger}`);

      // Extract action from content
      const content = inst.content || '';
      const actionMatch = content.match(/## Action\s*\n\s*(.+?)(?:\n\n|\n##|$)/s);
      if (actionMatch) {
        let action = actionMatch[1].trim().split('\n')[0];
        if (action.length > 60) action = action.slice(0, 60) + '...';
        lines.push(`            action: ${action}`);
      }

      lines.push('');
    }
  }

  // Observations stats
  const obsContent = readFile(OBSERVATIONS_FILE);
  if (obsContent) {
    const obsCount = obsContent.split('\n').filter(l => l.trim()).length;
    lines.push('─'.repeat(57));
    lines.push(`  Observations: ${obsCount} events logged`);
    lines.push(`  File: ${OBSERVATIONS_FILE}`);
  }

  lines.push('');
  lines.push('='.repeat(60));
  lines.push('');

  return lines.join('\n');
}

// ─────────────────────────────────────────
// Status Command
// ─────────────────────────────────────────

/**
 * Run status command.
 */
function cmdStatus() {
  const instincts = loadAllInstincts();
  console.log(formatStatus(instincts));
}

// ─────────────────────────────────────────
// Main
// ─────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'status':
      cmdStatus();
      break;
    case 'import':
    case 'export':
    case 'evolve':
      log(`Command '${command}' not yet implemented (Phase 4).`);
      process.exit(1);
      break;
    default:
      console.log(`Instinct CLI - Continuous Learning v2

Commands:
  status   Show all instincts and their status
  import   Import instincts from file or URL (Phase 4)
  export   Export instincts to file (Phase 4)
  evolve   Cluster instincts into skills (Phase 4)

Usage:
  node instinct-cli.js status
`);
      process.exit(command ? 1 : 0);
  }
}

// Run if executed directly
const isMain = process.argv[1]?.endsWith('instinct-cli.js');
if (isMain) {
  main();
}
```

### Step 4: Run test — expect PASS

Run: `npm test -- .claude/scripts/instinct-cli.test.js`

**Expected:** All tests pass

### Step 5: Commit

Use `create-git-commit` skill.

---

## Task 3 — instinct-status skill

**Type:** Infrastructure

### Files

- `.claude/skills/instinct-status/SKILL.md` (CREATE)

### Step 1: Create skill directory

```bash
mkdir -p .claude/skills/instinct-status
```

### Step 2: Create SKILL.md

````markdown
---
name: instinct-status
description: Display learned instincts with confidence bars grouped by domain. Shows personal and inherited instincts, observation count, and auto-applied threshold status.
---

# Instinct Status

Display the status of all learned instincts from the Continuous Learning system.

## When to Use

- To see what patterns Claude has learned from your sessions
- To check confidence levels of instincts before they auto-apply
- To verify instinct import/export operations worked
- To monitor the learning pipeline health

## Usage

Run this skill via `/instinct-status` or when asked "show my instincts" or "what has Claude learned".

## Behavior

1. Run the instinct CLI to get status:

```bash
node "$CLAUDE_PROJECT_DIR/.claude/scripts/instinct-cli.js" status
```

1. Display the output to the user, which includes:
   - Total instinct count
   - Personal vs inherited breakdown
   - Instincts grouped by domain (git, workflow, testing, etc.)
   - Confidence bars (█░) showing strength of each instinct
   - Trigger conditions and actions
   - Observation count and file location

## Output Format

```text
============================================================
  INSTINCT STATUS - 5 total
============================================================

  Personal:  3
  Inherited: 2

## GIT (2)

  ███████░░░  70%  prefer-rebase-over-merge
            trigger: when merging branches
            action: Use rebase for cleaner history

  █████░░░░░  50%  commit-message-style
            trigger: when writing commit messages
            action: Use conventional commit format

## WORKFLOW (3)
...

─────────────────────────────────────────────────────────
  Observations: 142 events logged
  File: .claude/learned/observations.jsonl

============================================================
```

## Confidence Thresholds

- **≥ 70%** (███████░░░): Auto-applied — Claude uses this instinct automatically
- **50-69%** (█████░░░░░): Suggested — Claude may suggest but won't auto-apply
- **< 50%** (███░░░░░░░): Tentative — Still gathering evidence

## Related Skills

- `/evolve` — Cluster high-confidence instincts into discoverable skills
- Import/export via `instinct-cli.js import` and `instinct-cli.js export`
````

### Step 3: Verify skill discovered

```bash
ls -la .claude/skills/instinct-status/
```

### Step 4: Commit

Use `create-git-commit` skill.

---

## Task 4 — End-to-End Validation

**Type:** Validation

### Files

- `.claude/scripts/test-instinct-status-e2e.sh` (CREATE)

### Step 1: Create E2E test script

```bash
cat > .claude/scripts/test-instinct-status-e2e.sh << 'EOF'
#!/bin/bash
# End-to-end validation for Phase 3 Visibility pipeline

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"

CLI_SCRIPT="$SCRIPT_DIR/instinct-cli.js"
LEARNED_DIR="$CLAUDE_PROJECT_DIR/.claude/learned"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; cleanup; exit 1; }

cleanup() {
  rm -rf "$LEARNED_DIR/instincts/personal/test-instinct.yaml" 2>/dev/null || true
}

echo "=========================================="
echo "Instinct Status E2E Validation"
echo "=========================================="
echo ""

# Setup
mkdir -p "$LEARNED_DIR/instincts/personal"
mkdir -p "$LEARNED_DIR/instincts/inherited"

# Test 1: CLI runs without error
echo "Test 1: CLI executes successfully"

if node "$CLI_SCRIPT" status > /dev/null 2>&1; then
  pass "CLI runs without error"
else
  fail "CLI failed to execute"
fi

# Test 2: CLI shows help when no command
echo "Test 2: CLI shows help without command"

output=$(node "$CLI_SCRIPT" 2>&1)
if echo "$output" | grep -q "Instinct CLI"; then
  pass "CLI shows help"
else
  fail "CLI should show help"
fi

# Test 3: Create test instinct and verify it appears
echo "Test 3: Displays created instinct"

cat > "$LEARNED_DIR/instincts/personal/test-instinct.yaml" << 'YAML'
---
id: e2e-test-instinct
trigger: "when running e2e tests"
confidence: 0.85
domain: testing
source: session-observation
---

# E2E Test Instinct

## Action
Verify the e2e test passes.

## Evidence
- Created for e2e validation
YAML

output=$(node "$CLI_SCRIPT" status)

if echo "$output" | grep -q "e2e-test-instinct"; then
  pass "Instinct appears in status"
else
  fail "Created instinct not found in status output"
fi

# Test 4: Confidence bar renders correctly
echo "Test 4: Confidence bar renders"

if echo "$output" | grep -q "████████░░"; then
  pass "Confidence bar renders (85% = 8 blocks)"
else
  # May be 9 blocks due to rounding
  if echo "$output" | grep -q "█████████░"; then
    pass "Confidence bar renders (85% rounded to 9 blocks)"
  else
    fail "Confidence bar not found or incorrect"
  fi
fi

# Test 5: Domain grouping works
echo "Test 5: Domain grouping"

if echo "$output" | grep -q "TESTING"; then
  pass "Domain grouping works"
else
  fail "Domain header not found"
fi

# Cleanup
cleanup

echo ""
echo "=========================================="
echo -e "${GREEN}All E2E tests passed${NC}"
echo "=========================================="
EOF

chmod +x .claude/scripts/test-instinct-status-e2e.sh
```

### Step 2: Run E2E validation

Run: `bash .claude/scripts/test-instinct-status-e2e.sh`

**Expected:** All 5 tests pass

### Step 3: Commit

Use `create-git-commit` skill.

---

## Phase 3 Complete — AC Validation

| AC | Description | Validated By |
|----|-------------|--------------|
| AC23 | `/instinct-status` displays instincts grouped by domain | Task 3 skill + Task 2 formatStatus |
| AC24 | Visual confidence bars shown | Task 2 formatConfidenceBar tests |
| AC25 | Instinct CLI (JS) supports status subcommand | Task 2 cmdStatus |
| AC26 | Instinct CLI written in JavaScript | Task 2 implementation |
| AC27 | All hook scripts in `.claude/hooks/` | N/A (Phase 3 has no hooks) |

**Next Phase:** Phase 4 (Evolution + Portability) extends instinct-cli.js with import/export/evolve commands.
