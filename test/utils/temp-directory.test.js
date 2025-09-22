import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTempDirManager, createTestStructure } from "./temp-directory.js";

describe("TempDirectoryManager", () => {
	let manager;

	beforeEach(() => {
		manager = createTempDirManager();
	});

	afterEach(() => {
		manager.cleanup();
	});

	it("creates isolated temporary directories", () => {
		const tempDir = manager.createTempDir("test");

		expect(fs.existsSync(tempDir)).toBe(true);
		expect(tempDir).toMatch(/test-\d+-\w+/);
		expect(tempDir).toMatch(/temp-test$/);
	});

	it("creates multiple isolated directories", () => {
		const dir1 = manager.createTempDir("one");
		const dir2 = manager.createTempDir("two");

		expect(dir1).not.toBe(dir2);
		expect(fs.existsSync(dir1)).toBe(true);
		expect(fs.existsSync(dir2)).toBe(true);
	});

	it("writes and reads files correctly", () => {
		const tempDir = manager.createTempDir();
		const content = "test content";

		const filePath = manager.writeFile("test.txt", content, tempDir);
		const readContent = manager.readFile(filePath);

		expect(readContent).toBe(content);
		expect(manager.fileExists(filePath)).toBe(true);
	});

	it("creates directory structure", () => {
		const structure = {
			"file1.txt": "content1",
			subdir: {
				"file2.txt": "content2",
				"empty.txt": null,
			},
		};

		const baseDir = manager.createStructure(structure);

		expect(manager.fileExists(path.join(baseDir, "file1.txt"))).toBe(true);
		expect(manager.fileExists(path.join(baseDir, "subdir", "file2.txt"))).toBe(
			true,
		);
		expect(manager.fileExists(path.join(baseDir, "subdir", "empty.txt"))).toBe(
			true,
		);

		expect(manager.readFile(path.join(baseDir, "file1.txt"))).toBe("content1");
		expect(manager.readFile(path.join(baseDir, "subdir", "file2.txt"))).toBe(
			"content2",
		);
	});

	it("lists files correctly", () => {
		const tempDir = manager.createTempDir();
		manager.writeFile("file1.txt", "content", tempDir);
		manager.writeFile("subdir/file2.txt", "content", tempDir);

		const files = manager.listFiles(tempDir, true);

		expect(files).toHaveLength(2);
		expect(files.some((f) => f.endsWith("file1.txt"))).toBe(true);
		expect(files.some((f) => f.endsWith("file2.txt"))).toBe(true);
	});

	it("cleans up directories", () => {
		const tempDir = manager.createTempDir();
		expect(fs.existsSync(tempDir)).toBe(true);

		manager.cleanup();
		expect(fs.existsSync(tempDir)).toBe(false);
	});
});

describe("createTestStructure helper", () => {
	it("creates structure and returns manager", () => {
		const structure = {
			"test.txt": "content",
		};

		const { manager, baseDir } = createTestStructure(structure);

		expect(fs.existsSync(baseDir)).toBe(true);
		expect(manager.fileExists(path.join(baseDir, "test.txt"))).toBe(true);

		// Cleanup
		manager.cleanup();
	});
});
