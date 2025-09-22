import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, beforeEach, afterEach } from "vitest";

describe("Enhanced Fix Command", () => {
	const testDir = "/Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/claude-code-knowledgebase/agentic-workflows/utility-scripts/citation-links/test/fixtures";
	const originalContents = new Map();

	// Utility to create and track test files for cleanup
	const createTestFile = (filename, content) => {
		const filePath = join(testDir, filename);

		// Store original content if file exists
		try {
			const original = readFileSync(filePath, "utf8");
			originalContents.set(filePath, original);
		} catch {
			// File doesn't exist, mark for deletion
			originalContents.set(filePath, null);
		}

		writeFileSync(filePath, content, "utf8");
		return filePath;
	};

	// Cleanup test files after each test
	afterEach(() => {
		for (const [filePath, originalContent] of originalContents.entries()) {
			try {
				if (originalContent === null) {
					// File was created by test, remove it
					// Since we can't import fs.unlinkSync in this scope easily,
					// we'll restore empty content or handle differently
					writeFileSync(filePath, "", "utf8");
				} else {
					// Restore original content
					writeFileSync(filePath, originalContent, "utf8");
				}
			} catch (error) {
				console.warn(`Failed to cleanup ${filePath}:`, error.message);
			}
		}
		originalContents.clear();
	});

	describe("Path-only fixes", () => {
		it("should fix path conversions for cross-directory citations", () => {
			// Setup: File with wrong path citation but correct anchor format
			const testContent = `# Test File

This citation has a wrong path:
[Link to target](../wrong-path/warning-test-target.md#Test%20Anchor)

End of file.`;

			const testFile = createTestFile("fix-test-path.md", testContent);

			// Execute fix command with scope to enable file cache
			const result = execSync(
				`node /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/claude-code-knowledgebase/agentic-workflows/utility-scripts/citation-links/citation-manager.js validate "${testFile}" --fix --scope "${testDir}"`,
				{ encoding: "utf8" }
			);

			// Verify: Path should be corrected to relative path
			const fixedContent = readFileSync(testFile, "utf8");

			// The path should be corrected from ../wrong-path/warning-test-target.md to subdir/warning-test-target.md
			expect(fixedContent).toContain("subdir/warning-test-target.md#Test%20Anchor");
			expect(fixedContent).not.toContain("../wrong-path/warning-test-target.md");

			// Verify the anchor format is preserved (URL-encoded)
			expect(fixedContent).toContain("#Test%20Anchor");
		});
	});

	describe("Anchor-only fixes", () => {
		it("should fix kebab-case anchors while preserving correct paths", () => {
			// Setup: Citation with correct path but kebab-case anchor
			const testContent = `# Test File

This citation has a kebab-case anchor:
[Link to target](subdir/warning-test-target.md#test-anchor)

End of file.`;

			const testFile = createTestFile("fix-test-anchor.md", testContent);

			// Execute fix command
			const result = execSync(
				`node /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/claude-code-knowledgebase/agentic-workflows/utility-scripts/citation-links/citation-manager.js validate "${testFile}" --fix --scope "${testDir}"`,
				{ encoding: "utf8" }
			);

			// Verify: Anchor should be fixed to URL-encoded format
			const fixedContent = readFileSync(testFile, "utf8");

			// The anchor should be corrected to URL-encoded format
			expect(fixedContent).toContain("#test%20anchor");
			expect(fixedContent).not.toContain("#test-anchor");

			// Verify the path is preserved
			expect(fixedContent).toContain("subdir/warning-test-target.md");
		});
	});

	describe("Combined path and anchor fixes", () => {
		it("should fix both path conversions and anchor issues simultaneously", () => {
			// Setup: Citation with both wrong path and kebab-case anchor
			const testContent = `# Test File

This citation has both wrong path and kebab-case anchor:
[Link to target](../wrong-path/warning-test-target.md#test-anchor)

End of file.`;

			const testFile = createTestFile("fix-test-combined.md", testContent);

			// Execute fix command
			const result = execSync(
				`node /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/claude-code-knowledgebase/agentic-workflows/utility-scripts/citation-links/citation-manager.js validate "${testFile}" --fix --scope "${testDir}"`,
				{ encoding: "utf8" }
			);

			// Verify: Both path and anchor should be corrected
			const fixedContent = readFileSync(testFile, "utf8");

			// Both issues should be fixed in single operation
			expect(fixedContent).toContain("subdir/warning-test-target.md#test%20anchor");
			expect(fixedContent).not.toContain("../wrong-path/warning-test-target.md");
			expect(fixedContent).not.toContain("#test-anchor");
		});

		it("should handle multiple citations with different issue combinations", () => {
			// Setup: File with multiple citations having different issues
			const testContent = `# Test File

Path issue only:
[Path only](../wrong-path/warning-test-target.md#Test%20Anchor)

Anchor issue only:
[Anchor only](subdir/warning-test-target.md#test-anchor)

Both issues:
[Both issues](../wrong-path/warning-test-target.md#another-test-anchor)

Valid citation (should remain unchanged):
[Valid](subdir/warning-test-target.md#Test%20Anchor)

End of file.`;

			const testFile = createTestFile("fix-test-multiple.md", testContent);

			// Execute fix command
			const result = execSync(
				`node /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/claude-code-knowledgebase/agentic-workflows/utility-scripts/citation-links/citation-manager.js validate "${testFile}" --fix --scope "${testDir}"`,
				{ encoding: "utf8" }
			);

			// Verify: All issues should be fixed appropriately
			const fixedContent = readFileSync(testFile, "utf8");

			// Verify each fix type
			expect(fixedContent).toContain("subdir/warning-test-target.md#Test%20Anchor"); // Path fixed, anchor preserved
			expect(fixedContent).toContain("subdir/warning-test-target.md#test%20anchor"); // Anchor fixed, path preserved
			expect(fixedContent).toContain("subdir/warning-test-target.md#another%20test%20anchor"); // Both fixed

			// Valid citation should remain unchanged
			expect(fixedContent).toMatch(/Valid\]\(subdir\/warning-test-target\.md#Test%20Anchor\)/);

			// Wrong patterns should be gone
			expect(fixedContent).not.toContain("../wrong-path/");
			expect(fixedContent).not.toContain("#test-anchor");
			expect(fixedContent).not.toContain("#another-test-anchor");
		});
	});

	describe("Existing behavior preservation", () => {
		it("should preserve existing anchor fix functionality", () => {
			// Setup: Test the existing kebab-case anchor fix behavior unchanged
			const testContent = `# Test File

Standard kebab-case anchor fix:
[Legacy anchor fix](test-target.md#some-kebab-anchor)

End of file.`;

			const testFile = createTestFile("fix-test-legacy.md", testContent);

			// Execute fix command
			const result = execSync(
				`node /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/claude-code-knowledgebase/agentic-workflows/utility-scripts/citation-links/citation-manager.js validate "${testFile}" --fix --scope "${testDir}"`,
				{ encoding: "utf8" }
			);

			// Verify: Legacy behavior is preserved
			const fixedContent = readFileSync(testFile, "utf8");

			// Should fix kebab-case anchor to URL-encoded format
			expect(fixedContent).toContain("#some%20kebab%20anchor");
			expect(fixedContent).not.toContain("#some-kebab-anchor");
		});

		it("should handle files with no fixable issues gracefully", () => {
			// Setup: File with only valid citations
			const testContent = `# Test File

Valid citation:
[Valid link](test-target.md#Valid%20Anchor)

Another valid citation:
[Another valid](subdir/warning-test-target.md#Test%20Anchor)

End of file.`;

			const testFile = createTestFile("fix-test-no-issues.md", testContent);

			// Execute fix command
			const result = execSync(
				`node /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/claude-code-knowledgebase/agentic-workflows/utility-scripts/citation-links/citation-manager.js validate "${testFile}" --fix --scope "${testDir}"`,
				{ encoding: "utf8" }
			);

			// Verify: No changes should be made
			const fixedContent = readFileSync(testFile, "utf8");
			expect(fixedContent).toBe(testContent);

			// Verify appropriate message is returned
			expect(result).toContain("No auto-fixable");
		});
	});

	describe("File modification validation", () => {
		it("should validate actual file content changes occur", () => {
			// Setup: File with known fixable issue
			const originalContent = `# Test File

[Fixable link](../wrong-path/warning-test-target.md#test-anchor)
`;

			const testFile = createTestFile("fix-test-validation.md", originalContent);

			// Capture original content
			const beforeFix = readFileSync(testFile, "utf8");
			expect(beforeFix).toBe(originalContent);

			// Execute fix command
			execSync(
				`node /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/claude-code-knowledgebase/agentic-workflows/utility-scripts/citation-links/citation-manager.js validate "${testFile}" --fix --scope "${testDir}"`,
				{ encoding: "utf8" }
			);

			// Verify: Content has actually changed
			const afterFix = readFileSync(testFile, "utf8");
			expect(afterFix).not.toBe(originalContent);
			expect(afterFix).toContain("subdir/warning-test-target.md#test%20anchor");
		});

		it("should report fix count and changes accurately", () => {
			// Setup: File with multiple fixable issues
			const testContent = `# Test File

[Issue 1](../wrong-path/warning-test-target.md#test-anchor)
[Issue 2](test-target.md#another-kebab-case)
[Valid](test-target.md#Valid%20Anchor)
`;

			const testFile = createTestFile("fix-test-reporting.md", testContent);

			// Execute fix command and capture output
			const result = execSync(
				`node /Users/wesleyfrederick/Documents/ObsidianVault/0_SoftwareDevelopment/claude-code-knowledgebase/agentic-workflows/utility-scripts/citation-links/citation-manager.js validate "${testFile}" --fix --scope "${testDir}"`,
				{ encoding: "utf8" }
			);

			// Verify: Fix reporting is accurate
			expect(result).toMatch(/Fixed \d+ .*citation/); // Should report number of fixes
			expect(result).toContain("Changes made:"); // Should show changes
			expect(result).toMatch(/Line \d+:/); // Should show line numbers
		});
	});
});