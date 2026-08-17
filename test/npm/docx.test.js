import assert from "node:assert";
import fs from "node:fs";
import { describe, test } from "node:test";
import { convertDocxToAdoc, convertDocxToHtml, convertDocxToMarkdown } from "../../dist/index.js";

describe("NPM: DOCX to AsciiDoc", () => {
	test("should convert DOCX buffer to AsciiDoc", async () => {
		const docxPath = "test/docs/sample.docx";
		const buffer = fs.readFileSync(docxPath);
		const content = await convertDocxToAdoc(buffer);

		assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header 1");
		assert.ok(content.includes("Text Formatting & Inline Elements"), "Missing section header 2");
		assert.ok(content.includes("*Bold Text*"), "Missing bold text");
		assert.ok(content.includes("_Italic Text_"), "Missing italic text");
	});

	test("should convert DOCX buffer to HTML and Markdown", async () => {
		const docxPath = "test/docs/sample.docx";
		const buffer = fs.readFileSync(docxPath);
		const html = await convertDocxToHtml(buffer);
		assert.ok(html.includes("<p>"), "Missing HTML paragraphs");

		const markdown = await convertDocxToMarkdown(buffer);
		assert.ok(markdown.includes("Document Metadata & Attributes"), "Missing markdown header");
	});
});
