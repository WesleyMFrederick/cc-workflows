import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ensureOutputDir } from "../src/ensureOutputDir.js";

const TEST_OUTPUT_DIR = join(import.meta.dirname, "test-output");

describe("Output Directory Management", () => {
	afterEach(() => {
		// Clean up test directory
		if (existsSync(TEST_OUTPUT_DIR)) {
			rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
		}
	});

	it("should create output directory if it does not exist", () => {
		// Given: Output directory does not exist
		if (existsSync(TEST_OUTPUT_DIR)) {
			rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
		}

		// When: Directory is ensured
		const path = ensureOutputDir(TEST_OUTPUT_DIR);

		// Then: Directory is created
		expect(existsSync(TEST_OUTPUT_DIR)).toBe(true);
		expect(path).toBe(TEST_OUTPUT_DIR);
	});

	it("should not fail if directory already exists", () => {
		// Given: Output directory already exists
		ensureOutputDir(TEST_OUTPUT_DIR);

		// When: Directory is ensured again
		const path = ensureOutputDir(TEST_OUTPUT_DIR);

		// Then: No error and path returned
		expect(existsSync(TEST_OUTPUT_DIR)).toBe(true);
		expect(path).toBe(TEST_OUTPUT_DIR);
	});
});
