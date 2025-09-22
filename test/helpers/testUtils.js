import { createTempDirManager } from "../utils/temp-directory.js";

/**
 * Create isolated test workspace for parallel testing
 * @param {string} testName - Name identifier for the test workspace
 * @returns {Object} - {tempDir: string, cleanup: function}
 */
function createTestWorkspace(testName) {
	const manager = createTempDirManager();
	const tempDir = manager.createTempDir(testName);

	return {
		tempDir,
		cleanup: () => manager.cleanup(),
	};
}

export { createTestWorkspace };
