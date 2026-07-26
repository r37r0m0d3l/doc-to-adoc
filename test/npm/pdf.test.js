import assert from "node:assert";
import fs from "node:fs";
import { describe, test } from "node:test";
import { convertPdfToAdoc } from "../../bin/converter.js";

describe("NPM: PDF to AsciiDoc", () => {
	test("should convert PDF buffer to AsciiDoc", async () => {
		const pdfPath = "test/docs/sample.pdf";
		const buffer = fs.readFileSync(pdfPath);
		const content = await convertPdfToAdoc(buffer);

		assert.ok(content.includes("= Sample PDF"), "Missing title");
		assert.ok(content.includes("Created for testing PDFObject"), "Missing content text");
		assert.ok(content.includes("Lorem ipsum dolor sit amet"), "Missing lorem ipsum text");
	});
});
