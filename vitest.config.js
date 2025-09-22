import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Use Node.js environment for file system testing
		environment: "node",

		// Test file patterns - support both existing and new test locations
		include: ["src/tests/**/*.test.js", "test/**/*.test.js"],
		exclude: ["node_modules/**", "dist/**"],

		// Use forks for better CommonJS isolation
		pool: "forks",

		// Timeout settings for file system operations
		testTimeout: 10000,
		hookTimeout: 10000,

		// Disable globals to ensure explicit imports
		globals: false,

		// Coverage configuration
		coverage: {
			provider: "c8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/**",
				"src/tests/**",
				"coverage/**",
				"dist/**",
				"*.config.js",
			],
		},

		// Setup files for test utilities (will be created)
		setupFiles: ["./test/setup.js"],

		// Reporter configuration
		reporter: ["verbose"],

		// Bail on first failure for CI
		bail: process.env.CI ? 1 : 0,
	},
});
