import assert from "node:assert";
import { describe, test } from "node:test";
import { convert } from "../../dist/index.js";

describe("NPM: OCR Integration & Image Parsing", () => {
	test("should convert image file via convert() API", async () => {
		const adoc = await convert({ input: "test/docs/sample.png" });
		assert.ok(adoc.length > 0, "Convert result should not be empty");
		assert.ok(adoc.includes("Sample PDF") || adoc.includes("PDFObject"), "Convert should return OCR text");
	});

	test("should support OCR fallback for PDF files via the public API", async () => {
		const text = await convert({ input: "test/docs/sample.pdf" });
		assert.ok(text.length > 0, "PDF text extraction should return non-empty text");
		assert.ok(text.includes("Sample PDF"), "PDF text should contain title/content");
	});
});
