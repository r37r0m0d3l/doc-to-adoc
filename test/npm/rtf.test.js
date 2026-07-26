import assert from "node:assert";
import { describe, test } from "node:test";
import { getAdocContent } from "../../bin/converter.js";

describe("NPM: RTF to AsciiDoc (via getAdocContent)", () => {
	test("should convert sample.rtf to AsciiDoc", async () => {
		const rtfPath = "test/docs/sample.rtf";
		const content = await getAdocContent(rtfPath, ".rtf");

		assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
		assert.ok(content.includes("Document Metadata"), "Missing section header fragment");
	});
});
