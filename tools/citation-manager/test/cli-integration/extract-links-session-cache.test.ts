import { execSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const CLI_PATH = join(__dirname, "../../dist/citation-manager.js");

describe("extract links --session (cache integration)", () => {
	let testDir: string;

	beforeEach(() => {
		testDir = join(
			tmpdir(),
			`session-cache-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		);
		mkdirSync(testDir, { recursive: true });

		// Create source markdown with a citation (wiki links require |displayText)
		writeFileSync(
			join(testDir, "source.md"),
			"# Source\n\nSee [[target.md#Section One|Section One]] for details.\n",
		);

		// Create target markdown with the referenced section
		writeFileSync(
			join(testDir, "target.md"),
			"# Target\n\n## Section One\n\nThis is section one content.\n",
		);
	});

	afterEach(() => {
		rmSync(testDir, { recursive: true, force: true });
	});

	it("first call with --session produces JSON output (cache miss)", () => {
		const sourcePath = join(testDir, "source.md");
		const output = execSync(
			`node "${CLI_PATH}" extract links "${sourcePath}" --scope "${testDir}" --session test-session-1`,
			{ encoding: "utf8", cwd: testDir },
		);

		const result = JSON.parse(output);
		expect(result.extractedContentBlocks).toBeDefined();
		expect(result.stats).toBeDefined();
	});

	it("second call with same --session produces no output (cache hit)", () => {
		const sourcePath = join(testDir, "source.md");

		// First call — cache miss
		execSync(
			`node "${CLI_PATH}" extract links "${sourcePath}" --scope "${testDir}" --session test-session-2`,
			{ encoding: "utf8", cwd: testDir },
		);

		// Second call — cache hit, should produce empty stdout
		const output = execSync(
			`node "${CLI_PATH}" extract links "${sourcePath}" --scope "${testDir}" --session test-session-2`,
			{ encoding: "utf8", cwd: testDir },
		);

		expect(output.trim()).toBe("");
	});

	it("call without --session always performs extraction (backward compat)", () => {
		// Use existing fixtures that are known to work
		const fixtureSource = join(__dirname, "../fixtures/extract-test-source.md");

		// First call without --session
		const output1 = execSync(
			`node "${CLI_PATH}" extract links "${fixtureSource}" --full-files`,
			{ encoding: "utf8" },
		);
		const result1 = JSON.parse(output1);
		expect(result1.extractedContentBlocks).toBeDefined();

		// Second call without --session — still produces output (no caching)
		const output2 = execSync(
			`node "${CLI_PATH}" extract links "${fixtureSource}" --full-files`,
			{ encoding: "utf8" },
		);
		const result2 = JSON.parse(output2);
		expect(result2.extractedContentBlocks).toBeDefined();
	});
});
