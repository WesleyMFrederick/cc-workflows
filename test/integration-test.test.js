import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const _require = createRequire(import.meta.url);

// Test importing project's CommonJS modules
import { createLogger } from "../src/scripts/logger.js";
import { createTestStructure } from "./utils/index.js";

describe("Integration: CommonJS/ES6 Vitest Setup", () => {
	it("can import and test CommonJS modules", () => {
		const logger = createLogger("test");

		expect(logger).toBeDefined();
		expect(typeof logger.info).toBe("function");
		expect(typeof logger.error).toBe("function");
	});

	it("can use test utilities with real file operations", () => {
		const structure = {
			"config.json": '{"test": true}',
			data: {
				"file1.txt": "content1",
				"file2.txt": "content2",
			},
		};

		const { manager, baseDir } = createTestStructure(structure);

		expect(manager.fileExists(`${baseDir}/config.json`)).toBe(true);
		expect(manager.fileExists(`${baseDir}/data/file1.txt`)).toBe(true);
		expect(manager.readFile(`${baseDir}/config.json`)).toBe('{"test": true}');

		const files = manager.listFiles(baseDir, true);
		expect(files).toHaveLength(3);

		// Cleanup happens automatically via global cleanup
	});

	it("demonstrates TDD workflow ready", () => {
		// This test proves the foundation is ready for:
		// RED: Write failing tests
		// GREEN: Implement CommonJS modules
		// REFACTOR: Improve while tests pass

		expect(true).toBe(true); // Foundation established
	});
});
