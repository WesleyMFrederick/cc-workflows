import QRCode from "qrcode";

/**
 * Generate QR code image buffer from URL
 *
 * Creates PNG buffer with high error correction (H level = 30% recovery)
 * to support logo embedding while maintaining scannability. Output size
 * optimized for screen display (500x500px).
 *
 * @param {string} url - URL to encode in QR code
 * @returns {Promise<Buffer>} PNG image buffer
 */
export async function generateQrCode(url) {
	const options = {
		errorCorrectionLevel: "H", // High (30% recovery) - supports logo embedding
		type: "png",
		width: 500, // Screen-optimized resolution
		margin: 2, // Border size in modules
	};

	const buffer = await QRCode.toBuffer(url, options);
	return buffer;
}
