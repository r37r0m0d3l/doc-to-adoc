import assert from "node:assert";
import { describe, test } from "node:test";
import { convert } from "../../dist/index.js";

describe("NPM: DOCX to AsciiDoc", () => {
	test("should convert DOCX file to AsciiDoc", async () => {
		const docxPath = "test/docs/sample.docx";
		const content = await convert({ input: docxPath });

		assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header 1");
		assert.ok(content.includes("Text Formatting & Inline Elements"), "Missing section header 2");
		assert.ok(content.includes("*Bold Text*"), "Missing bold text");
		assert.ok(content.includes("_Italic Text_"), "Missing italic text");
	});

	test("should convert DOCX file to Markdown via the public API", async () => {
		const docxPath = "test/docs/sample.docx";
		const markdown = await convert({ input: docxPath, type: "markdown" });
		assert.ok(markdown.includes("Document Metadata & Attributes"), "Missing markdown header");
	});
});
