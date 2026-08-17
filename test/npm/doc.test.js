import assert from "node:assert";
import { describe, test } from "node:test";
import { convertDocToAdoc, getAdocContent } from "../../dist/index.js";

describe("NPM: DOC to AsciiDoc", () => {
	test("should convert sample.doc to AsciiDoc via getAdocContent", async () => {
		const docPath = "test/docs/sample.doc";
		const content = await getAdocContent(docPath, ".doc");

		assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
		assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header");
	});

	test("should convert sample.doc to AsciiDoc via convertDocToAdoc", async () => {
		const docPath = "test/docs/sample.doc";
		const content = await convertDocToAdoc(docPath);

		assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
		assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header");
	});
});
