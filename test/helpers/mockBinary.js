// Mock binary utilities for controlled version detection testing (Unix-only)

import fs from "node:fs";
import path from "node:path";
import { createTestWorkspace } from "../helpers/testUtils.js";

/**
 * Create mock binary that responds to `claude --version` command
 * @param {string} version - Version string to return (e.g., "1.2.3")
 * @param {string} testName - Test identifier for workspace isolation
 * @returns {Object} - {binaryPath, restorePath, cleanup}
 */
function setupMockBinary(version, testName) {
	// Create isolated workspace using existing infrastructure
	const workspace = createTestWorkspace(testName);
	const binaryPath = path.join(workspace.tempDir, "claude");

	// Generate shell script that responds to --version flag
	const scriptContent = generateScriptContent(version);

	// Create executable script
	fs.writeFileSync(binaryPath, scriptContent, "utf8");
	fs.chmodSync(binaryPath, "755"); // Make executable

	// Modify PATH to include only our mock binary directory and essential system paths
	const originalPath = process.env.PATH;
	const binaryDirectory = path.dirname(binaryPath);
	// Use minimal PATH to avoid conflicts with real claude binary
	const essentialPaths = ["/usr/bin", "/bin", "/usr/sbin", "/sbin"];
	process.env.PATH = `${binaryDirectory}:${essentialPaths.join(":")}`;

	return {
		binaryPath: binaryPath,
		restorePath: () => {
			process.env.PATH = originalPath;
		},
		cleanup: () => {
			process.env.PATH = originalPath; // Restore PATH first
			workspace.cleanup(); // Then cleanup workspace
		},
	};
}

/**
 * Create mock binary that simulates failure scenarios for AC3 testing
 * @param {string} errorType - Type of error: 'exit-code', 'no-output', 'permission', 'binary-not-found'
 * @param {string} testName - Test identifier for workspace isolation
 * @returns {Object} - {binaryPath, restorePath, cleanup}
 */
function setupFailingBinary(errorType, testName) {
	const workspace = createTestWorkspace(testName);
	const binaryPath = path.join(workspace.tempDir, "claude");

	let scriptContent;
	let shouldAddToPath = true;
	let permissions = "755";

	// Generate appropriate script based on error type
	switch (errorType) {
		case "exit-code":
			scriptContent = `#!/bin/bash
if [ "$1" = "--version" ]; then
  echo "Version detection failed" >&2
  exit 1
fi
exit 1`;
			break;

		case "no-output":
			scriptContent = `#!/bin/bash
if [ "$1" = "--version" ]; then
  exit 0
fi
exit 1`;
			break;

		case "permission":
			scriptContent = generateScriptContent("1.0.0");
			permissions = "644"; // Remove execute permission
			break;

		case "binary-not-found":
			scriptContent = generateScriptContent("1.0.0");
			shouldAddToPath = false; // Don't add to PATH
			break;

		default:
			throw new Error(`Unknown error type: ${errorType}`);
	}

	// Create the script file
	fs.writeFileSync(binaryPath, scriptContent, "utf8");
	fs.chmodSync(binaryPath, permissions);

	let originalPath = null;
	if (shouldAddToPath) {
		originalPath = process.env.PATH;
		const binaryDirectory = path.dirname(binaryPath);
		// Use minimal PATH to avoid conflicts with real claude binary
		const essentialPaths = ["/usr/bin", "/bin", "/usr/sbin", "/sbin"];
		process.env.PATH = `${binaryDirectory}:${essentialPaths.join(":")}`;
	}

	return {
		binaryPath: binaryPath,
		restorePath: originalPath
			? () => {
					process.env.PATH = originalPath;
				}
			: () => {},
		cleanup: () => {
			if (originalPath) {
				process.env.PATH = originalPath;
			}
			workspace.cleanup();
		},
	};
}

/**
 * Generate shell script that responds to --version flag
 * @param {string} version - Version string to return
 * @returns {string} - Shell script content
 */
function generateScriptContent(version) {
	return `#!/bin/bash
if [ "$1" = "--version" ]; then
  echo "${version}"
  exit 0
fi
echo "Error: Unknown command" >&2
exit 1`;
}

// Export factory functions following existing infrastructure patterns
export { setupMockBinary, setupFailingBinary };
