import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { runScript, createTestWorktree, createTempDir } from "./helpers/test-helpers.js";
import { join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";

describe("conditional-claude --deny-path support", () => {
	let fixture = null;
	let denyFixture = null;

	beforeEach(() => {
		// Create test files/dirs to deny
		denyFixture = createTempDir();
		mkdirSync(join(denyFixture.path, "secret-dir"), { recursive: true });
		writeFileSync(join(denyFixture.path, "secret-file.txt"), "SECRET DATA");
	});

	afterEach(() => {
		if (fixture) {
			fixture.cleanup();
			fixture = null;
		}
		if (denyFixture) {
			denyFixture.cleanup();
			denyFixture = null;
		}
	});

	it("should accept --deny-path flag with space syntax", () => {
		// Fixture: Create test worktree
		fixture = createTestWorktree();

		// Integration: Run conditional-claude.sh with --deny-path
		const scriptPath = join(
			process.cwd(),
			"packages/sandbox/conditional-claude.sh"
		);

		const secretPath = join(denyFixture.path, "secret-file.txt");

		let stderr = "";
		try {
			runScript(scriptPath, ["--deny-path", secretPath, "show git status"], {
				cwd: fixture.worktree,
				stdio: "pipe",
			});
		} catch (error) {
			// Pattern: Capture stderr (may fail downstream but should process flag)
			stderr = error.stderr || "";
		}

		// Verification: Should show deny-path processing message
		expect(stderr).toContain("🚫 Denying access");
		expect(stderr).toContain(secretPath);
	});

	it("should accept --deny-path=PATH syntax", () => {
		// Fixture: Create test worktree
		fixture = createTestWorktree();

		const scriptPath = join(
			process.cwd(),
			"packages/sandbox/conditional-claude.sh"
		);

		const secretPath = join(denyFixture.path, "secret-dir");

		let stderr = "";
		try {
			runScript(scriptPath, [`--deny-path=${secretPath}`, "show git status"], {
				cwd: fixture.worktree,
				stdio: "pipe",
			});
		} catch (error) {
			stderr = error.stderr || "";
		}

		// Verification: Should process deny-path with equals syntax
		expect(stderr).toContain("🚫 Denying access");
		expect(stderr).toContain(secretPath);
	});

	it("should accept multiple --deny-path flags", () => {
		// Fixture: Create test worktree
		fixture = createTestWorktree();

		const scriptPath = join(
			process.cwd(),
			"packages/sandbox/conditional-claude.sh"
		);

		const secretFile = join(denyFixture.path, "secret-file.txt");
		const secretDir = join(denyFixture.path, "secret-dir");

		let stderr = "";
		try {
			runScript(
				scriptPath,
				[
					"--deny-path", secretFile,
					"--deny-path", secretDir,
					"show git status"
				],
				{
					cwd: fixture.worktree,
					stdio: "pipe",
				}
			);
		} catch (error) {
			stderr = error.stderr || "";
		}

		// Verification: Should process both deny-paths
		expect(stderr).toContain(secretFile);
		expect(stderr).toContain(secretDir);
	});

	it("should error when --deny-path missing argument", () => {
		// Fixture: Create test worktree
		fixture = createTestWorktree();

		const scriptPath = join(
			process.cwd(),
			"packages/sandbox/conditional-claude.sh"
		);

		// Integration: Run with --deny-path but no path argument
		let error = null;
		try {
			runScript(scriptPath, ["--deny-path"], {
				cwd: fixture.worktree,
				stdio: "pipe",
			});
		} catch (err) {
			error = err;
		}

		// Verification: Should exit with error and show message
		expect(error).not.toBeNull();
		expect(error.status).toBe(1);
		expect(error.stderr).toContain("--deny-path requires a path argument");
	});

	it("should pass through to real claude outside worktree", () => {
		// Fixture: Create non-worktree temp directory
		const nonWorktree = createTempDir();

		const scriptPath = join(
			process.cwd(),
			"packages/sandbox/conditional-claude.sh"
		);

		const secretPath = join(denyFixture.path, "secret-file.txt");

		let stderr = "";
		let stdout = "";
		try {
			const result = runScript(scriptPath, ["--deny-path", secretPath, "--help"], {
				cwd: nonWorktree.path,
				stdio: "pipe",
			});
			stdout = result.stdout;
			stderr = result.stderr;
		} catch (error) {
			stderr = error.stderr || "";
			stdout = error.stdout || "";
		}

		// Verification: Should NOT show sandbox messages outside worktree
		expect(stderr).not.toContain("🔍 Detected git worktree");
		expect(stderr).not.toContain("🔒 Running Claude Code in Seatbelt sandbox");

		// Should show Claude's help output (passed through)
		expect(stdout + stderr).toContain("Usage:");

		// Cleanup
		nonWorktree.cleanup();
	});
});