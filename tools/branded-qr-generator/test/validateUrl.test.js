import { describe, expect, it } from "vitest";
import { validateUrl } from "../src/validateUrl.js";

describe("URL Validation", () => {
	it("should accept valid HTTPS URLs", () => {
		// Given: A valid HTTPS URL
		const url = "https://www.linkedin.com/in/wesleyfrederick/";

		// When: URL is validated
		const result = validateUrl(url);

		// Then: Validation succeeds
		expect(result.valid).toBe(true);
		expect(result.error).toBeUndefined();
	});

	it("should accept valid HTTP URLs", () => {
		// Given: A valid HTTP URL
		const url = "http://example.com/page";

		// When: URL is validated
		const result = validateUrl(url);

		// Then: Validation succeeds
		expect(result.valid).toBe(true);
	});

	it("should reject URLs without protocol", () => {
		// Given: URL missing protocol
		const url = "example.com";

		// When: URL is validated
		const result = validateUrl(url);

		// Then: Validation fails with clear error
		expect(result.valid).toBe(false);
		expect(result.error).toContain("must include protocol");
	});

	it("should reject malformed URLs", () => {
		// Given: Invalid URL format
		const url = "not-a-url";

		// When: URL is validated
		const result = validateUrl(url);

		// Then: Validation fails
		expect(result.valid).toBe(false);
		expect(result.error).toContain("Invalid URL format");
	});

	it("should reject empty strings", () => {
		// Given: Empty string
		const url = "";

		// When: URL is validated
		const result = validateUrl(url);

		// Then: Validation fails
		expect(result.valid).toBe(false);
		expect(result.error).toBeDefined();
	});
});
