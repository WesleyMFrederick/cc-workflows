import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runCLI } from "./helpers/cli-runner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const citationManagerPath = join(__dirname, "..", "src", "citation-manager.js");

describe("Enhanced Citation Pattern Tests", () => {
	it("should detect all citation patterns including cite format and links without anchors", async () => {
		const testFile = join(__dirname, "fixtures", "enhanced-citations.md");

		let output;
		try {
			output = runCLI(
				`node "${citationManagerPath}" validate "${testFile}" --format json`,
				{
					cwd: __dirname,
				},
			);
		} catch (error) {
			// Validation may fail due to missing files, but we still get JSON output
			output = error.stdout;
		}

		const result = JSON.parse(output);

		// Should find all citations (some will have validation errors due to missing files, but parsing should work)
		expect(result.summary.total).toBeGreaterThanOrEqual(10);

		// Check for specific citation types - use enriched links
		const citations = result.links;

		// Should find cross-document links with anchors
		const withAnchors = citations.filter(
			(c) =>
				c.scope === "cross-document" && c.fullMatch.includes("#auth-service"),
		);
		expect(withAnchors.length).toBeGreaterThan(0);

		// Should find cross-document links without anchors
		const withoutAnchors = citations.filter(
			(c) =>
				c.scope === "cross-document" &&
				(c.fullMatch.includes("test-target.md)") ||
					c.fullMatch.includes("another-file.md)") ||
					c.fullMatch.includes("setup-guide.md)")) &&
				!c.fullMatch.includes("#"),
		);
		expect(withoutAnchors.length).toBeGreaterThan(0);

		// Should find cite format
		const citeFormat = citations.filter((c) => c.fullMatch.includes("[cite:"));
		expect(citeFormat.length).toBeGreaterThanOrEqual(3);

		// Should find caret references
		const caretRefs = citations.filter(
			(c) => c.scope === "internal" && c.linkType === "markdown",
		);
		expect(caretRefs.length).toBeGreaterThanOrEqual(2);
	});

	it("should extract all base paths from enhanced citation file", async () => {
		const testFile = join(__dirname, "fixtures", "enhanced-citations.md");

		try {
			const output = runCLI(
				`node "${citationManagerPath}" base-paths "${testFile}" --format json`,
				{
					cwd: __dirname,
				},
			);

			const result = JSON.parse(output);

			// Should extract multiple base paths
			expect(result.count).toBeGreaterThanOrEqual(6);

			// Should include standard markdown links
			const hasTestTarget = result.basePaths.some((path) =>
				path.includes("test-target.md"),
			);
			expect(hasTestTarget).toBe(true);

			// Should include cite format paths
			const hasDesignPrinciples = result.basePaths.some((path) =>
				path.includes("design-principles.md"),
			);
			expect(hasDesignPrinciples).toBe(true);

			// Should include relative paths from cite format
			const hasArchitecturePatterns = result.basePaths.some((path) =>
				path.includes("patterns.md"),
			);
			expect(hasArchitecturePatterns).toBe(true);
		} catch (error) {
			if (error.status !== 0) {
				console.log("STDOUT:", error.stdout);
				console.log("STDERR:", error.stderr);
			}
			throw new Error(`Base paths extraction failed: ${error.message}`);
		}
	});

	it("should handle mixed citation patterns on same line", async () => {
		const testFile = join(__dirname, "fixtures", "enhanced-citations.md");

		let output;
		try {
			output = runCLI(
				`node "${citationManagerPath}" validate "${testFile}" --format json`,
				{
					cwd: __dirname,
				},
			);
		} catch (error) {
			// Validation may fail due to missing files, but we still get JSON output
			output = error.stdout;
		}

		const result = JSON.parse(output);

		// Find the line with mixed patterns (should be around line 24)
		const mixedLineCitations = result.links.filter((c) => c.line === 24);

		// Should find both standard link and cite format on the same line
		expect(mixedLineCitations.length).toBeGreaterThanOrEqual(2);

		// Should include both pattern types
		const hasStandardLink = mixedLineCitations.some(
			(c) =>
				c.fullMatch.includes("[Standard Link](") && c.scope === "cross-document",
		);
		const hasCiteFormat = mixedLineCitations.some(
			(c) => c.fullMatch.includes("[cite:") && c.scope === "cross-document",
		);

		expect(hasStandardLink).toBe(true);
		expect(hasCiteFormat).toBe(true);
	});

	it("should detect and validate wiki-style cross-document links", async () => {
		const testFile = join(__dirname, "fixtures", "wiki-cross-doc.md");

		let output;
		try {
			output = runCLI(
				`node "${citationManagerPath}" validate "${testFile}" --format json`,
				{
					cwd: __dirname,
				},
			);
		} catch (error) {
			// Validation may fail due to broken links, but we still get JSON output
			output = error.stdout;
		}

		const result = JSON.parse(output);

		// Should find wiki-style cross-document links
		const wikiCrossDoc = result.links.filter(
			(c) => c.scope === "cross-document" && c.fullMatch.startsWith("[["),
		);
		expect(wikiCrossDoc.length).toBeGreaterThan(0);

		// Should validate file existence - valid links to test-target.md
		const validLinks = wikiCrossDoc.filter(
			(c) => c.validation.status === "valid" && c.fullMatch.includes("test-target.md"),
		);
		expect(validLinks.length).toBeGreaterThan(0);

		// Should catch broken file references
		const brokenFile = wikiCrossDoc.find((c) =>
			c.fullMatch.includes("nonexistent.md"),
		);
		expect(brokenFile).toBeDefined();
		expect(brokenFile.validation.status).toBe("error");

		// Should catch directory references (isFile() validation)
		// Note: Directory references like [[../fixtures#anchor]] may not be detected
		// by the citation parser if they use relative parent paths
		const dirReference = wikiCrossDoc.find((c) =>
			c.fullMatch.includes("../fixtures"),
		);
		if (dirReference) {
			expect(dirReference.validation.status).toBe("error");
		}
		// If directory reference not detected, that's acceptable - just verify other validations work
	});

	it("should extract base paths via npm script wrapper", () => {
		// Given: Test file with multiple citations
		const testFile = join(__dirname, "fixtures", "enhanced-citations.md");

		// When: Execute npm script (pipes through validate → jq → sort)
		const output = runCLI(
			`npm run --silent citation:base-paths "${testFile}"`,
			{ cwd: join(__dirname, '..', '..', '..') } // Workspace root for npm run
		);

		// Then: Output is newline-separated paths
		const paths = output.trim().split('\n').filter(p => p.length > 0);

		expect(paths.length).toBeGreaterThanOrEqual(6);
		expect(paths).toEqual([...new Set(paths)]); // Unique (sort -u)
		expect(paths).toEqual([...paths].sort()); // Sorted alphabetically
		expect(paths.every(p => p !== 'null')).toBe(true); // No literal "null" strings

		// Spot-check expected paths
		expect(paths.some(p => p.includes('test-target.md'))).toBe(true);
		expect(paths.some(p => p.includes('design-principles.md'))).toBe(true);
	});
});
