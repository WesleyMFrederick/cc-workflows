import { execSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Execute bash script and return output
 * Integration: Uses spawnSync for synchronous shell execution
 *
 * @param {string} scriptPath - Path to the bash script
 * @param {string[]} args - Arguments to pass to the script
 * @param {object} options - Options for spawnSync
 * @returns {object} - { stdout, stderr, status }
 */
export function runScript(scriptPath, args = [], options = {}) {
	const defaultOptions = {
		encoding: "utf8",
		input: "", // Provide empty stdin to prevent hanging on interactive prompts
		...options,
	};

	// Integration: Spawn bash script synchronously
	const result = spawnSync(scriptPath, args, defaultOptions);

	// Decision: Throw on non-zero exit with full context
	if (result.status !== 0) {
		const error = new Error(
			`Script exited with code ${result.status}: ${scriptPath}`,
		);
		error.status = result.status;
		error.stdout = result.stdout || "";
		error.stderr = result.stderr || "";
		throw error;
	}

	return {
		stdout: result.stdout || "",
		stderr: result.stderr || "",
		status: result.status,
	};
}

/**
 * Create temporary git repository with worktree
 * Fixture: Real git repo structure for testing git detection
 * Integration: Uses real git commands via execSync
 *
 * @returns {object} - { mainRepo: string, worktree: string, cleanup: function }
 */
export function createTestWorktree() {
	// --- Temp Directory Creation ---
	// Boundary: Create in OS temp location
	const testDir = mkdtempSync(join(tmpdir(), "sandbox-test-"));

	try {
		// --- Git Initialization ---
		// Integration: Real git init command
		execSync("git init", { cwd: testDir, stdio: "pipe" });
		execSync('git config user.email "test@example.com"', {
			cwd: testDir,
			stdio: "pipe",
		});
		execSync('git config user.name "Test User"', {
			cwd: testDir,
			stdio: "pipe",
		});

		// --- Initial Commit ---
		// Fixture: Minimal file for valid git repo
		writeFileSync(join(testDir, "README.md"), "# Test Repo");
		execSync("git add .", { cwd: testDir, stdio: "pipe" });
		execSync('git commit -m "Initial commit"', {
			cwd: testDir,
			stdio: "pipe",
		});

		// --- Worktree Creation ---
		const worktreeDir = join(testDir, ".worktrees", "test-branch");
		execSync(`git worktree add "${worktreeDir}" -b test-branch`, {
			cwd: testDir,
			stdio: "pipe",
		});

		return {
			mainRepo: testDir,
			worktree: worktreeDir,
			cleanup: () => {
				// Pattern: Remove worktree before directory
				try {
					execSync(`git worktree remove "${worktreeDir}" --force`, {
						cwd: testDir,
						stdio: "pipe",
					});
				} catch {
					// Ignore cleanup errors
				}
				try {
					rmSync(testDir, { recursive: true, force: true });
				} catch {
					// Ignore if already removed
				}
			},
		};
	} catch (error) {
		// Cleanup on initialization failure
		try {
			rmSync(testDir, { recursive: true, force: true });
		} catch {
			// Ignore
		}
		throw error;
	}
}

/**
 * Create temporary directory (not a git repo)
 * Fixture: Non-git directory for negative test cases
 *
 * @returns {object} - { path: string, cleanup: function }
 */
export function createTempDir() {
	const tempDir = mkdtempSync(join(tmpdir(), "sandbox-nogit-"));

	return {
		path: tempDir,
		cleanup: () => {
			try {
				rmSync(tempDir, { recursive: true, force: true });
			} catch {
				// Ignore if already removed
			}
		},
	};
}
