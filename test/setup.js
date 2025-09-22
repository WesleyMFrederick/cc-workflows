// Test setup file for Vitest
// This file runs before each test file

// Global test configuration
process.env.NODE_ENV = "test";

// Setup cleanup tracking for temporary directories
global.testCleanupCallbacks = [];

// Register cleanup callback for process exit
process.on("exit", () => {
	global.testCleanupCallbacks.forEach((callback) => {
		try {
			callback();
		} catch (error) {
			console.warn("Cleanup callback failed:", error.message);
		}
	});
});

// Handle forced exits
process.on("SIGINT", () => {
	process.exit(0);
});

process.on("SIGTERM", () => {
	process.exit(0);
});
