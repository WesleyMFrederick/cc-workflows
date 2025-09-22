import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const _require = createRequire(import.meta.url);

import { createTestWorkspace } from "./testUtils.js";

describe("createTestWorkspace", () => {
	let createdWorkspaces = [];

	beforeEach(() => {
		// Track workspaces for manual cleanup if needed
		createdWorkspaces = [];
	});

	it("should create unique temp directory and return correct object structure", () => {
		const testName = "basic-test";
		const workspace = createTestWorkspace(testName);
		createdWorkspaces.push(workspace);

		// Verify return object structure
		expect(workspace).toHaveProperty("tempDir");
		expect(workspace).toHaveProperty("cleanup");
		expect(typeof workspace.tempDir).toBe("string");
		expect(typeof workspace.cleanup).toBe("function");

		// Verify directory was created
		expect(fs.existsSync(workspace.tempDir)).toBe(true);

		// Verify directory path includes test name
		expect(workspace.tempDir).toContain(`temp-${testName}`);

		// Verify directory is in OS temp directory
		expect(workspace.tempDir).toContain(os.tmpdir());
	});

	it("should create unique directories for different test names", () => {
		const workspace1 = createTestWorkspace("test-1");
		const workspace2 = createTestWorkspace("test-2");
		createdWorkspaces.push(workspace1, workspace2);

		// Verify directories are different
		expect(workspace1.tempDir).not.toBe(workspace2.tempDir);

		// Verify both directories exist
		expect(fs.existsSync(workspace1.tempDir)).toBe(true);
		expect(fs.existsSync(workspace2.tempDir)).toBe(true);

		// Verify test names are included in paths
		expect(workspace1.tempDir).toContain("temp-test-1");
		expect(workspace2.tempDir).toContain("temp-test-2");
	});

	it("should create unique directories even with same test name (parallel safety)", () => {
		const testName = "same-name";
		const workspace1 = createTestWorkspace(testName);
		const workspace2 = createTestWorkspace(testName);
		createdWorkspaces.push(workspace1, workspace2);

		// Even with same test name, directories should be unique due to timestamp/random
		expect(workspace1.tempDir).not.toBe(workspace2.tempDir);

		// Both should exist
		expect(fs.existsSync(workspace1.tempDir)).toBe(true);
		expect(fs.existsSync(workspace2.tempDir)).toBe(true);

		// Both should contain the test name
		expect(workspace1.tempDir).toContain(`temp-${testName}`);
		expect(workspace2.tempDir).toContain(`temp-${testName}`);
	});

	it("should allow file operations in workspace directory", () => {
		const workspace = createTestWorkspace("file-ops");
		createdWorkspaces.push(workspace);

		// Write a test file
		const testFile = path.join(workspace.tempDir, "test.txt");
		fs.writeFileSync(testFile, "test content");

		// Verify file exists and has correct content
		expect(fs.existsSync(testFile)).toBe(true);
		expect(fs.readFileSync(testFile, "utf8")).toBe("test content");

		// Create subdirectory
		const subDir = path.join(workspace.tempDir, "subdir");
		fs.mkdirSync(subDir);

		// Write file in subdirectory
		const subFile = path.join(subDir, "subfile.txt");
		fs.writeFileSync(subFile, "sub content");

		expect(fs.existsSync(subFile)).toBe(true);
		expect(fs.readFileSync(subFile, "utf8")).toBe("sub content");
	});

	it("should cleanup workspace directory completely", () => {
		const workspace = createTestWorkspace("cleanup-test");

		// Create some content in the workspace
		const testFile = path.join(workspace.tempDir, "test.txt");
		fs.writeFileSync(testFile, "content");

		const subDir = path.join(workspace.tempDir, "subdir");
		fs.mkdirSync(subDir);

		const subFile = path.join(subDir, "subfile.txt");
		fs.writeFileSync(subFile, "sub content");

		// Verify content exists
		expect(fs.existsSync(workspace.tempDir)).toBe(true);
		expect(fs.existsSync(testFile)).toBe(true);
		expect(fs.existsSync(subFile)).toBe(true);

		// Cleanup
		workspace.cleanup();

		// Verify everything is cleaned up
		expect(fs.existsSync(workspace.tempDir)).toBe(false);
		expect(fs.existsSync(testFile)).toBe(false);
		expect(fs.existsSync(subFile)).toBe(false);
	});

	it("should handle multiple cleanups gracefully", () => {
		const workspace = createTestWorkspace("multiple-cleanup");

		// Create some content
		fs.writeFileSync(path.join(workspace.tempDir, "test.txt"), "content");

		// First cleanup
		workspace.cleanup();
		expect(fs.existsSync(workspace.tempDir)).toBe(false);

		// Second cleanup should not throw error
		expect(() => workspace.cleanup()).not.toThrow();
	});

	it("should work with special characters in test names", () => {
		const testName = "test-with-special_chars.and-numbers123";
		const workspace = createTestWorkspace(testName);
		createdWorkspaces.push(workspace);

		expect(fs.existsSync(workspace.tempDir)).toBe(true);
		expect(workspace.tempDir).toContain(`temp-${testName}`);

		// Should be able to create files
		const testFile = path.join(workspace.tempDir, "file.txt");
		fs.writeFileSync(testFile, "content");
		expect(fs.existsSync(testFile)).toBe(true);
	});

	it("should demonstrate parallel safety with concurrent operations", () => {
		// Simulate multiple tests running concurrently
		const workspaces = [];
		const testNames = ["concurrent-1", "concurrent-2", "concurrent-3"];

		// Create workspaces simultaneously
		testNames.forEach((name) => {
			const workspace = createTestWorkspace(name);
			workspaces.push(workspace);
			createdWorkspaces.push(workspace);

			// Create unique content in each workspace
			fs.writeFileSync(
				path.join(workspace.tempDir, "content.txt"),
				`Content for ${name}`,
			);
		});

		// Verify all workspaces are unique and functional
		const dirs = workspaces.map((w) => w.tempDir);
		const uniqueDirs = new Set(dirs);
		expect(uniqueDirs.size).toBe(testNames.length); // All directories are unique

		// Verify each workspace has its own content
		workspaces.forEach((workspace, index) => {
			const content = fs.readFileSync(
				path.join(workspace.tempDir, "content.txt"),
				"utf8",
			);
			expect(content).toBe(`Content for ${testNames[index]}`);
		});
	});

	// Cleanup any remaining workspaces after each test
	afterEach(() => {
		createdWorkspaces.forEach((workspace) => {
			try {
				workspace.cleanup();
			} catch (_error) {
				// Ignore cleanup errors in tests
			}
		});
	});
});
