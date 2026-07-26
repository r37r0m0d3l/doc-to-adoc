import assert from "node:assert";
import { describe, test } from "node:test";
import { cleanupOutputFile, readOutputFile } from "../test_helper.js";
import { runCLI } from "./cli_helper.js";

describe("CLI: DOCX to AsciiDoc", () => {
	const docxPath = "test/docs/sample.docx";
	const outputPath = "test/output/sample_docx.adoc";

	test("should convert sample.docx to AsciiDoc via CLI", () => {
		try {
			const result = runCLI([docxPath, outputPath]);
			assert.strictEqual(result.status, 0, `CLI failed: ${result.stderr}`);

			const content = readOutputFile(outputPath);

			// Basic verification of converted content
			assert.ok(content.includes("Document Metadata & Attributes"), "Missing section header 1");
			assert.ok(content.includes("Text Formatting & Inline Elements"), "Missing section header 2");
			assert.ok(content.includes("Basic Styles"), "Missing subsection header");

			assert.ok(content.includes("*Bold Text*"), "Missing bold text");
			assert.ok(content.includes("_Italic Text_"), "Missing italic text");

			assert.ok(content.includes("Note"), "Missing Note admonition");
			assert.ok(content.includes("Warning"), "Missing Warning admonition");
			assert.ok(content.includes("First level item A"), "Missing list item");

			assert.ok(content.includes("John Doe"), "Missing author name");
		} finally {
			cleanupOutputFile(outputPath);
		}
	});
});
