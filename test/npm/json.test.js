import assert from "node:assert";
import { describe, test } from "node:test";
import { convertStructuredDataToAdoc } from "../../dist/index.js";

describe("NPM: JSON to AsciiDoc", () => {
	test("should convert JSON to AsciiDoc tree", () => {
		const jsonContent = JSON.stringify({
			name: "Alice",
			age: 30,
			address: {
				city: "New York",
				zip: "10001",
			},
		});

		const result = convertStructuredDataToAdoc(jsonContent, "json");

		assert.ok(result.includes("* *name:* Alice"), "Missing name");
		assert.ok(result.includes("* *age:* 30"), "Missing age");
		assert.ok(result.includes("* *address:*"), "Missing address header");
		assert.ok(result.includes("** *city:* New York"), "Missing city");
		assert.ok(result.includes("** *zip:* 10001"), "Missing zip");
	});
});
