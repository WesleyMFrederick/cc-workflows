/**
 * Validate URL format
 *
 * Checks if provided string is a valid HTTP/HTTPS URL with proper protocol.
 * Returns validation result with error message for invalid URLs.
 *
 * @param {string} url - URL string to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateUrl(url) {
	// Check for empty string
	if (!url || url.trim() === "") {
		return {
			valid: false,
			error: "URL cannot be empty",
		};
	}

	// Try to parse URL
	try {
		const parsed = new URL(url);

		// Check for required protocol
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
			return {
				valid: false,
				error: "URL must include protocol (http:// or https://)",
			};
		}

		return { valid: true };
	} catch (error) {
		// Distinguish between missing protocol vs malformed URL
		// If it looks like a domain (no ://), it's missing protocol
		if (!url.includes("://") && url.includes(".")) {
			return {
				valid: false,
				error: "URL must include protocol (http:// or https://)",
			};
		}

		return {
			valid: false,
			error:
				"Invalid URL format. Expected valid URL (e.g., https://example.com)",
		};
	}
}
