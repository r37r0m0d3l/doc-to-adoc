import assert from "node:assert";
import fs from "node:fs/promises";
import { describe, test } from "node:test";
import { convertRtfToAdoc, extractTextFromRtf, getAdocContent } from "../../dist/index.js";

describe("NPM: RTF to AsciiDoc (via getAdocContent and convertRtfToAdoc)", () => {
	test("should convert sample.rtf to AsciiDoc via getAdocContent", async () => {
		const rtfPath = "test/docs/sample.rtf";
		const content = await getAdocContent(rtfPath, ".rtf");

		assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
		assert.ok(content.includes("Document Metadata"), "Missing section header fragment");
	});

	test("should convert sample.rtf to AsciiDoc via convertRtfToAdoc", async () => {
		const rtfPath = "test/docs/sample.rtf";
		const content = await convertRtfToAdoc(rtfPath);

		assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
		assert.ok(content.includes("Document Metadata"), "Missing section header fragment");
	});

	test("should extract readable fallback text when pandoc is unavailable", async () => {
		const rtfPath = "test/docs/sample.rtf";
		const content = await convertRtfToAdoc(rtfPath, { usePandoc: false });

		assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
		assert.ok(content.includes("Document Metadata"), "Missing section header fragment");
		assert.ok(!content.includes("{\\rtf1"), "Fallback should not leak raw RTF markup");
	});

	test("should extract readable text directly from raw RTF markup", async () => {
		const source = await fs.readFile("test/docs/sample.rtf", "latin1");
		const content = extractTextFromRtf(source);

		assert.ok(content.includes("AsciiDoc Comprehensive Feature Test Suite"), "Missing main title");
		assert.ok(content.includes("Abstract Block"), "Missing expected body content");
		assert.ok(!content.includes("\\fonttbl"), "Parser should strip formatting tables");
	});
});
