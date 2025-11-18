import { describe, it, expect, afterEach } from "vitest";
import { runScript, createTestWorktree } from "./helpers/test-helpers.js";
import { join } from "node:path";

describe("conditional-claude flag pass-through", () => {
	let fixture = null;

	afterEach(() => {
		if (fixture) {
			fixture.cleanup();
			fixture = null;
		}
	});

	it("should pass through print flag", () => {
		// Fixture: Create test worktree
		fixture = createTestWorktree();

		// Integration: Run conditional-claude.sh in worktree with -p flag
		const scriptPath = join(
			process.cwd(),
			"packages/sandbox/conditional-claude.sh",
		);

		let stderr = "";
		try {
			runScript(scriptPath, ["-p", "echo TESTOUTPUT"], {
				cwd: fixture.worktree,
				stdio: "pipe",
			});
		} catch (error) {
			// Pattern: Capture stderr from error (script may fail downstream)
			stderr = error.stderr || "";
		}

		// Verification: No syntax errors or flag rejection errors
		// The flag passes through correctly even if downstream fails
		expect(stderr).not.toContain("unknown option");
		expect(stderr).not.toContain("Unrecognized option");
	});

	it("should pass through multiple combined flags", () => {
		// Fixture: Create test worktree
		fixture = createTestWorktree();

		// Integration: Run conditional-claude.sh with multiple flags
		const scriptPath = join(
			process.cwd(),
			"packages/sandbox/conditional-claude.sh",
		);

		let stderr = "";
		try {
			runScript(
				scriptPath,
				["--model", "sonnet", "--verbose", "-p", "echo multitest"],
				{
					cwd: fixture.worktree,
					stdio: "pipe",
				},
			);
		} catch (error) {
			// Pattern: Capture stderr from error (script may fail downstream)
			stderr = error.stderr || "";
		}

		// Verification: No "unknown option" errors should appear
		// All flags should pass through correctly to the downstream script
		expect(stderr).not.toContain("unknown option");
		expect(stderr).not.toContain("Unrecognized option");
	});
});
