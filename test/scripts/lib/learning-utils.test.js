import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ensureDir, readFile, writeFile, findFiles, log } from '../../../.claude/scripts/lib/learning-utils.js';
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
