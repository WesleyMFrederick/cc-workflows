import { describe, it, expect, afterEach } from "vitest";
import { createTestWorktree, createTempDir } from "./helpers/test-helpers.js";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

describe("conditional-claude error handling", () => {
	let fixture = null;

	afterEach(() => {
		if (fixture) {
			fixture.cleanup();
			fixture = null;
		}
	});

	it("should error when real claude not found in PATH", () => {
		// Fixture: Create temporary directory (not a git repo, so routes to real claude)
		const tempFixture = createTempDir();
		fixture = tempFixture;

		// Integration: Run conditional-claude.sh with minimal PATH that excludes real claude
		const scriptPath = join(
			process.cwd(),
			"packages/sandbox/conditional-claude.sh"
		);

		// Decision: Use minimal PATH without system directories where claude might exist
		const result = spawnSync(scriptPath, ["-p", "echo test"], {
			cwd: tempFixture.path,
			encoding: "utf8",
			input: "", // Provide empty stdin
			env: {
				...process.env,
				PATH: "/usr/bin:/bin", // Minimal PATH without claude
			},
		});

		// Verification: Should have exit code 127 (command not found)
		expect(result.status).toBe(127);

		// Verification: Error message should indicate real claude not found
		const stderr = result.stderr || "";
		expect(stderr).toContain("Real Claude binary not found in PATH");
	});
});
