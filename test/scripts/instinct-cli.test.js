import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseInstinctFile, loadAllInstincts, formatConfidenceBar, formatStatus } from '../../.claude/scripts/instinct-cli.js';
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
