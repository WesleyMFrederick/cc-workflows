import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setupFailingBinary, setupMockBinary } from "./mockBinary.js";

describe("mockBinary", () => {
	let originalPath;
	let mockSetups = [];

	beforeEach(() => {
		// Store original PATH for restoration
		originalPath = process.env.PATH;
		mockSetups = [];
	});

	afterEach(() => {
		// Clean up all mock setups
		mockSetups.forEach((setup) => {
			try {
				setup.cleanup();
			} catch (error) {
				console.warn("Failed to cleanup mock binary:", error.message);
			}
		});
		mockSetups = [];

		// Ensure PATH is restored
		process.env.PATH = originalPath;
	});

	describe("setupMockBinary", () => {
		it("should create a mock binary that responds to --version with specified version", () => {
			const setup = setupMockBinary("1.2.3", "version-test");
			mockSetups.push(setup);

			// Verify binary file exists and is executable
			expect(fs.existsSync(setup.binaryPath)).toBe(true);
			const stats = fs.statSync(setup.binaryPath);
			expect(stats.mode & 0o111).toBeTruthy(); // Check execute permissions

			// Test version command execution
			const result = execSync("claude --version", { encoding: "utf8" }).trim();
			expect(result).toBe("1.2.3");
		});

		it("should create executable binary in temporary directory", () => {
			const setup = setupMockBinary("2.0.0", "exec-test");
			mockSetups.push(setup);

			// Verify file is in a temporary directory
			expect(setup.binaryPath).toContain("vitest-temp");
			expect(path.basename(setup.binaryPath)).toBe("claude");

			// Verify file is executable
			const stats = fs.statSync(setup.binaryPath);
			expect(stats.mode & 0o111).toBeTruthy();
		});

		it("should modify PATH to include mock binary directory", () => {
			const setup = setupMockBinary("3.0.0", "path-test");
			mockSetups.push(setup);

			const binaryDirectory = path.dirname(setup.binaryPath);
			expect(process.env.PATH).toContain(binaryDirectory);
			expect(process.env.PATH.startsWith(`${binaryDirectory}:`)).toBe(true);
		});

		it("should return error for unknown commands", () => {
			const setup = setupMockBinary("1.0.0", "error-test");
			mockSetups.push(setup);

			expect(() => {
				execSync("claude unknown-command", { encoding: "utf8", stdio: "pipe" });
			}).toThrow();
		});

		it("should provide working restorePath function", () => {
			const setup = setupMockBinary("1.0.0", "restore-test");
			mockSetups.push(setup);

			const modifiedPath = process.env.PATH;
			setup.restorePath();
			expect(process.env.PATH).toBe(originalPath);
			expect(process.env.PATH).not.toBe(modifiedPath);
		});

		it("should cleanup properly with full cleanup function", () => {
			const setup = setupMockBinary("1.0.0", "cleanup-test");

			const binaryPath = setup.binaryPath;
			expect(fs.existsSync(binaryPath)).toBe(true);

			setup.cleanup();

			// PATH should be restored
			expect(process.env.PATH).toBe(originalPath);

			// Binary should be cleaned up (temp directory removed)
			expect(fs.existsSync(binaryPath)).toBe(false);
		});
	});

	describe("setupFailingBinary", () => {
		it("should create binary that exits with error code for exit-code type", () => {
			const setup = setupFailingBinary("exit-code", "exit-code-test");
			mockSetups.push(setup);

			expect(() => {
				execSync("claude --version", { encoding: "utf8", stdio: "pipe" });
			}).toThrow();
		});

		it("should create binary that returns no output for no-output type", () => {
			const setup = setupFailingBinary("no-output", "no-output-test");
			mockSetups.push(setup);

			const result = execSync("claude --version", { encoding: "utf8" }).trim();
			expect(result).toBe("");
		});

		it("should create binary with no execute permissions for permission type", () => {
			const setup = setupFailingBinary("permission", "permission-test");
			mockSetups.push(setup);

			// Verify file exists but is not executable
			expect(fs.existsSync(setup.binaryPath)).toBe(true);
			const stats = fs.statSync(setup.binaryPath);
			expect(stats.mode & 0o111).toBeFalsy(); // No execute permissions

			expect(() => {
				execSync("claude --version", { encoding: "utf8", stdio: "pipe" });
			}).toThrow();
		});

		it("should not modify PATH for binary-not-found type", () => {
			// First, temporarily clear PATH to simulate no claude binary
			const tempPath = process.env.PATH;
			process.env.PATH = "/usr/bin:/bin:/usr/sbin:/sbin"; // Minimal PATH without claude

			const setup = setupFailingBinary("binary-not-found", "not-found-test");
			mockSetups.push(setup);

			// PATH should not be modified from the minimal path
			expect(process.env.PATH).toBe("/usr/bin:/bin:/usr/sbin:/sbin");

			// Binary should exist but not be in PATH
			expect(fs.existsSync(setup.binaryPath)).toBe(true);

			expect(() => {
				execSync("claude --version", { encoding: "utf8", stdio: "pipe" });
			}).toThrow();

			// Restore original PATH
			process.env.PATH = tempPath;
		});

		it("should throw error for unknown error type", () => {
			expect(() => {
				setupFailingBinary("unknown-type", "unknown-test");
			}).toThrow("Unknown error type: unknown-type");
		});

		it("should provide appropriate restorePath function for each error type", () => {
			// Test with PATH modification
			const setupWithPath = setupFailingBinary(
				"exit-code",
				"restore-with-path",
			);
			mockSetups.push(setupWithPath);

			setupWithPath.restorePath();
			expect(process.env.PATH).toBe(originalPath);

			// Test without PATH modification
			const setupWithoutPath = setupFailingBinary(
				"binary-not-found",
				"restore-without-path",
			);
			mockSetups.push(setupWithoutPath);

			// Should not throw error
			expect(() => setupWithoutPath.restorePath()).not.toThrow();
		});

		it("should cleanup properly for all error types", () => {
			const errorTypes = [
				"exit-code",
				"no-output",
				"permission",
				"binary-not-found",
			];

			errorTypes.forEach((errorType, index) => {
				const setup = setupFailingBinary(
					errorType,
					`cleanup-${errorType}-${index}`,
				);
				const binaryPath = setup.binaryPath;

				expect(fs.existsSync(binaryPath)).toBe(true);

				setup.cleanup();

				// Binary should be cleaned up
				expect(fs.existsSync(binaryPath)).toBe(false);

				// PATH should be restored to original
				expect(process.env.PATH).toBe(originalPath);
			});
		});
	});

	describe("PATH manipulation and restoration", () => {
		it("should handle multiple mock binaries with proper PATH restoration", () => {
			const setup1 = setupMockBinary("1.0.0", "multi-1");
			mockSetups.push(setup1);

			// First binary should work
			let result = execSync("claude --version", { encoding: "utf8" }).trim();
			expect(result).toBe("1.0.0");

			const setup2 = setupMockBinary("2.0.0", "multi-2");
			mockSetups.push(setup2);

			// Second setup should override first - only dir2 should be in PATH
			const dir2 = path.dirname(setup2.binaryPath);
			expect(process.env.PATH).toContain(dir2);

			// Second should work (overrides first)
			result = execSync("claude --version", { encoding: "utf8" }).trim();
			expect(result).toBe("2.0.0");

			// Clean up second setup
			setup2.cleanup();
			mockSetups = mockSetups.filter((s) => s !== setup2);

			// PATH should be restored to first setup's PATH since first setup is still active
			const dir1 = path.dirname(setup1.binaryPath);
			expect(process.env.PATH).toContain(dir1);

			// Clean up first setup
			setup1.cleanup();
			mockSetups = mockSetups.filter((s) => s !== setup1);

			// Now PATH should be restored to original
			expect(process.env.PATH).toBe(originalPath);
		});

		it("should handle PATH restoration when binary directories do not exist", () => {
			const setup = setupMockBinary("1.0.0", "path-restoration-test");
			mockSetups.push(setup);

			// Manually remove the binary file but keep directory in PATH
			fs.unlinkSync(setup.binaryPath);

			// Should still restore PATH without error
			expect(() => setup.restorePath()).not.toThrow();
			expect(process.env.PATH).toBe(originalPath);
		});
	});

	describe("integration with existing test infrastructure", () => {
		it("should use createTestWorkspace for isolation", () => {
			const setup1 = setupMockBinary("1.0.0", "isolation-1");
			const setup2 = setupMockBinary("2.0.0", "isolation-2");
			mockSetups.push(setup1, setup2);

			// Binaries should be in different directories
			expect(path.dirname(setup1.binaryPath)).not.toBe(
				path.dirname(setup2.binaryPath),
			);

			// Both should contain test identifier
			expect(setup1.binaryPath).toContain("isolation-1");
			expect(setup2.binaryPath).toContain("isolation-2");
		});

		it("should integrate with global cleanup system", () => {
			const setup = setupMockBinary("1.0.0", "global-cleanup-test");

			// Don't add to mockSetups array to test independent cleanup
			const binaryPath = setup.binaryPath;
			expect(fs.existsSync(binaryPath)).toBe(true);

			// Cleanup should work independently
			setup.cleanup();
			expect(fs.existsSync(binaryPath)).toBe(false);
		});
	});
});
