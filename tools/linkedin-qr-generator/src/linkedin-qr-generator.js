#!/usr/bin/env node

/**
 * LinkedIn QR Generator - CLI tool for branded QR codes
 *
 * Generates QR codes with custom logo embedding for any URL. Supports both
 * default LinkedIn logo and custom PNG logos via command-line arguments.
 *
 * Usage:
 *   npm run qr-gen -- <url>                      # Use default logo
 *   npm run qr-gen -- <url> <logo-path>          # Use custom logo
 *
 * @module linkedin-qr-generator
 */

import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { validateUrl } from "./validateUrl.js";
import { validateLogo } from "./validateLogo.js";
import { generateQrCode } from "./generateQrCode.js";
import { embedLogo } from "./embedLogo.js";
import { ensureOutputDir } from "./ensureOutputDir.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default logo path
const DEFAULT_LOGO_PATH = join(__dirname, "..", "assets", "linkedin-logo.png");

const program = new Command();

program
	.name("linkedin-qr-generator")
	.description("Generate branded QR codes with custom logo embedding")
	.version("1.0.0")
	.argument("<url>", "URL to encode in QR code")
	.argument(
		"[logo]",
		"Path to custom logo PNG (optional, uses LinkedIn logo if not provided)",
	)
	.action(async (url, customLogoPath) => {
		try {
			// Step 1: Validate URL
			console.log("✓ Validating URL...");
			const urlValidation = validateUrl(url);
			if (!urlValidation.valid) {
				console.error(`ERROR: ${urlValidation.error}`);
				process.exit(1);
			}

			// Step 2: Determine logo path and validate
			const logoPath = customLogoPath || DEFAULT_LOGO_PATH;
			const logoType = customLogoPath ? "custom logo" : "default logo";

			console.log(`✓ Validating ${logoType}...`);
			const logoValidation = validateLogo(logoPath);
			if (!logoValidation.valid) {
				console.error(`ERROR: ${logoValidation.error}`);
				if (!customLogoPath) {
					console.error(
						"Default logo missing. Please ensure assets/linkedin-logo.png exists.",
					);
				}
				process.exit(1);
			}

			// Step 3: Generate QR code
			console.log("✓ Generating QR code...");
			const qrBuffer = await generateQrCode(url);

			// Step 4: Embed logo
			console.log("✓ Embedding logo...");
			const finalBuffer = await embedLogo(qrBuffer, logoPath);

			// Step 5: Ensure output directory exists
			const outputDir = join(__dirname, "..", "output");
			ensureOutputDir(outputDir);

			// Step 6: Generate filename with timestamp
			const timestamp = new Date()
				.toISOString()
				.replace(/[:.]/g, "-")
				.split("T")
				.join("-")
				.slice(0, -5);
			const filename = `qr-${timestamp}.png`;
			const outputPath = join(outputDir, filename);

			// Step 7: Write file
			console.log(`✓ Saving to ${outputPath}`);
			writeFileSync(outputPath, finalBuffer);

			console.log("");
			console.log("Successfully created branded QR code!");
			console.log(`Scan with your phone camera to test: ${outputPath}`);
		} catch (error) {
			console.error("");
			console.error(`ERROR: ${error.message}`);
			process.exit(1);
		}
	});

program.parse();
