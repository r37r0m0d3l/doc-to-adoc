import assert from "node:assert";
import { describe, test } from "node:test";
import { convert } from "../../dist/index.js";

describe("NPM: DOC to AsciiDoc", () => {
	test("should convert sample.doc to AsciiDoc via the public API", async () => {
		const docPath = "test/docs/sample.doc";
		const content = await convert({ input: docPath });

		assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
		assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header");
	});
});
