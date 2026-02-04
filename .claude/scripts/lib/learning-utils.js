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
  } catch (_err) {
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
  } catch (_err) {
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
 * Used by instinct-cli commands for structured output (e.g., --json flag).
 * @param {*} data - Data to output
 */
export function output(data) {
  if (typeof data === 'object') {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(data);
  }
}
