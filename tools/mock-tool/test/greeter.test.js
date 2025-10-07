import { describe, expect, it } from "vitest";
import { greet } from "../src/greeter.js";

describe("Greeter Module", () => {
	it("should return formatted greeting", () => {
		// Given: A name input
		const name = "Alice";

		// When: The greet function is called
		const result = greet(name);

		// Then: It should return a properly formatted greeting
		expect(result).toBe("Hello, Alice!");
	});
});
