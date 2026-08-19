import assert from "node:assert";
import { describe, test } from "node:test";
import { convert } from "../../dist/index.js";

describe("NPM: RTF to AsciiDoc", () => {
	test("should convert sample.rtf to AsciiDoc via the public API", async () => {
		const rtfPath = "test/docs/sample.rtf";
		const content = await convert({ input: rtfPath });

		assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
		assert.ok(content.includes("Document Metadata"), "Missing section header fragment");
	});
});
