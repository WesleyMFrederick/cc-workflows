import { describe, expect, it } from "vitest";
import { generateQrCode } from "../src/generateQrCode.js";

describe("QR Code Generation", () => {
	it("should generate QR code buffer for valid URL", async () => {
		// Given: Valid URL
		const url = "https://www.linkedin.com/in/wesleyfrederick/";

		// When: QR code is generated
		const buffer = await generateQrCode(url);

		// Then: Buffer is returned
		expect(Buffer.isBuffer(buffer)).toBe(true);
		expect(buffer.length).toBeGreaterThan(0);
	});

	it("should generate QR code with consistent size", async () => {
		// Given: Two different URLs
		const url1 = "https://example.com";
		const url2 = "https://github.com/user/repo";

		// When: QR codes are generated
		const buffer1 = await generateQrCode(url1);
		const buffer2 = await generateQrCode(url2);

		// Then: Both buffers have reasonable size
		expect(buffer1.length).toBeGreaterThan(1000);
		expect(buffer2.length).toBeGreaterThan(1000);
	});

	it("should handle long URLs", async () => {
		// Given: Long URL
		const url =
			"https://example.com/very/long/path/that/goes/on/and/on/with/many/segments";

		// When: QR code is generated
		const buffer = await generateQrCode(url);

		// Then: Buffer is generated successfully
		expect(Buffer.isBuffer(buffer)).toBe(true);
	});
});
