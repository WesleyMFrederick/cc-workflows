import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validateLogo } from "../src/validateLogo.js";

const FIXTURES_DIR = join(import.meta.dirname, "fixtures");

describe("Logo Validation", () => {
	it("should accept valid PNG logo", () => {
		// Given: Valid PNG file path
		const logoPath = join(FIXTURES_DIR, "test-logo.png");

		// When: Logo is validated
		const result = validateLogo(logoPath);

		// Then: Validation succeeds
		expect(result.valid).toBe(true);
		expect(result.error).toBeUndefined();
	});

	it("should reject non-PNG files", () => {
		// Given: Non-PNG file path
		const logoPath = join(FIXTURES_DIR, "invalid-logo.txt");

		// When: Logo is validated
		const result = validateLogo(logoPath);

		// Then: Validation fails with format error
		expect(result.valid).toBe(false);
		expect(result.error).toContain("must be PNG format");
	});

	it("should reject missing files", () => {
		// Given: Path to non-existent file
		const logoPath = "/path/to/missing/logo.png";

		// When: Logo is validated
		const result = validateLogo(logoPath);

		// Then: Validation fails with not found error
		expect(result.valid).toBe(false);
		expect(result.error).toContain("not found");
	});

	it("should reject empty paths", () => {
		// Given: Empty string path
		const logoPath = "";

		// When: Logo is validated
		const result = validateLogo(logoPath);

		// Then: Validation fails
		expect(result.valid).toBe(false);
		expect(result.error).toBeDefined();
	});
});
