import { existsSync, mkdirSync } from "node:fs";

/**
 * Ensure output directory exists
 *
 * Creates directory if it doesn't exist. Safe to call multiple times.
 *
 * @param {string} dirPath - Path to output directory
 * @returns {string} Directory path
 */
export function ensureOutputDir(dirPath) {
	if (!existsSync(dirPath)) {
		mkdirSync(dirPath, { recursive: true });
	}
	return dirPath;
}
