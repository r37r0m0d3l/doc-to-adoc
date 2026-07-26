import assert from "node:assert";
import { describe, test } from "node:test";
import { getAdocContent } from "../../bin/converter.js";

describe("NPM: ODT to AsciiDoc (via getAdocContent)", () => {
	test("should convert sample.odt to AsciiDoc", async () => {
		const odtPath = "test/docs/sample.odt";
		const content = await getAdocContent(odtPath, ".odt");

		assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
		assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header");
	});
});
