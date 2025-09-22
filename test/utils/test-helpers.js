import fs from "node:fs";
import { createTempDirManager } from "./temp-directory.js";

/**
 * Additional test utilities and helpers
 */

/**
 * Mock console methods for testing
 * @returns {Object} Mock console with captured output
 */
function mockConsole() {
	const originalConsole = { ...console };
	const captured = {
		log: [],
		warn: [],
		error: [],
		info: [],
		debug: [],
	};

	["log", "warn", "error", "info", "debug"].forEach((method) => {
		console[method] = (...args) => {
			captured[method].push(args.join(" "));
		};
	});

	return {
		captured,
		restore: () => {
			Object.assign(console, originalConsole);
		},
	};
}

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 */
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a test environment with temporary directory and console mocking
 * @param {Object} options - Configuration options
 * @returns {Object} Test environment
 */
function createTestEnv(options = {}) {
	const tempManager = createTempDirManager();
	const consoleMock = options.mockConsole ? mockConsole() : null;

	return {
		tempManager,
		consoleMock,
		cleanup: () => {
			tempManager.cleanup();
			if (consoleMock) {
				consoleMock.restore();
			}
		},
	};
}

/**
 * Assert helper functions for common test patterns
 */
const assert = {
	/**
	 * Assert that a file exists
	 */
	fileExists: (filePath, message = "File should exist") => {
		if (!fs.existsSync(filePath)) {
			throw new Error(`${message}: ${filePath}`);
		}
	},

	/**
	 * Assert that a file contains specific content
	 */
	fileContains: (
		filePath,
		expectedContent,
		message = "File should contain expected content",
	) => {
		if (!fs.existsSync(filePath)) {
			throw new Error(`File does not exist: ${filePath}`);
		}
		const content = fs.readFileSync(filePath, "utf8");
		if (!content.includes(expectedContent)) {
			throw new Error(
				`${message}. Expected: ${expectedContent}, Got: ${content}`,
			);
		}
	},

	/**
	 * Assert that a directory contains expected files
	 */
	directoryContains: (
		dirPath,
		expectedFiles,
		message = "Directory should contain expected files",
	) => {
		if (!fs.existsSync(dirPath)) {
			throw new Error(`Directory does not exist: ${dirPath}`);
		}

		const actualFiles = fs.readdirSync(dirPath);
		expectedFiles.forEach((file) => {
			if (!actualFiles.includes(file)) {
				throw new Error(`${message}. Missing file: ${file} in ${dirPath}`);
			}
		});
	},

	/**
	 * Assert that console output contains expected message
	 */
	consoleContains: (
		captured,
		level,
		expectedMessage,
		message = "Console should contain expected message",
	) => {
		if (!captured[level]) {
			throw new Error(`Invalid console level: ${level}`);
		}

		const found = captured[level].some((msg) => msg.includes(expectedMessage));
		if (!found) {
			throw new Error(
				`${message}. Expected: ${expectedMessage} in ${level} output: ${JSON.stringify(captured[level])}`,
			);
		}
	},
};

export { mockConsole, sleep, createTestEnv, assert };
