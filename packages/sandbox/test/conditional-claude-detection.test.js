import { describe, it, expect, afterEach } from "vitest";
import { runScript, createTestWorktree, createTempDir } from "./helpers/test-helpers.js";
import { join } from "node:path";

describe("conditional-claude worktree detection", () => {
	let fixture = null;

	afterEach(() => {
		if (fixture) {
			fixture.cleanup();
			fixture = null;
		}
	});

	it("should detect git worktree and show sandbox messages", () => {
		// Fixture: Create test worktree
		fixture = createTestWorktree();

		// Integration: Run conditional-claude.sh in worktree with test command
		const scriptPath = join(
			process.cwd(),
			"packages/sandbox/conditional-claude.sh"
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

		// Verification: Check for expected messages in stderr
		expect(stderr).toContain("🔍 Detected git worktree");
		expect(stderr).toContain("🔒 Running Claude Code in Seatbelt sandbox");
	});

	it(
		"should detect when in regular git repository",
		() => {
			// Fixture: Create test worktree but run in mainRepo (not worktree)
			fixture = createTestWorktree();

			// Integration: Run conditional-claude.sh in mainRepo with test command
			const scriptPath = join(
				process.cwd(),
				"packages/sandbox/conditional-claude.sh"
			);

			let stderr = "";
			try {
				runScript(scriptPath, ["-p", "echo test"], {
					cwd: fixture.mainRepo,
					stdio: "pipe",
					timeout: 2000, // Timeout to prevent hanging on real claude execution
				});
			} catch (error) {
				// Pattern: Capture stderr from error (timeout is expected)
				stderr = error.stderr || "";
			}

			// Verification: NO sandbox messages should appear for regular repo
			expect(stderr).not.toContain("🔍 Detected git worktree");
			expect(stderr).not.toContain("🔒 Running Claude Code in Seatbelt sandbox");
		},
		5000
	);

	it(
		"should detect when not in git repository",
		() => {
			// Fixture: Create temp directory (not a git repo)
			const nonGitFixture = createTempDir();
			fixture = nonGitFixture;

			// Integration: Run conditional-claude.sh in non-git directory
			const scriptPath = join(
				process.cwd(),
				"packages/sandbox/conditional-claude.sh"
			);

			let stderr = "";
			try {
				runScript(scriptPath, ["-p", "echo test"], {
					cwd: nonGitFixture.path,
					stdio: "pipe",
					timeout: 2000, // Timeout to prevent hanging on real claude execution
				});
			} catch (error) {
				// Pattern: Capture stderr from error (timeout is expected)
				stderr = error.stderr || "";
			}

			// Verification: NO sandbox messages should appear for non-git directory
			expect(stderr).not.toContain("🔍 Detected git worktree");
			expect(stderr).not.toContain("🔒 Running Claude Code in Seatbelt sandbox");
		},
		5000
	);
});
