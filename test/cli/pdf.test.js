import assert from "node:assert";
import { describe, test } from "node:test";
import { cleanupOutputFile, readOutputFile } from "../test_helper.js";
import { runCLI } from "./cli_helper.js";

describe("CLI: PDF to AsciiDoc", () => {
	const pdfPath = "test/docs/sample.pdf";
	const outputPath = "test/output/sample_pdf.adoc";

	test("should convert sample.pdf to AsciiDoc via CLI", () => {
		try {
			const result = runCLI([pdfPath, outputPath]);
			assert.strictEqual(result.status, 0, `CLI failed: ${result.stderr}`);

			const content = readOutputFile(outputPath);

			assert.ok(content.includes("= Sample PDF"), "Missing title");
			assert.ok(content.includes("Created for testing PDFObject"), "Missing content text");
			assert.ok(content.includes("Lorem ipsum dolor sit amet"), "Missing lorem ipsum text");
			assert.ok(content.includes("-- 1 of 3 --"), "Missing page 1 footer");
			assert.ok(content.includes("-- 2 of 3 --"), "Missing page 2 footer");
			assert.ok(content.includes("-- 3 of 3 --"), "Missing page 3 footer");
		} finally {
			cleanupOutputFile(outputPath);
		}
	});
});
