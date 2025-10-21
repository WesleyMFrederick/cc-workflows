import sharp from "sharp";

/**
 * Embed logo onto QR code center with white background
 *
 * Composites logo image onto QR code center with white circular background
 * for contrast. Logo sized to ~20% of QR dimensions (100px for 500px QR).
 *
 * @param {Buffer} qrBuffer - QR code PNG buffer
 * @param {string} logoPath - Path to logo PNG file
 * @returns {Promise<Buffer>} Composite PNG buffer
 */
export async function embedLogo(qrBuffer, logoPath) {
	const QR_SIZE = 500;
	const LOGO_SIZE = 100; // 20% of QR size
	const BACKGROUND_RADIUS = 60; // Circle radius (creates 120px diameter with 10px padding around 100px logo)

	// Create white circle background as SVG
	const circleBackground = Buffer.from(`
		<svg width="${LOGO_SIZE + BACKGROUND_RADIUS}" height="${LOGO_SIZE + BACKGROUND_RADIUS}">
			<circle
				cx="${(LOGO_SIZE + BACKGROUND_RADIUS) / 2}"
				cy="${(LOGO_SIZE + BACKGROUND_RADIUS) / 2}"
				r="${BACKGROUND_RADIUS}"
				fill="white"
			/>
		</svg>
	`);

	// Resize logo to target size
	const resizedLogo = await sharp(logoPath)
		.resize(LOGO_SIZE, LOGO_SIZE, {
			fit: "contain",
			background: { r: 255, g: 255, b: 255, alpha: 0 },
		})
		.png()
		.toBuffer();

	// Calculate center position
	const centerX = (QR_SIZE - (LOGO_SIZE + BACKGROUND_RADIUS)) / 2;
	const centerY = (QR_SIZE - (LOGO_SIZE + BACKGROUND_RADIUS)) / 2;

	// Composite: QR + white circle + logo
	const composite = await sharp(qrBuffer)
		.composite([
			{
				input: circleBackground,
				top: Math.round(centerY),
				left: Math.round(centerX),
			},
			{
				input: resizedLogo,
				top: Math.round(centerY + BACKGROUND_RADIUS / 2),
				left: Math.round(centerX + BACKGROUND_RADIUS / 2),
			},
		])
		.png()
		.toBuffer();

	return composite;
}
