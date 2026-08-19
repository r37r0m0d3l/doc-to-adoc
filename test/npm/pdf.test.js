import assert from "node:assert";
import { describe, test } from "node:test";
import { convert } from "../../dist/index.js";

describe("NPM: PDF to AsciiDoc", () => {
	test("should convert PDF file to AsciiDoc via the public API", async () => {
		const pdfPath = "test/docs/sample.pdf";
		const content = await convert({ input: pdfPath });

		assert.ok(content.includes("= Sample PDF"), "Missing title");
		assert.ok(content.includes("Created for testing PDFObject"), "Missing content text");
		assert.ok(content.includes("Lorem ipsum dolor sit amet"), "Missing lorem ipsum text");
	});
});
