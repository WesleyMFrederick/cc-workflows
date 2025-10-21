import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { embedLogo } from "../src/embedLogo.js";
import { generateQrCode } from "../src/generateQrCode.js";

const FIXTURES_DIR = join(import.meta.dirname, "fixtures");

describe("Logo Embedding", () => {
	it("should embed logo onto QR code", async () => {
		// Given: QR code buffer and logo path
		const url = "https://www.linkedin.com/in/wesleyfrederick/";
		const qrBuffer = await generateQrCode(url);
		const logoPath = join(FIXTURES_DIR, "test-logo.png");

		// When: Logo is embedded
		const result = await embedLogo(qrBuffer, logoPath);

		// Then: Composite buffer is returned
		expect(Buffer.isBuffer(result)).toBe(true);
		expect(result.length).toBeGreaterThan(qrBuffer.length); // Should be larger with logo
	});

	it("should handle missing logo file gracefully", async () => {
		// Given: QR code buffer and invalid logo path
		const qrBuffer = await generateQrCode("https://example.com");
		const logoPath = "/invalid/path/logo.png";

		// When: Embedding is attempted
		// Then: Should throw error
		await expect(embedLogo(qrBuffer, logoPath)).rejects.toThrow();
	});
});
