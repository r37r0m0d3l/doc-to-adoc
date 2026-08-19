import assert from "node:assert";
import { describe, test } from "node:test";
import { cleanupOutputFile, readOutputFile } from "../test_helper.js";
import { runCLI } from "./cli_helper.js";

describe("CLI: Image to AsciiDoc via OCR", () => {
	const imgPath = "test/docs/sample.png";
	const outputPath = "test/output/sample_img.adoc";

	test("should convert sample.png to AsciiDoc via CLI", () => {
		try {
			const result = runCLI([imgPath, outputPath]);
			assert.strictEqual(result.status, 0, `CLI failed: ${result.stderr}`);

			const content = readOutputFile(outputPath);

			assert.ok(content.length > 0, "Output file is empty");
			assert.ok(
				content.includes("Sample PDF") || content.includes("PDFObject") || content.includes("testing"),
				"Missing OCR text from image",
			);
		} finally {
			cleanupOutputFile(outputPath);
		}
	});
});
