import { existsSync } from "node:fs";
import { extname } from "node:path";

/**
 * Validate logo file existence and format
 *
 * Checks if logo file exists and has PNG extension. Returns validation
 * result with error message for invalid logos.
 *
 * @param {string} logoPath - Path to logo file
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateLogo(logoPath) {
	// Check for empty path
	if (!logoPath || logoPath.trim() === "") {
		return {
			valid: false,
			error: "Logo path cannot be empty",
		};
	}

	// Check if file exists
	if (!existsSync(logoPath)) {
		return {
			valid: false,
			error: `Logo file not found at ${logoPath}`,
		};
	}

	// Check file extension
	const ext = extname(logoPath).toLowerCase();
	if (ext !== ".png") {
		return {
			valid: false,
			error: `Logo file must be PNG format. Received: ${ext || "no extension"}`,
		};
	}

	return { valid: true };
}
