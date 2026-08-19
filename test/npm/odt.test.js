import assert from "node:assert";
import { describe, test } from "node:test";
import { convert } from "../../dist/index.js";

describe("NPM: ODT to AsciiDoc", () => {
	test("should convert sample.odt to AsciiDoc via the public API", async () => {
		const odtPath = "test/docs/sample.odt";
		const content = await convert({ input: odtPath });

		assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
		assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header");
	});
});
