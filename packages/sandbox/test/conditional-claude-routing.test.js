import { describe, it, expect, afterEach } from "vitest";
import {
	runScript,
	createTestWorktree,
	createTempDir,
} from "./helpers/test-helpers.js";
import { join } from "node:path";

describe("conditional-claude routing", () => {
	let fixture = null;

	afterEach(() => {
		if (fixture) {
			fixture.cleanup();
			fixture = null;
		}
	});

	it("should route to real claude when in regular repo", () => {
		// Fixture: Create test worktree but run in mainRepo (not worktree)
		fixture = createTestWorktree();

		// Integration: Run conditional-claude.sh in mainRepo
		const scriptPath = join(
			process.cwd(),
			"packages/sandbox/conditional-claude.sh",
		);

		// Decision: We expect the script to route to real claude
		// with timeout to prevent hanging
		let stderr = "";
		let status = null;
		try {
			const result = runScript(scriptPath, ["-p", "echo test"], {
				cwd: fixture.mainRepo,
				stdio: "pipe",
				timeout: 2000, // Timeout to prevent hanging on real claude execution
			});
			status = result.status;
			stderr = result.stderr;
		} catch (error) {
			// Timeout is expected since claude continues running
			// Capture stderr to verify no sandbox messages
			stderr = error.stderr || "";
			status = error.status;
		}

		// Verification: No sandbox messages should appear
		expect(stderr).not.toContain("🔍 Detected git worktree");
		expect(stderr).not.toContain("🔒 Running Claude Code in Seatbelt sandbox");
		expect(stderr).not.toContain("not yet implemented");
	}, 5000);

	it("should route to sandboxed wrapper when in worktree", () => {
		// Fixture: Create test worktree
		fixture = createTestWorktree();

		// Integration: Run conditional-claude.sh in worktree
		const scriptPath = join(
			process.cwd(),
			"packages/sandbox/conditional-claude.sh",
		);

		let stderr = "";
		try {
			runScript(scriptPath, ["-p", "echo test"], {
				cwd: fixture.worktree,
				stdio: "pipe",
			});
		} catch (error) {
			// Pattern: Capture stderr from error (downstream script may fail)
			stderr = error.stderr || "";
		}

		// Verification: Sandbox routing messages should appear
		expect(stderr).toContain("🔍 Detected git worktree");
		expect(stderr).toContain("🔒 Running Claude Code in Seatbelt sandbox");
	});
});
