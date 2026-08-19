import assert from "node:assert";
import fs from "node:fs";
import { describe, test } from "node:test";
import { convert, convertImageToAdoc, convertPdfToAdoc, recognizeImage } from "../../dist/index.js";

describe("NPM: OCR Integration & Image Parsing", () => {
	test("should extract text from standalone PNG image buffer using recognizeImage", async () => {
		const imageBuffer = fs.readFileSync("test/docs/sample.png");
		const text = await recognizeImage(imageBuffer);
		assert.ok(text.length > 0, "OCR result should not be empty");
		assert.ok(text.includes("Sample PDF") || text.includes("PDFObject"), "OCR text should recognize sample text");
	});

	test("should convert PNG image buffer to clean AsciiDoc", async () => {
		const imageBuffer = fs.readFileSync("test/docs/sample.png");
		const adoc = await convertImageToAdoc(imageBuffer);
		assert.ok(adoc.length > 0, "AsciiDoc result should not be empty");
		assert.ok(adoc.includes("Sample PDF") || adoc.includes("PDFObject"), "AsciiDoc should include OCR text");
	});

	test("should convert image file via convert() API", async () => {
		const adoc = await convert({ input: "test/docs/sample.png" });
		assert.ok(adoc.length > 0, "Convert result should not be empty");
		assert.ok(adoc.includes("Sample PDF") || adoc.includes("PDFObject"), "Convert should return OCR text");
	});

	test("should support OCR fallback for PDF buffers", async () => {
		const pdfBuffer = fs.readFileSync("test/docs/sample.pdf");
		const text = await convertPdfToAdoc(pdfBuffer, { enableOcr: true });
		assert.ok(text.length > 0, "PDF text extraction should return non-empty text");
		assert.ok(text.includes("Sample PDF"), "PDF text should contain title/content");
	});
});
