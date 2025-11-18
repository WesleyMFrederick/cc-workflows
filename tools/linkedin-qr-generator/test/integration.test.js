import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execSync } from "node:child_process";
import { existsSync, rmSync, readdirSync } from "node:fs";
import { join } from "node:path";

const CLI_PATH = join(
	import.meta.dirname,
	"..",
	"src",
	"linkedin-qr-generator.js",
);
const OUTPUT_DIR = join(import.meta.dirname, "..", "output");
const FIXTURES_DIR = join(import.meta.dirname, "fixtures");

describe("LinkedIn QR Generator Integration Tests", () => {
	beforeEach(() => {
		// Clean output directory before each test
		if (existsSync(OUTPUT_DIR)) {
			rmSync(OUTPUT_DIR, { recursive: true, force: true });
		}
	});

	afterEach(() => {
		// Clean up after each test
		if (existsSync(OUTPUT_DIR)) {
			rmSync(OUTPUT_DIR, { recursive: true, force: true });
		}
	});

	it("should generate QR code with default logo for valid URL", () => {
		// Given: Valid URL and default logo exists
		const url = "https://www.linkedin.com/in/wesleyfrederick/";

		// When: CLI executes with URL only
		const result = execSync(`node "${CLI_PATH}" ${url}`, {
			encoding: "utf8",
		});

		// Then: QR code file created
		expect(existsSync(OUTPUT_DIR)).toBe(true);
		const files = readdirSync(OUTPUT_DIR);
		expect(files.length).toBe(1);
		expect(files[0]).toMatch(/^qr-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.png$/);
		expect(result).toContain("Successfully created");
	});

	it("should generate QR code with custom logo when provided", () => {
		// Given: Valid URL and custom logo path
		const url = "https://example.com";
		const logoPath = join(FIXTURES_DIR, "test-logo.png");

		// When: CLI executes with both URL and logo
		const result = execSync(`node "${CLI_PATH}" ${url} "${logoPath}"`, {
			encoding: "utf8",
		});

		// Then: QR code file created
		expect(existsSync(OUTPUT_DIR)).toBe(true);
		const files = readdirSync(OUTPUT_DIR);
		expect(files.length).toBe(1);
		expect(result).toContain("Successfully created");
	});

	it("should reject invalid URL with clear error", () => {
		// Given: Invalid URL
		const url = "not-a-url";

		// When: CLI executes
		// Then: Error is thrown
		expect(() => {
			execSync(`node "${CLI_PATH}" ${url}`, {
				encoding: "utf8",
			});
		}).toThrow();
	});

	it("should reject invalid logo file with clear error", () => {
		// Given: Valid URL but invalid logo file
		const url = "https://example.com";
		const logoPath = join(FIXTURES_DIR, "invalid-logo.txt");

		// When: CLI executes
		// Then: Error is thrown
		expect(() => {
			execSync(`node "${CLI_PATH}" ${url} "${logoPath}"`, {
				encoding: "utf8",
			});
		}).toThrow();
	});

	it("should create output directory if it does not exist", () => {
		// Given: No output directory exists
		if (existsSync(OUTPUT_DIR)) {
			rmSync(OUTPUT_DIR, { recursive: true, force: true });
		}
		const url = "https://example.com";

		// When: CLI executes
		execSync(`node "${CLI_PATH}" ${url}`, {
			encoding: "utf8",
		});

		// Then: Directory is created and file is saved
		expect(existsSync(OUTPUT_DIR)).toBe(true);
		expect(readdirSync(OUTPUT_DIR).length).toBe(1);
	});
});
