import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Test utilities for isolated temporary directory management
 * Provides safe, parallel testing against real file systems
 */
class TempDirectoryManager {
	constructor() {
		this.createdDirs = new Set();
		this.testId = this._generateTestId();
		this.baseDir = path.join(os.tmpdir(), "vitest-temp", this.testId);
	}

	/**
	 * Generate unique test ID for this test run
	 */
	_generateTestId() {
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2, 8);
		return `test-${timestamp}-${random}`;
	}

	/**
	 * Create isolated temporary directory for test
	 * @param {string} suffix - Optional suffix for directory name
	 * @returns {string} Absolute path to created directory
	 */
	createTempDir(suffix = "") {
		const dirName = suffix ? `temp-${suffix}` : "temp";
		const fullPath = path.join(this.baseDir, dirName);

		if (!fs.existsSync(fullPath)) {
			fs.mkdirSync(fullPath, { recursive: true });
		}

		this.createdDirs.add(fullPath);
		return fullPath;
	}

	/**
	 * Create temporary directory with specific structure
	 * @param {Object} structure - Directory structure to create
	 * @param {string} basePath - Base path (optional, uses temp dir if not provided)
	 * @returns {string} Base directory path
	 */
	createStructure(structure, basePath = null) {
		const baseDir = basePath || this.createTempDir();

		this._createStructureRecursive(structure, baseDir);
		return baseDir;
	}

	/**
	 * Recursively create directory structure
	 */
	_createStructureRecursive(structure, currentPath) {
		Object.entries(structure).forEach(([name, content]) => {
			const itemPath = path.join(currentPath, name);

			if (typeof content === "string") {
				// It's a file
				fs.writeFileSync(itemPath, content);
			} else if (content === null) {
				// It's an empty file
				fs.writeFileSync(itemPath, "");
			} else if (typeof content === "object") {
				// It's a directory
				fs.mkdirSync(itemPath, { recursive: true });
				this._createStructureRecursive(content, itemPath);
			}
		});
	}

	/**
	 * Write file to temporary directory
	 * @param {string} filePath - Relative path within temp directory
	 * @param {string} content - File content
	 * @param {string} tempDir - Temp directory (optional, creates one if not provided)
	 * @returns {string} Full path to created file
	 */
	writeFile(filePath, content, tempDir = null) {
		const baseDir = tempDir || this.createTempDir();
		const fullPath = path.join(baseDir, filePath);

		// Ensure parent directory exists
		const parentDir = path.dirname(fullPath);
		if (!fs.existsSync(parentDir)) {
			fs.mkdirSync(parentDir, { recursive: true });
		}

		fs.writeFileSync(fullPath, content);
		return fullPath;
	}

	/**
	 * Read file from temporary directory
	 * @param {string} filePath - Path to file
	 * @returns {string} File content
	 */
	readFile(filePath) {
		return fs.readFileSync(filePath, "utf8");
	}

	/**
	 * Check if file exists in temporary directory
	 * @param {string} filePath - Path to check
	 * @returns {boolean} True if file exists
	 */
	fileExists(filePath) {
		return fs.existsSync(filePath);
	}

	/**
	 * List files in directory
	 * @param {string} dirPath - Directory to list
	 * @param {boolean} recursive - Whether to list recursively
	 * @returns {Array<string>} Array of file paths
	 */
	listFiles(dirPath, recursive = false) {
		if (!fs.existsSync(dirPath)) {
			return [];
		}

		const files = [];
		const items = fs.readdirSync(dirPath);

		items.forEach((item) => {
			const itemPath = path.join(dirPath, item);
			const stat = fs.statSync(itemPath);

			if (stat.isFile()) {
				files.push(itemPath);
			} else if (stat.isDirectory() && recursive) {
				files.push(...this.listFiles(itemPath, true));
			}
		});

		return files;
	}

	/**
	 * Clean up all created temporary directories
	 */
	cleanup() {
		this.createdDirs.forEach((dir) => {
			try {
				if (fs.existsSync(dir)) {
					fs.rmSync(dir, { recursive: true, force: true });
				}
			} catch (error) {
				console.warn(`Failed to cleanup temp directory: ${dir}`, error.message);
			}
		});
		this.createdDirs.clear();
	}

	/**
	 * Get the base temporary directory for this test session
	 * @returns {string} Base directory path
	 */
	getBaseDir() {
		return this.baseDir;
	}
}

/**
 * Create and register a temporary directory manager for a test
 * Automatically registers cleanup callback
 */
function createTempDirManager() {
	const manager = new TempDirectoryManager();

	// Register cleanup callback
	if (global.testCleanupCallbacks) {
		global.testCleanupCallbacks.push(() => manager.cleanup());
	}

	return manager;
}

/**
 * Helper function for creating simple test structures
 */
function createTestStructure(structure) {
	const manager = createTempDirManager();
	const baseDir = manager.createStructure(structure);
	return { manager, baseDir };
}

export { TempDirectoryManager, createTempDirManager, createTestStructure };
